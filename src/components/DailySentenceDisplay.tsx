interface DailySentenceDisplayProps {
  dailySentence: string;
}

const DailySentenceDisplay = ({ dailySentence }: DailySentenceDisplayProps) => {
  return (
    <div className="text-center mt-8">
      <p className="text-xl italic text-love-400">
        {dailySentence === "Passion drives love forward, but balance steers it toward fulfillment." 
          ? "Hasrat mendorong cinta ke depan, tetapi keseimbangan yang mengarahkannya menuju kepuasan."
          : dailySentence}
      </p>
    </div>
  );
};

export default DailySentenceDisplay;