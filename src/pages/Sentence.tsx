import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DailySentenceDisplay from "@/components/DailySentenceDisplay";
import SentenceForm from "@/components/SentenceForm";
import { useSentenceAuth } from "@/hooks/useSentenceAuth";
import { useDailySentence } from "@/hooks/useDailySentence";

const Sentence = () => {
  const navigate = useNavigate();
  const { hasWrittenToday, setHasWrittenToday } = useSentenceAuth();
  const dailySentence = useDailySentence();

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-2xl mx-auto relative">
        <div className="flex justify-between items-center mb-8 pt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="absolute left-0"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </div>

        <div className="mt-16">
          <h1 className="text-3xl font-serif mb-8 text-center">
            Your Journals
          </h1>
          
          <SentenceForm 
            dailySentence={dailySentence}
            hasWrittenToday={hasWrittenToday}
            setHasWrittenToday={setHasWrittenToday}
          />
          
          <DailySentenceDisplay dailySentence={dailySentence} />
        </div>
      </div>
    </div>
  );
};

export default Sentence;