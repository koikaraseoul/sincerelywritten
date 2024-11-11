import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatInTimeZone } from 'date-fns-tz';

interface SentenceFormProps {
  dailySentence: string;
  hasWrittenToday: boolean;
  setHasWrittenToday: (value: boolean) => void;
}

const SentenceForm = ({ dailySentence, hasWrittenToday, setHasWrittenToday }: SentenceFormProps) => {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!content.trim() || hasWrittenToday) return;
    
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please login to save your reflection",
        });
        return;
      }

      const now = new Date();
      const localTimestamp = formatInTimeZone(
        now,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        "yyyy-MM-dd'T'HH:mm:ssXXX"
      );

      const { error } = await supabase
        .from("sentences")
        .insert({
          content: content.trim(),
          user_id: user.id,
          daily_sentence: dailySentence,
          created_at: localTimestamp
        });

      if (error) throw error;

      toast({
        title: "Saved!",
        description: "Your journal is now part of your journey.",
      });

      setContent("");
      setHasWrittenToday(true);
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save your reflection",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={"What personal experiences or emotions come to mind when you read this sentence, and why?\n(You can write one journal entry a day to capture your reflections.)"}
          className="min-h-[200px] resize-y text-lg whitespace-pre-wrap pt-14"
          disabled={isLoading || hasWrittenToday}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSave}
          className="absolute top-4 right-4"
          disabled={!content.trim() || isLoading || hasWrittenToday}
        >
          <Mail className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default SentenceForm;