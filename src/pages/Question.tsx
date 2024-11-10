import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
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

  const { data: profile } = useQuery({
    queryKey: ["profile", session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("last_question_date")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user.id,
  });

  const canAskQuestion = !profile?.last_question_date || 
    isBefore(new Date(profile.last_question_date), addDays(new Date(), -7));

  const handleSubmit = async () => {
    if (!question.trim() || !canAskQuestion) return;

    setIsSubmitting(true);
    try {
      if (!session?.user.id) {
        navigate("/login");
        return;
      }

      // Start a transaction to update both tables
      const { error: questionError } = await supabase
        .from("questions")
        .insert({
          content: question.trim(),
          user_id: session.user.id,
          status: 'pending'
        });

      if (questionError) throw questionError;

      // Update the last question date
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ last_question_date: new Date().toISOString() })
        .eq("id", session.user.id);

      if (profileError) throw profileError;

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

          {!canAskQuestion && (
            <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-md text-center">
              You can ask another question after 7 days from your last question.
            </div>
          )}

          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What do you wonder about your relationships?"
            className="min-h-[200px] resize-none bg-background border-input text-lg"
            disabled={isSubmitting || !canAskQuestion}
          />
        </div>
      </div>
    </div>
  );
};

export default Question;