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
  navigate: (path: string) => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  sentenceDates: string[];
  getDayStyle: (date: Date) => string;
  modifiers: any;
  modifiersStyles: any;
}

const ReviewHeader = ({
  navigate,
  date,
  setDate,
  sentenceDates,
  getDayStyle,
  modifiers,
  modifiersStyles,
}: ReviewHeaderProps) => {
  return (
    <>
      <div className="flex justify-between items-center mb-12">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
          className="absolute left-0"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 hover:bg-white hover:text-black transition-colors"
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

      {date && (
        <div className="text-center mb-6">
          <p className="text-lg text-muted-foreground">
            {format(date, 'MMMM d, yyyy')}
          </p>
        </div>
      )}
    </>
  );
};

export default ReviewHeader;