import { formatInTimeZone } from "date-fns-tz";

interface DailySentenceDisplayProps {
  dailySentence: string;
  showSentence?: boolean;
}

const DailySentenceDisplay = ({ dailySentence, showSentence = true }: DailySentenceDisplayProps) => {
  console.log('DailySentenceDisplay rendered with:', { dailySentence, showSentence });
  
  if (!showSentence) {
    console.log('DailySentenceDisplay returning null due to showSentence being false');
    return null;
  }

  if (!dailySentence) {
    console.log('DailySentenceDisplay returning null due to no dailySentence');
    return null;
  }

  return (
    <div className="text-center mt-4 mb-4">
      <p className="text-xl italic text-love-400">{dailySentence}</p>
    </div>
  );
};

export default DailySentenceDisplay;