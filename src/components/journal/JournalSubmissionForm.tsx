import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LetterText } from "lucide-react";
import WriteInputLayout from "@/components/write/WriteInputLayout";
import DailySentenceDisplay from "@/components/DailySentenceDisplay";
import { formatInTimeZone } from 'date-fns-tz';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface JournalSubmissionFormProps {
  dailySentence: string | undefined;
  userId: string;
  hasSubmittedToday: boolean;
  timezone: string;
}

const JournalSubmissionForm = ({ 
  dailySentence, 
  userId, 
  hasSubmittedToday,
  timezone 
}: JournalSubmissionFormProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!content.trim() || !userId || hasSubmittedToday) return;

    setIsSubmitting(true);
    try {
      const now = new Date();
      const localTimestamp = formatInTimeZone(
        now,
        timezone,
        "yyyy-MM-dd'T'HH:mm:ssXXX"
      );

      const { error: sentenceError } = await supabase
        .from("sentences")
        .insert({
          content: content.trim(),
          user_id: userId,
          daily_sentence: dailySentence,
          created_at: localTimestamp
        });

      if (sentenceError) throw sentenceError;

      toast({
        title: "Journal submitted",
        description: "Your thoughts have been saved successfully. Return tomorrow for a fresh reflection.",
      });

      setContent("");
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit journal. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const reflectionPrompt = "What personal experiences or emotions come to mind when you read sentence, and why? Reflect on how it connects to your life, values, or experiences, and let your thoughts flow to uncover new insights or emotions.";

  return (
    <div className="mt-16">
      <h1 className="text-3xl font-serif mb-8 text-center">
        Your Journals
      </h1>

      {dailySentence && <DailySentenceDisplay dailySentence={dailySentence} />}

      <div className="mt-8">
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting || hasSubmittedToday}
          >
            <LetterText className="h-6 w-6" />
          </Button>
        </div>

        <WriteInputLayout
          question={reflectionPrompt}
          answer={content}
          onAnswerChange={setContent}
          isSubmitting={isSubmitting || hasSubmittedToday}
        />
      </div>
    </div>
  );
};

export default JournalSubmissionForm;