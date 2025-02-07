
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, ArrowLeft, Hourglass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { format } from "date-fns";

const Questions = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const currentDate = new Date();

  return (
    <div className="min-h-screen bg-[#000000] text-white p-8">
      <div className="max-w-2xl mx-auto relative">
        {/* Header with navigation */}
        <div className="flex justify-between items-center mb-8 pt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="absolute left-0 text-white hover:text-white/80"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 text-white hover:text-white/80"
          >
            <Hourglass className="h-6 w-6" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="mt-16 space-y-4">
          <h1 className="text-4xl font-serif mb-4 text-center">
            Journal Reviews
          </h1>
          
          <p className="text-center text-gray-400 mb-8">
            {format(currentDate, 'MMMM d, yyyy')}
          </p>

          <p className="text-[#ff69b4] text-xl text-center italic mb-8">
            A stable foundation is essential to fulfilling your destiny.
          </p>

          <Card className="bg-[#111111] border-[#222222] p-6 rounded-xl">
            <Textarea
              placeholder="Type your question as in detail as possible"
              className="min-h-[150px] bg-transparent border-none text-white placeholder:text-gray-500 focus-visible:ring-0 text-lg"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            
            <div className="text-sm text-gray-500 mt-4">
              Written on: {format(currentDate, 'MMMM d, yyyy HH:mm:ss')}
            </div>
          </Card>

          <Button 
            className="w-full bg-[#000000e6] hover:bg-[#333333] text-white rounded-md transition-all duration-300 relative group mt-4"
            disabled={!question.trim()}
          >
            <span className="opacity-100 transition-opacity duration-300 group-hover:opacity-0">
              Send
            </span>
            <Mail className="absolute inset-0 m-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Questions;
