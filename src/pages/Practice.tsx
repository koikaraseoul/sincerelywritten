import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { startOfWeek, endOfWeek } from "date-fns";

const Practice = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [actionTaken, setActionTaken] = useState("");
  const [reflection, setReflection] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasWrittenThisWeek, setHasWrittenThisWeek] = useState(false);

  const { data: analyses, isLoading: analysesLoading } = useQuery({
    queryKey: ["analyses"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("analyses")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    }
  });

  const { data: weeklyPractice, isLoading: practiceLoading } = useQuery({
    queryKey: ["weekly-practice"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const start = startOfWeek(new Date());
      const end = endOfWeek(new Date());

      const { data, error } = await supabase
        .from("practices")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      if (error) throw error;
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

  const handleSave = async () => {
    if (!actionTaken.trim() || !reflection.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in both fields before saving",
      });
      return;
    }

    if (hasWrittenThisWeek) {
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
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please login to save your practice",
        });
        navigate("/login");
        return;
      }

      const { error } = await supabase
        .from('practices')
        .insert({
          user_id: user.id,
          action_taken: actionTaken.trim(),
          reflection: reflection.trim(),
        });

      if (error) throw error;

      toast({
        title: "Growth in Progress!",
        description: "Your growth is on track! A new record unlocks each week—take action, reflect, and get ready to share your journey.",
      });

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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto relative">
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
          
          <div className="space-y-6">
            <Textarea
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              placeholder="How did you turn your insights into action? Share the steps you took clearly—what inspired you and how you made it happen."
              className="min-h-[200px] resize-y text-lg whitespace-pre-wrap"
              disabled={isLoading || (!analyses || analyses.length === 0) || hasWrittenThisWeek}
            />
            
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Reflect deeply on your experience—what lessons stood out to you? Share your thoughts vividly, including any emotions or insights that made this moment meaningful."
              className="min-h-[200px] resize-y text-lg whitespace-pre-wrap"
              disabled={isLoading || (!analyses || analyses.length === 0) || hasWrittenThisWeek}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;