import React from "react";

interface DailySentenceDisplayProps {
  dailySentence: string;
}

const DailySentenceDisplay = ({ dailySentence }: DailySentenceDisplayProps) => {
  return (
    <p className="text-xl italic text-love-400">{dailySentence}</p>
  );
};

export default DailySentenceDisplay;