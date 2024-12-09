import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { formatInTimeZone } from 'date-fns-tz';
import { startOfDay, endOfDay } from 'date-fns';
import WriteInputLayout from "@/components/write/WriteInputLayout";
import DailySentenceDisplay from "@/components/DailySentenceDisplay";

const Sentence = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [content, setContent] = useState("");
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

  const { data: dailySentence } = useQuery({
    queryKey: ["dailySentence"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_sentences")
        .select("content")
        .eq("active_date", new Date().toISOString().split("T")[0])
        .single();

      if (error) throw error;
      return data?.content;
    },
  });

  // Check if user has already submitted a journal entry today
  const { data: hasSubmittedToday } = useQuery({
    queryKey: ["todayEntry", session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return false;

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const now = new Date();
      const start = startOfDay(now);
      const end = endOfDay(now);

      const { data, error } = await supabase
        .from("sentences")
        .select("id")
        .eq("user_id", session.user.id)
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .limit(1);

      if (error) {
        console.error("Error checking today's entry:", error);
        return false;
      }

      return data && data.length > 0;
    },
    enabled: !!session?.user.id,
  });

  const handleSubmit = async () => {
    if (!content.trim() || !session?.user.id || hasSubmittedToday) return;

    setIsSubmitting(true);
    try {
      const now = new Date();
      const localTimestamp = formatInTimeZone(
        now,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        "yyyy-MM-dd'T'HH:mm:ssXXX"
      );

      const { error: sentenceError } = await supabase
        .from("sentences")
        .insert({
          content: content.trim(),
          user_id: session.user.id,
          daily_sentence: dailySentence,
          created_at: localTimestamp
        });

      if (sentenceError) throw sentenceError;

      toast({
        title: "Journal submitted",
        description: "Your thoughts have been saved successfully.",
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

  if (!session) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      Loading...
    </div>;
  }

  const reflectionPrompt = "What personal experiences or emotions come to mind when you read sentence, and why? Reflect on how it connects to your life, values, or experiences, and let your thoughts flow to uncover new insights or emotions.";

  // Show message if user has already submitted today
  if (hasSubmittedToday) {
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
          </div>

          <div className="mt-16">
            <h1 className="text-3xl font-serif mb-8 text-center">
              Your Journals
            </h1>
            
            <p className="text-love-400 text-lg italic text-center mb-8">
              Moving forward means leaving behind words that no longer serve love.
            </p>

            <div className="p-6 bg-card rounded-lg text-center text-muted-foreground">
              You've already shared your thoughts for today. Return tomorrow for a fresh reflection.
            </div>
          </div>
        </div>
      </div>
    );
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
            disabled={!content.trim() || isSubmitting || hasSubmittedToday}
          >
            <Wand2 className="h-6 w-6" />
          </Button>
        </div>

        <div className="mt-16">
          <h1 className="text-3xl font-serif mb-8 text-center">
            Your Journals
          </h1>

          {dailySentence && <DailySentenceDisplay dailySentence={dailySentence} />}

          <div className="mt-8">
            <WriteInputLayout
              question={reflectionPrompt}
              answer={content}
              onAnswerChange={setContent}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sentence;