import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatInTimeZone } from 'date-fns-tz';

export const useDailySentence = () => {
  const { toast } = useToast();
  const [dailySentence, setDailySentence] = useState("");

  useEffect(() => {
    const fetchDailySentence = async () => {
      const localDate = formatInTimeZone(
        new Date(),
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        'yyyy-MM-dd'
      );

      const { data, error } = await supabase
        .from('daily_sentences')
        .select('content')
        .eq('active_date', localDate)
        .single();

      if (error) {
        console.error('Error fetching daily sentence:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load today's sentence",
        });
        return;
      }

      if (data) {
        setDailySentence(data.content);
      }
    };

    fetchDailySentence();
  }, [toast]);

  return dailySentence;
};