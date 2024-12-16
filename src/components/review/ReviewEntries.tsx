import DailySentenceDisplay from "@/components/DailySentenceDisplay";
import { formatInTimeZone } from 'date-fns-tz';

interface Entry {
  id: string;
  content: string;
  created_at: string;
  daily_sentence: string;
}

interface ReviewEntriesProps {
  entries: Entry[];
  isLoading: boolean;
}

const ReviewEntries = ({ entries, isLoading }: ReviewEntriesProps) => {
  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="p-6 bg-card rounded-lg text-center">
        <p className="text-lg text-muted-foreground">
          Your leaf for this day is fallen and faded, but each day begins with a fresh leaf for your story.
        </p>
      </div>
    );
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="space-y-8">
      {entries.map((entry, index) => {
        const localDate = formatInTimeZone(
          new Date(entry.created_at),
          timezone,
          'MMMM d, yyyy HH:mm:ss'
        );

        return (
          <div key={entry.id} className="space-y-8">
            {index === 0 && (
              <DailySentenceDisplay dailySentence={entry.daily_sentence} />
            )}
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-lg text-card-foreground whitespace-pre-wrap">
                {entry.content}
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Written on: {localDate}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewEntries;