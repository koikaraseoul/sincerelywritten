import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SentenceHeaderProps {
  onSubmit: () => void;
  isSubmitting: boolean;
  hasSubmittedToday: boolean;
  content: string;
}

const SentenceHeader = ({ onSubmit, isSubmitting, hasSubmittedToday, content }: SentenceHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-8 pt-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/dashboard")}
        className="absolute left-0"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onSubmit}
        disabled={isSubmitting || hasSubmittedToday || !content.trim()}
        className={`absolute right-0 ${(isSubmitting || hasSubmittedToday || !content.trim()) ? "opacity-50" : ""}`}
      >
        <Mail className={`h-6 w-6 ${(isSubmitting || hasSubmittedToday || !content.trim()) ? "text-muted-foreground" : ""}`} />
      </Button>
    </div>
  );
};

export default SentenceHeader;