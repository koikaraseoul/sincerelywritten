import { Textarea } from "@/components/ui/textarea";

interface WriteInputLayoutProps {
  question: string;
  answer: string;
  onAnswerChange: (value: string) => void;
  isSubmitting?: boolean;
}

const WriteInputLayout = ({
  question,
  answer,
  onAnswerChange,
  isSubmitting,
}: WriteInputLayoutProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-base md:text-lg text-white">{question}</p>
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