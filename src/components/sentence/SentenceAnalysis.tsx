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
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data.error) {
        console.log('Analysis error response:', { code: data.code, error: data.error });
        
        if (data.code === 'OPENAI_QUOTA_EXCEEDED') {
          toast({
            variant: "destructive",
            title: "Analysis Temporarily Unavailable",
            description: "Our AI analysis service is experiencing high demand. Your entries are saved and will be analyzed later.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Analysis Error",
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