import DailySentenceDisplay from "@/components/DailySentenceDisplay";

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
      <div className="text-center text-responsive-base text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center text-responsive-base text-muted-foreground">
        No entries found for this date
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {entries.map((entry, index) => (
        <div key={entry.id} className="space-y-8">
          {index === 0 && (
            <DailySentenceDisplay dailySentence={entry.daily_sentence} />
          )}
          <div className="bg-card p-4 md:p-6 rounded-lg border border-border">
            <p className="text-responsive-base text-card-foreground whitespace-pre-wrap">
              {entry.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewEntries;