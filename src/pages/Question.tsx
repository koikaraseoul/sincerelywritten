import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { addDays, isBefore, parseISO } from "date-fns";
import { formatInTimeZone } from 'date-fns-tz';
import WriteInputLayout from "@/components/write/WriteInputLayout";

const QUESTION_DRAFT_KEY = 'question_draft';

const Question = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [question, setQuestion] = useState(() => {
    // Initialize content from localStorage if available
    const draft = localStorage.getItem(QUESTION_DRAFT_KEY);
    console.log('Retrieved question draft:', draft);
    return draft || "";
  });
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

  // Save draft to localStorage whenever content changes
  useEffect(() => {
    if (question && !hasSubmittedRecently) {
      localStorage.setItem(QUESTION_DRAFT_KEY, question);
      console.log('Saved question draft to localStorage');
    }
  }, [question, hasSubmittedRecently]);

  // Clear draft if user has submitted recently
  useEffect(() => {
    if (hasSubmittedRecently) {
      localStorage.removeItem(QUESTION_DRAFT_KEY);
      console.log('Cleared question draft - already submitted recently');
    }
  }, [hasSubmittedRecently]);

  const checkCooldownPeriod = () => {
    if (lastQuestion?.created_at) {
      const cooldownPeriod = addDays(parseISO(lastQuestion.created_at), 4);
      const isInCooldown = !isBefore(cooldownPeriod, new Date());
      setHasSubmittedRecently(isInCooldown);

      if (isInCooldown) {
        localStorage.removeItem(QUESTION_DRAFT_KEY); // Clear draft if in cooldown
        toast({
          title: "Take a Breather",
          description: "Your next question will be available in a few days.",
        });
      }
    }
  };

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

      console.log('Submitting question with user email:', session.user.email);

      const { error: questionError } = await supabase
        .from("questions")
        .insert({
          content: question.trim(),
          user_id: session.user.id,
          status: 'pending',
          created_at: localTimestamp,
          email: session.user.email
        });

      if (questionError) {
        console.error('Error submitting question:', questionError);
        throw questionError;
      }

      await refetchLastQuestion();
      setHasSubmittedRecently(true);
      localStorage.removeItem(QUESTION_DRAFT_KEY); // Clear draft after successful submission
      
      toast({
        title: "Question submitted",
        description: "Under interpreting by the Love Journey Tarot Decks, It will soon reach to you.",
      });

      setQuestion("");
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit question. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const questionPrompt = "What do you wonder about your relationships? Share your sincere thoughts and questions to reveal profound insights and meaningful guidance.";

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

          <WriteInputLayout
            question={questionPrompt}
            answer={question}
            onAnswerChange={setQuestion}
            isSubmitting={isSubmitting || hasSubmittedRecently}
          />
        </div>
      </div>
    </div>
  );
};

export default Question;