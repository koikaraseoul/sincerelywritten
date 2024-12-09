import React from "react";
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
  isSubmitting = false,
}: WriteInputLayoutProps) => {
  return (
    <div className="space-y-6">
      {/* Question Section */}
      <div className="bg-muted/30 p-6 rounded-lg border border-border">
        <h2 className="text-xl font-serif mb-4">Question</h2>
        <p className="text-lg text-card-foreground whitespace-pre-wrap">
          {question}
        </p>
      </div>

      {/* Answer Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif">Your Answer</h2>
        <Textarea
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Share your thoughts and reflections..."
          className="min-h-[200px] resize-y text-lg whitespace-pre-wrap"
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
};

export default WriteInputLayout;