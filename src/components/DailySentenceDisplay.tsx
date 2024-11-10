interface DailySentenceDisplayProps {
  dailySentence: string;
}

const DailySentenceDisplay = ({ dailySentence }: DailySentenceDisplayProps) => {
  return (
    <div className="text-center mt-8">
      <p className="text-xl italic text-love-400">{dailySentence}</p>
    </div>
  );
};

export default DailySentenceDisplay;