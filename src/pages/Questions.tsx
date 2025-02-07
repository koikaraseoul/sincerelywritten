
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const Questions = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");

  return (
    <div className="min-h-screen bg-background p-8 pb-24 relative">
      {/* Header with back button */}
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

      {/* Main Content */}
      <div className="space-y-8 max-w-xl mx-auto">
        <Card className="mb-8 p-6">
          <h2 className="text-2xl font-serif mb-6">Your Questions</h2>
          
          <div className="space-y-6">
            <Textarea
              placeholder="Type your question as in detail as possible"
              className="min-h-[150px] text-muted-foreground"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            
            <Button 
              className="w-full bg-[#000000e6] hover:bg-[#333333] text-white rounded-md transition-all duration-300 relative group"
              disabled={!question.trim()}
            >
              <span className="opacity-100 transition-opacity duration-300 group-hover:opacity-0">
                Send
              </span>
              <Mail className="absolute inset-0 m-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Questions;
