import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-2xl mx-auto relative">
        <div className="text-center space-y-8 animate-fadeIn">
          <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold text-gradient">
            Love?
          </h1>
          
          <button
            onClick={() => navigate("/login")}
            className="group relative w-32 h-32 transition-all duration-300 hover:scale-110 focus:outline-none"
            aria-label="Start your love journey"
          >
            <div className="absolute inset-0 love-gradient rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative flex items-center justify-center w-full h-full love-gradient rounded-full">
              <Heart className="w-16 h-16 text-white" />
            </div>
          </button>

          <p className="text-lg text-muted-foreground max-w-md mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Begin your journey of love and reflection
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;