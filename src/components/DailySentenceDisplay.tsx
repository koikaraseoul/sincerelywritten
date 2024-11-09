interface DailySentenceDisplayProps {
  dailySentence: string;
}

const DailySentenceDisplay = ({ dailySentence }: DailySentenceDisplayProps) => {
  return (
    <div className="text-center px-4 md:px-6">
      <p className="text-responsive-lg italic text-love-400">{dailySentence}</p>
    </div>
  );
};

export default DailySentenceDisplay;