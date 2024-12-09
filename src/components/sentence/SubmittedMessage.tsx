interface SubmittedMessageProps {
  dailySentence: string | undefined;
}

const SubmittedMessage = ({ dailySentence }: SubmittedMessageProps) => {
  return (
    <div className="mt-16">
      <h1 className="text-3xl font-serif mb-8 text-center">
        Your Journals
      </h1>
      
      <p className="text-love-400 text-lg italic text-center mb-8">
        Moving forward means leaving behind words that no longer serve love.
      </p>

      {dailySentence && (
        <div className="text-center mt-8">
          <p className="text-xl italic text-love-400">{dailySentence}</p>
        </div>
      )}

      <div className="p-6 bg-card rounded-lg text-center text-muted-foreground">
        You've already shared your thoughts for today. Return tomorrow for a fresh reflection.
      </div>
    </div>
  );
};

export default SubmittedMessage;