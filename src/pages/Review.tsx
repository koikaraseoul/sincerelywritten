import { useNavigate } from "react-router-dom";
import { ArrowLeft, Leaf, Flower } from "lucide-react";
import { Button } from "@/components/ui/button";

const Review = () => {
  const navigate = useNavigate();

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
          <h1 className="text-3xl font-serif mb-12 text-center">
            Reviews for you
          </h1>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-32 flex-col gap-2 hover:border-love-500 hover:text-love-500 transition-colors"
              onClick={() => navigate("/journal-review")}
            >
              <Leaf className="h-8 w-8" />
              <span>Journals</span>
            </Button>
            <Button
              variant="outline"
              className="h-32 flex-col gap-2 hover:border-love-500 hover:text-love-500 transition-colors"
              onClick={() => navigate("/practice-review")}
            >
              <Flower className="h-8 w-8" />
              <span>Practices</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;