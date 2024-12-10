const SubmittedMessage = () => {
  return (
    <div className="mt-16">
      <h1 className="text-3xl font-serif mb-8 text-center">
        Your Journals
      </h1>

      <div className="p-6 bg-card rounded-lg text-center text-muted-foreground">
        You've already shared your thoughts for today. Return tomorrow for a fresh reflection.
      </div>
    </div>
  );
};

export default SubmittedMessage;