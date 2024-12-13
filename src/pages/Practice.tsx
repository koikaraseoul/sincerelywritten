import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { startOfWeek, endOfWeek } from "date-fns";
import WriteInputLayout from "@/components/write/WriteInputLayout";

const PRACTICE_DRAFT_KEY = 'practice_draft';

const Practice = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [actionTaken, setActionTaken] = useState(() => {
    const draft = localStorage.getItem(PRACTICE_DRAFT_KEY);
    if (draft) {
      try {
        const { actionTaken } = JSON.parse(draft);
        return actionTaken || "";
      } catch (e) {
        console.error('Error parsing draft:', e);
        return "";
      }
    }
    return "";
  });
  const [reflection, setReflection] = useState(() => {
    const draft = localStorage.getItem(PRACTICE_DRAFT_KEY);
    if (draft) {
      try {
        const { reflection } = JSON.parse(draft);
        return reflection || "";
      } catch (e) {
        console.error('Error parsing draft:', e);
        return "";
      }
    }
    return "";
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasWrittenThisWeek, setHasWrittenThisWeek] = useState(false);

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
      console.log('Session fetched successfully for user:', session.user.email);
      return session;
    },
  });

  const { data: analyses, isLoading: analysesLoading } = useQuery({
    queryKey: ["analyses"],
    queryFn: async () => {
      console.log('Fetching analyses...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found for analyses fetch');
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from("analyses")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error('Analyses fetch error:', error);
        throw error;
      }
      console.log('Analyses fetched successfully, count:', data?.length);
      return data;
    }
  });

  const { data: weeklyPractice, isLoading: practiceLoading } = useQuery({
    queryKey: ["weekly-practice"],
    queryFn: async () => {
      console.log('Checking weekly practice entries...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found for weekly practice check');
        throw new Error("Not authenticated");
      }

      const start = startOfWeek(new Date());
      const end = endOfWeek(new Date());

      console.log('Checking practice entries between:', start, 'and', end);

      const { data, error } = await supabase
        .from("practices")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      if (error) {
        console.error('Weekly practice fetch error:', error);
        throw error;
      }
      console.log('Weekly practice entries found:', data?.length);
      return data;
    }
  });

  useEffect(() => {
    if (!practiceLoading && weeklyPractice) {
      const hasWritten = weeklyPractice.length > 0;
      setHasWrittenThisWeek(hasWritten);
      
      if (hasWritten) {
        toast({
          title: "Journey Continues Next Week",
          description: "You've made great strides this week. See you next week to take the next step.",
          duration: 5000,
        });
      }
    }
  }, [weeklyPractice, practiceLoading, toast]);

  useEffect(() => {
    if (!analysesLoading && (!analyses || analyses.length === 0)) {
      toast({
        title: "Practice not available yet",
        description: "You can write a practice entry after your journals are analyzed.",
        duration: 5000,
      });
    }
  }, [analyses, analysesLoading, toast]);

  // Save draft to localStorage whenever content changes
  useEffect(() => {
    if ((actionTaken || reflection) && !hasWrittenThisWeek) {
      const draft = JSON.stringify({ actionTaken, reflection });
      localStorage.setItem(PRACTICE_DRAFT_KEY, draft);
      console.log('Saved practice draft to localStorage');
    }
  }, [actionTaken, reflection, hasWrittenThisWeek]);

  // Clear draft if user has already written this week
  useEffect(() => {
    if (hasWrittenThisWeek) {
      localStorage.removeItem(PRACTICE_DRAFT_KEY);
      console.log('Cleared practice draft - already written this week');
    }
  }, [hasWrittenThisWeek]);

  const handleSave = async () => {
    console.log('Starting practice submission process...');
    
    if (!actionTaken.trim() || !reflection.trim()) {
      console.log('Submission blocked: empty fields');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in both fields before saving",
      });
      return;
    }

    if (hasWrittenThisWeek) {
      console.log('Submission blocked: already written this week');
      toast({
        variant: "destructive",
        title: "Weekly limit reached",
        description: "You can write one practice entry per week. Please try again next week.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user found, redirecting to login');
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please login to save your practice",
        });
        navigate("/login");
        return;
      }

      console.log('Preparing submission with:', {
        userId: user.id,
        email: user.email,
        actionLength: actionTaken.trim().length,
        reflectionLength: reflection.trim().length
      });

      const { error } = await supabase
        .from('practices')
        .insert({
          user_id: user.id,
          action_taken: actionTaken.trim(),
          reflection: reflection.trim(),
          email: user.email // Adding email from session
        });

      if (error) {
        console.error('Save error:', error);
        throw error;
      }

      console.log('Practice entry submitted successfully');
      toast({
        title: "Growth in Progress!",
        description: "Your growth is on track! A new record unlocks each week—take action, reflect, and get ready to share your journey.",
      });

      localStorage.removeItem(PRACTICE_DRAFT_KEY);
      setActionTaken("");
      setReflection("");
      setHasWrittenThisWeek(true);
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save your practice",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const actionPrompt = "How did you turn your insights into action? Share the steps you took clearly—what inspired you and how you made it happen.";
  const reflectionPrompt = "Reflect deeply on your experience—what lessons stood out to you? Share your thoughts vividly, including any emotions or insights that made this moment meaningful.";

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
            onClick={handleSave}
            className="absolute right-0"
            disabled={isLoading || !actionTaken.trim() || !reflection.trim() || (!analyses || analyses.length === 0) || hasWrittenThisWeek}
          >
            <Heart className="h-6 w-6" />
          </Button>
        </div>

        <div className="mt-16">
          <h1 className="text-3xl font-serif mb-8 text-center">
            Your Practices
          </h1>
          
          <div className="space-y-8">
            <WriteInputLayout
              question={actionPrompt}
              answer={actionTaken}
              onAnswerChange={setActionTaken}
              isSubmitting={isLoading || (!analyses || analyses.length === 0) || hasWrittenThisWeek}
            />
            
            <WriteInputLayout
              question={reflectionPrompt}
              answer={reflection}
              onAnswerChange={setReflection}
              isSubmitting={isLoading || (!analyses || analyses.length === 0) || hasWrittenThisWeek}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;
