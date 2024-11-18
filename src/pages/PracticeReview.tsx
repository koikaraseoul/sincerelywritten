import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import EmptyPracticeMessage from "@/components/practice/EmptyPracticeMessage";
import PracticeEntry from "@/components/practice/PracticeEntry";

interface Practice {
  id: string;
  action_taken: string;
  reflection: string;
  created_at: string;
}

const PracticeReview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [practiceDates, setPracticeDates] = useState<string[]>([]);
  const [practice, setPractice] = useState<Practice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPracticeDates = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        const { data: practices, error } = await supabase
          .from('practices')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const dates = practices.map(p => format(new Date(p.created_at), 'yyyy-MM-dd'));
        setPracticeDates([...new Set(dates)]);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch practice dates",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPracticeDates();
  }, [navigate, toast]);

  useEffect(() => {
    const fetchPractice = async () => {
      if (!date) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(date, { weekStartsOn: 1 });

        const { data: practices, error } = await supabase
          .from('practices')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', weekStart.toISOString())
          .lte('created_at', weekEnd.toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        setPractice(practices || null);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch practice entry",
        });
      }
    };

    fetchPractice();
  }, [date, toast]);

  const getDayStyle = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return practiceDates.includes(dateStr) 
      ? "opacity-100 font-medium"
      : "opacity-40";
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-2xl mx-auto relative">
        <div className="flex justify-between items-center mb-8 pt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/review")}
            className="absolute left-0"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0"
              >
                <Clock className="h-6 w-6" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
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

        <div className="mt-16">
          <h1 className="text-3xl font-serif mb-8 text-center">
            Ulasan Latihan
          </h1>

          {date && (
            <div className="text-center mb-6">
              <p className="text-lg text-muted-foreground">
                Minggu {format(startOfWeek(date, { weekStartsOn: 1 }), 'd MMMM yyyy')}
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center text-muted-foreground">
              Loading...
            </div>
          ) : !practice ? (
            <EmptyPracticeMessage />
          ) : (
            <div className="space-y-8">
              <PracticeEntry practice={practice} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeReview;