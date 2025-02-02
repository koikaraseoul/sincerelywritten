import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { formatInTimeZone } from 'date-fns-tz';
import { startOfDay, endOfDay } from 'date-fns';
import WriteInputLayout from "@/components/write/WriteInputLayout";
import SentenceHeader from "@/components/sentence/SentenceHeader";
import SubmittedMessage from "@/components/sentence/SubmittedMessage";
import { useSessionCheck } from "@/hooks/useSessionCheck";

const DRAFT_KEY = 'sentence_draft';

const Sentence = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [content, setContent] = useState(() => {
    return localStorage.getItem(DRAFT_KEY) || "";
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmittedLocally, setHasSubmittedLocally] = useState(false);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const currentDate = formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');

  // Use the session check hook
  useSessionCheck();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      console.log('Fetching session data...');
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session fetch error:', error);
        navigate("/login");
        return null;
      }
      if (!session) {
        console.log('No active session found, redirecting to login');
        navigate("/login");
        return null;
      }
      console.log('Session fetched successfully:', {
        userId: session.user.id,
        userEmail: session.user.email,
        timestamp: new Date().toISOString()
      });
      return session;
    },
  });

  const { data: dailySentence } = useQuery({
    queryKey: ["dailySentence", currentDate],
    queryFn: async () => {
      console.log('Fetching daily sentence for date:', currentDate);
      const { data, error } = await supabase
        .from("daily_sentences")
        .select("content")
        .eq("active_date", currentDate)
        .single();

      if (error) {
        console.error('Daily sentence fetch error:', error);
        throw error;
      }
      console.log('Daily sentence fetched successfully:', data?.content);
      return data?.content;
    },
  });

  const { data: hasSubmittedToday, refetch: refetchSubmissionStatus } = useQuery({
    queryKey: ["todayEntry", session?.user.id, currentDate],
    queryFn: async () => {
      if (!session?.user.id) {
        console.log('No user ID available for submission check');
        return false;
      }

      const now = new Date();
      const start = startOfDay(now);
      const end = endOfDay(now);

      console.log('Checking for today\'s entry between:', start, 'and', end);

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

      console.log('Found entries for today:', data?.length || 0);
      return data && data.length > 0;
    },
    enabled: !!session?.user.id,
  });

  useEffect(() => {
    if (content && !hasSubmittedToday && !hasSubmittedLocally) {
      localStorage.setItem(DRAFT_KEY, content);
      console.log('Saved draft to localStorage');
    }
  }, [content, hasSubmittedToday, hasSubmittedLocally]);

  useEffect(() => {
    if (hasSubmittedToday || hasSubmittedLocally) {
      localStorage.removeItem(DRAFT_KEY);
      console.log('Cleared draft from localStorage after submission');
    }
  }, [hasSubmittedToday, hasSubmittedLocally]);

  useEffect(() => {
    if (hasSubmittedToday) {
      setHasSubmittedLocally(true);
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [hasSubmittedToday]);

  const handleSubmit = async () => {
    console.log('Starting journal submission process...');
    
    if (!content.trim() || !session?.user.id || hasSubmittedToday || hasSubmittedLocally) {
      console.log('Submission blocked:', {
        hasContent: !!content.trim(),
        hasSession: !!session?.user.id,
        hasSubmittedToday,
        hasSubmittedLocally
      });
      return;
    }

    // Verify session and email before submission
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession || !currentSession.user.email) {
      console.error('Invalid session state:', {
        hasSession: !!currentSession,
        hasEmail: !!currentSession?.user.email,
        timestamp: new Date().toISOString()
      });
      toast({
        variant: "destructive",
        title: "Session Error",
        description: "Your session has expired. Please refresh the page and try again.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const localTimestamp = formatInTimeZone(
        now,
        timezone,
        "yyyy-MM-dd'T'HH:mm:ssXXX"
      );

      console.log('Preparing submission with:', {
        timestamp: localTimestamp,
        userEmail: currentSession.user.email,
        contentLength: content.trim().length
      });

      const { error: sentenceError } = await supabase
        .from("sentences")
        .insert({
          content: content.trim(),
          user_id: currentSession.user.id,
          daily_sentence: dailySentence,
          created_at: localTimestamp,
          email: currentSession.user.email
        });

      if (sentenceError) {
        throw sentenceError;
      }

      console.log('Journal entry submitted successfully');
      setHasSubmittedLocally(true);
      await refetchSubmissionStatus();
      
      toast({
        title: "Journal submitted",
        description: "Your thoughts have been saved successfully.",
      });

      localStorage.removeItem(DRAFT_KEY);
      setContent("");
    } catch (error: any) {
      console.error('Submission error:', error);
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

  if (hasSubmittedToday || hasSubmittedLocally) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-2xl mx-auto relative">
          <SentenceHeader 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            hasSubmittedToday={true}
            content={content}
          />
          <SubmittedMessage />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-2xl mx-auto relative">
        <SentenceHeader 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          hasSubmittedToday={hasSubmittedToday || hasSubmittedLocally}
          content={content}
        />

        <div className="mt-16">
          <h1 className="text-3xl font-serif mb-8 text-center">
            Your Journals
          </h1>

          <div className="mt-8">
            <WriteInputLayout
              question={reflectionPrompt}
              answer={content}
              onAnswerChange={setContent}
              isSubmitting={isSubmitting || hasSubmittedLocally}
              dailySentence={dailySentence}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sentence;