import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { addDays, isBefore } from "date-fns";

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

      if (data) {
        toast({
          title: "Daily Entry Limit Reached",
          description: "You've already submitted a question. Please wait 7 days before asking another one.",
        });
      }
      
      return data;
    },
    enabled: !!session?.user.id,
  });

  const canAskQuestion = !lastQuestion?.created_at || 
    isBefore(new Date(lastQuestion.created_at), addDays(new Date(), -7));

  const getRemainingDays = () => {
    if (!lastQuestion?.created_at) return 0;
    const lastDate = new Date(lastQuestion.created_at);
    const nextAvailableDate = addDays(lastDate, 7);
    const today = new Date();
    const diffTime = nextAvailableDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSubmit = async () => {
    if (!question.trim() || !canAskQuestion || !session?.user.id) return;

    setIsSubmitting(true);
    try {
      const { error: questionError } = await supabase
        .from("questions")
        .insert({
          content: question.trim(),
          user_id: session.user.id,
          status: 'pending'
        });

      if (questionError) throw questionError;

      toast({
        title: "Question submitted",
        description: "Under interpreting by the Love Journey Tarot Decks, It will soon reach to you.",
      });

      setQuestion("");
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