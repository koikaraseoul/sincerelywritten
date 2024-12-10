import { formatInTimeZone } from 'date-fns-tz';

interface PracticeEntryProps {
  practice: {
    action_taken: string;
    reflection: string;
    created_at: string;
  };
}

const PracticeEntry = ({ practice }: PracticeEntryProps) => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <h2 className="text-xl font-serif mb-4">Actions Taken</h2>
      <p className="text-lg text-card-foreground whitespace-pre-wrap mb-6">
        {practice.action_taken}
      </p>
      <h2 className="text-xl font-serif mb-4">Lessons</h2>
      <p className="text-lg text-card-foreground whitespace-pre-wrap">
        {practice.reflection}
      </p>
      <p className="text-sm text-muted-foreground mt-4">
        Written on: {formatInTimeZone(new Date(practice.created_at), timezone, 'MMMM d, yyyy')}
      </p>
    </div>
  );
};

export default PracticeEntry;