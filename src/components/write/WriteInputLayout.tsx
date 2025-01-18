import { Textarea } from "@/components/ui/textarea";
import DailySentenceDisplay from "@/components/DailySentenceDisplay";

interface WriteInputLayoutProps {
  question: string;
  answer: string;
  onAnswerChange: (value: string) => void;
  isSubmitting?: boolean;
  dailySentence?: string;
}

const WriteInputLayout = ({
  question,
  answer,
  onAnswerChange,
  isSubmitting,
  dailySentence,
}: WriteInputLayoutProps) => {
  console.log('WriteInputLayout rendered with dailySentence:', dailySentence);
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-base md:text-lg text-white">{question}</p>
        
        {dailySentence && (
          <DailySentenceDisplay 
            dailySentence={dailySentence} 
            showSentence={true}
          />
        )}

        <Textarea
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Tap here to tell your story"
          className="min-h-[200px] resize-none"
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
};

export default WriteInputLayout;