import DailySentenceDisplay from "@/components/DailySentenceDisplay";

interface Entry {
  id: string;
  content: string;
  created_at: string;
  daily_sentence: string;
}

interface ReviewEntriesProps {
  entries: Entry[];
  date: Date | undefined;
}

const ReviewEntries = ({ entries, date }: ReviewEntriesProps) => {
  return (
    <>
      {entries.length > 0 ? (
        <div className="space-y-8">
          {entries.map((entry, index) => (
            <div key={entry.id} className="space-y-8">
              {index === 0 && (
                <DailySentenceDisplay dailySentence={entry.daily_sentence} />
              )}
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg font-medium mb-2">Entry {index + 1}</h3>
                <p className="text-card-foreground whitespace-pre-wrap">
                  {entry.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : date ? (
        <div className="text-center text-muted-foreground">
          No entries found for this date
        </div>
      ) : null}
    </>
  );
};

export default ReviewEntries;