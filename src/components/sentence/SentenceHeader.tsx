import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SentenceHeaderProps {
  onBack: () => void;
  onSave: () => void;
  isDisabled: boolean;
}

const SentenceHeader = ({ onBack, onSave, isDisabled }: SentenceHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8 pt-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="absolute left-0"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onSave}
        className="absolute right-0"
        disabled={isDisabled}
      >
        <Mail className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default SentenceHeader;