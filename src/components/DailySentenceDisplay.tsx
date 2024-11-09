interface DailySentenceDisplayProps {
  dailySentence: string;
}

const DailySentenceDisplay = ({ dailySentence }: DailySentenceDisplayProps) => {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-serif mb-8">Today's Sentence</h1>
      <p className="text-xl italic text-love-400">{dailySentence}</p>
    </div>
  );
};

export default DailySentenceDisplay;