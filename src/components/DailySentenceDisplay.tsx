interface DailySentenceDisplayProps {
  dailySentence: string;
}

const DailySentenceDisplay = ({ dailySentence }: DailySentenceDisplayProps) => {
  return (
    <div className="text-center">
      <p className="text-xl italic text-love-400">{dailySentence}</p>
    </div>
  );
};

export default DailySentenceDisplay;