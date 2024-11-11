import { useState } from "react";
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

  const { data: lastQuestion, isLoading: isLoadingLastQuestion } = useQuery({
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

  const canAskQuestion = !lastQuestion?.created_at || 
    isBefore(parseISO(lastQuestion.created_at), addDays(new Date(), -7));

  // Show toast on every page load if user can't ask questions
  useQuery({
    queryKey: ["checkRestriction", lastQuestion?.created_at, Date.now()], // Add Date.now() to force re-fetch
    queryFn: async () => {
      if (lastQuestion?.created_at && !canAskQuestion) {
        const nextAvailableDate = addDays(parseISO(lastQuestion.created_at), 7);
        const daysRemaining = Math.ceil(
          (nextAvailableDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        
        toast({
          title: "Weekly Entry Limit Reached",
          description: `You can submit another question in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}.`,
        });
      }
      return null;
    },
    enabled: !!lastQuestion?.created_at,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    gcTime: 0, // Using gcTime instead of cacheTime
    staleTime: 0,
  });

  const handleSubmit = async () => {
    if (!question.trim() || !session?.user.id) return;
    
    // Double-check the time restriction before submitting
    if (!canAskQuestion) {
      toast({
        variant: "destructive",
        title: "Weekly Entry Limit Reached",
        description: "Please wait one week between submissions.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const localTimestamp = formatInTimeZone(now, Intl.DateTimeFormat().resolvedOptions().timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX");

      const { error: questionError } = await supabase
        .from("questions")
        .insert({
          content: question.trim(),
          user_id: session.user.id,
          status: 'pending',
          created_at: localTimestamp
        });

      if (questionError) throw questionError;

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

  if (isLoadingLastQuestion) {
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
            disabled={!question.trim() || isSubmitting || !canAskQuestion}
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
            placeholder={`What do you wonder about your relationships?\n(After submitting your questions, please wait one week before asking more.)`}
            className="min-h-[200px] resize-y text-lg whitespace-pre-wrap"
            disabled={isSubmitting || !canAskQuestion}
          />
        </div>
      </div>
    </div>
  );
};

export default Question;