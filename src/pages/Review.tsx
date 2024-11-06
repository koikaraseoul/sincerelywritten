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

interface Reflection {
  id: string;
  content: string;
  reflection_date: string;
}

const Review = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [reflectionDates, setReflectionDates] = useState<string[]>([]);
  const [selectedReflection, setSelectedReflection] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReflectionDates = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        const { data: reflections, error } = await supabase
          .from('reflections')
          .select('reflection_date')
          .eq('user_id', user.id);

        if (error) throw error;

        setReflectionDates(reflections.map(r => r.reflection_date));
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch reflection dates",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReflectionDates();
  }, [navigate, toast]);

  useEffect(() => {
    const fetchReflection = async () => {
      if (!date) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: reflections, error } = await supabase
          .from('reflections')
          .select('content')
          .eq('user_id', user.id)
          .eq('reflection_date', format(date, 'yyyy-MM-dd'))
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setSelectedReflection("");
            return;
          }
          throw error;
        }

        setSelectedReflection(reflections?.content || "");
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch reflection",
        });
      }
    };

    fetchReflection();
  }, [date, toast]);

  const modifiers = {
    highlighted: (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return reflectionDates.includes(dateStr);
    }
  };

  const modifiersStyles = {
    highlighted: {
      opacity: 1,
      fontWeight: "bold",
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
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
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-serif mb-8 text-center">
          Review Your Reflections
        </h1>

        {/* Selected Date Display */}
        {date && (
          <div className="text-center mb-6">
            <p className="text-lg text-muted-foreground">
              {format(date, 'MMMM d, yyyy')}
            </p>
          </div>
        )}

        {/* Reflection Content */}
        {selectedReflection ? (
          <div className="bg-card p-6 rounded-lg border border-border animate-fadeIn">
            <p className="text-card-foreground whitespace-pre-wrap">
              {selectedReflection}
            </p>
          </div>
        ) : date ? (
          <div className="text-center text-muted-foreground animate-fadeIn">
            No reflection found for this date
          </div>
        ) : null}

        {/* Loading State */}
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