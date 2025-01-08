import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SentenceAnalysisProps {
  userId: string;
  userEmail: string;
}

export const SentenceAnalysis = ({ userId, userEmail }: SentenceAnalysisProps) => {
  const { toast } = useToast();

  const triggerAnalysis = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-entries', {
        body: { userId, email: userEmail }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        if (data.code === 'OPENAI_QUOTA_EXCEEDED') {
          toast({
            variant: "destructive",
            title: "Analysis Unavailable",
            description: "The AI analysis service is temporarily unavailable. Please try again later.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: data.error,
          });
        }
        return;
      }

      // Only show success toast if an analysis was actually generated
      if (data.success && data.message !== 'No analysis needed yet') {
        toast({
          title: "Analysis Complete",
          description: "Your journal entries have been analyzed successfully.",
        });
      }
    } catch (error) {
      console.error('Error triggering analysis:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to analyze entries. Please try again later.",
      });
    }
  };

  return { triggerAnalysis };
};