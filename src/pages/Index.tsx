import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="text-center space-y-6 sm:space-y-8 animate-fadeIn">
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gradient">
          Love?
        </h1>
        
        <button
          onClick={() => navigate("/login")}
          className="group relative w-24 h-24 sm:w-32 sm:h-32 transition-all duration-300 hover:scale-110 focus:outline-none mx-auto"
          aria-label="Start your love journey"
        >
          <div className="absolute inset-0 love-gradient rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
          <div className="relative flex items-center justify-center w-full h-full love-gradient rounded-full">
            <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
          </div>
        </button>

        <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Begin your journey of love and reflection
        </p>
      </div>
    </div>
  );
};

export default Index;