import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import ReviewHeader from "@/components/review/ReviewHeader";
import ReviewEntries from "@/components/review/ReviewEntries";

interface Entry {
  id: string;
  content: string;
  created_at: string;
  daily_sentence: string;
}

const Review = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [sentenceDates, setSentenceDates] = useState<string[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSentenceDates = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        const { data: sentences, error } = await supabase
          .from('sentences')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const dates = sentences.map(s => format(new Date(s.created_at), 'yyyy-MM-dd'));
        setSentenceDates([...new Set(dates)]);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch sentence dates",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSentenceDates();
  }, [navigate, toast]);

  useEffect(() => {
    const fetchEntries = async () => {
      if (!date) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const { data: sentences, error } = await supabase
          .from('sentences')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (sentences) {
          setEntries(sentences);
        } else {
          setEntries([]);
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch entries",
        });
      }
    };

    fetchEntries();
  }, [date, toast]);

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-2xl mx-auto relative">
        <ReviewHeader
          date={date}
          setDate={setDate}
          navigate={navigate}
          sentenceDates={sentenceDates}
        />
        <ReviewEntries entries={entries} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Review;