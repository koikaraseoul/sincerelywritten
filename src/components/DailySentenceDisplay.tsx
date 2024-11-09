interface DailySentenceDisplayProps {
  dailySentence: string;
}

const DailySentenceDisplay = ({ dailySentence }: DailySentenceDisplayProps) => {
  return (
    <div className="text-center px-4">
      <p className="text-lg md:text-xl italic text-love-400">{dailySentence}</p>
    </div>
  );
};

export default DailySentenceDisplay;