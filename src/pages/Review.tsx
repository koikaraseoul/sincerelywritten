import { useNavigate } from "react-router-dom";
import { ArrowLeft, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Sentence {
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
  const [selectedSentence, setSelectedSentence] = useState<string>("");
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
        setSentenceDates([...new Set(dates)]); // Remove duplicates
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
    const fetchSentence = async () => {
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
          .select('content, daily_sentence')
          .eq('user_id', user.id)
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (sentences && sentences.length > 0) {
          const formattedSentences = sentences.map((sentence, index) => 
            `Entry ${index + 1}:\nDaily Sentence: ${sentence.daily_sentence}\nYour Response: ${sentence.content}`
          ).join('\n\n');
          setSelectedSentence(formattedSentences);
        } else {
          setSelectedSentence("");
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch sentences",
        });
      }
    };

    fetchSentence();
  }, [date, toast]);

  const modifiers = {
    highlighted: (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return sentenceDates.includes(dateStr);
    }
  };

  const modifiersStyles = {
    highlighted: {
      opacity: 1,
      fontWeight: "bold",
    }
  };

  const getDayStyle = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return sentenceDates.includes(dateStr) 
      ? "opacity-100 font-medium"
      : "opacity-40";
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="hover:bg-secondary"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-secondary"
              >
                <Hourglass className="h-6 w-6" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                className="rounded-md border"
                disabled={{ after: new Date() }}
                defaultMonth={date}
                components={{
                  DayContent: ({ date }) => (
                    <div className={getDayStyle(date)}>
                      {date.getDate()}
                    </div>
                  ),
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <h1 className="text-3xl font-serif mb-8 text-center">
          Review Your Sentences
        </h1>

        {date && (
          <div className="text-center mb-6">
            <p className="text-lg text-muted-foreground">
              {format(date, 'MMMM d, yyyy')}
            </p>
          </div>
        )}

        {selectedSentence ? (
          <div className="bg-card p-6 rounded-lg border border-border animate-fadeIn">
            <p className="text-card-foreground whitespace-pre-wrap">
              {selectedSentence}
            </p>
          </div>
        ) : date ? (
          <div className="text-center text-muted-foreground animate-fadeIn">
            No sentences found for this date
          </div>
        ) : null}

        {isLoading && (
          <div className="text-center text-muted-foreground">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
};

export default Review;