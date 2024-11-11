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

          <div className="flex flex-col gap-4 items-center">
            <Button
              variant="ghost"
              className="w-full max-w-xs flex items-center gap-2 text-lg py-6"
              onClick={() => navigate("/journal-review")}
            >
              <Leaf className="h-5 w-5" />
              Journals
            </Button>
            <Button
              variant="ghost"
              className="w-full max-w-xs flex items-center gap-2 text-lg py-6"
              onClick={() => navigate("/practice-review")}
            >
              <Flower className="h-5 w-5" />
              Practices
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;