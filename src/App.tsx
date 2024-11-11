import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Sentence from "./pages/Sentence";
import Review from "./pages/Review";
import Analyze from "./pages/Analyze";
import Question from "./pages/Question";
import Answer from "./pages/Answer";
import Practice from "./pages/Practice";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const AppContent = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sentence" element={<Sentence />} />
            <Route path="/review" element={<Review />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/question" element={<Question />} />
            <Route path="/answer" element={<Answer />} />
            <Route path="/practice" element={<Practice />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const App = () => {
  return (
    <React.StrictMode>
      <AppContent />
    </React.StrictMode>
  );
};

export default App;