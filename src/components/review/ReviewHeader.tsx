import { ArrowLeft, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface ReviewHeaderProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  navigate: (path: string) => void;
  sentenceDates: string[];
}

const ReviewHeader = ({ date, setDate, navigate, sentenceDates }: ReviewHeaderProps) => {
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
    <>
      <div className="flex justify-between items-center mb-12 sm:mb-16 relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
          className="absolute left-0"
        >
          <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0"
            >
              <Hourglass className="h-5 w-5 sm:h-6 sm:w-6" />
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

      <h1 className="text-2xl sm:text-3xl font-serif mb-6 sm:mb-8 text-center">
        Your Reflections
      </h1>

      {date && (
        <div className="text-center mb-4 sm:mb-6">
          <p className="text-base sm:text-lg text-muted-foreground">
            {format(date, 'MMMM d, yyyy')}
          </p>
        </div>
      )}
    </>
  );
};

export default ReviewHeader;