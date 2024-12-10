import { formatInTimeZone } from "date-fns-tz";

interface DailySentenceDisplayProps {
  dailySentence: string;
  showSentence?: boolean;
}

const DailySentenceDisplay = ({ dailySentence, showSentence = true }: DailySentenceDisplayProps) => {
  if (!showSentence) return null;

  return (
    <div className="text-center mt-8">
      <p className="text-xl italic text-love-400">{dailySentence}</p>
    </div>
  );
};

export default DailySentenceDisplay;