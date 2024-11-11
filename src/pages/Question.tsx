import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { addDays, isBefore, parseISO } from "date-fns";
import { formatInTimeZone } from 'date-fns-tz';

const Question = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmittedRecently, setHasSubmittedRecently] = useState(false);

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        navigate("/login");
        return null;
      }
      return session;
    },
  });

  const { data: lastQuestion, refetch: refetchLastQuestion } = useQuery({
    queryKey: ["lastQuestion", session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return null;
      const { data, error } = await supabase
        .from("questions")
        .select("created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!session?.user.id,
  });

  const checkCooldownPeriod = () => {
    if (lastQuestion?.created_at) {
      const cooldownPeriod = addDays(parseISO(lastQuestion.created_at), 4);
      const isInCooldown = !isBefore(cooldownPeriod, new Date());
      setHasSubmittedRecently(isInCooldown);

      if (isInCooldown) {
        toast({
          title: "Take a Breather",
          description: "Your next question will be available in a few days.",
        });
      }
    }
  };

  // Check cooldown period on mount and when lastQuestion changes
  useEffect(() => {
    checkCooldownPeriod();
  }, [lastQuestion?.created_at]);

  const handleSubmit = async () => {
    if (!question.trim() || !session?.user.id || hasSubmittedRecently) return;

    setIsSubmitting(true);
    try {
      const now = new Date();
      const localTimestamp = formatInTimeZone(
        now, 
        Intl.DateTimeFormat().resolvedOptions().timeZone, 
        "yyyy-MM-dd'T'HH:mm:ssXXX"
      );

      const { error: questionError } = await supabase
        .from("questions")
        .insert({
          content: question.trim(),
          user_id: session.user.id,
          status: 'pending',
          created_at: localTimestamp
        });

      if (questionError) throw questionError;

      // Refetch last question to update the cooldown state
      await refetchLastQuestion();
      setHasSubmittedRecently(true);
      
      toast({
        title: "Question submitted",
        description: "Under interpreting by the Love Journey Tarot Decks, It will soon reach to you.",
      });

      setQuestion("");
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit question. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      Loading...
    </div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-2xl mx-auto relative">
        <div className="flex justify-between items-center mb-8 pt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="absolute left-0"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSubmit}
            className="absolute right-0"
            disabled={!question.trim() || isSubmitting || hasSubmittedRecently}
          >
            <Wand2 className="h-6 w-6" />
          </Button>
        </div>

        <div className="mt-16">
          <h1 className="text-3xl font-serif mb-8 text-center">
            Your Questions
          </h1>

          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={`What do you wonder about your relationships?\n(After submitting your questions, please wait 4 days before asking more.)`}
            className="min-h-[200px] resize-y text-lg whitespace-pre-wrap"
            disabled={isSubmitting || hasSubmittedRecently}
          />
        </div>
      </div>
    </div>
  );
};

export default Question;