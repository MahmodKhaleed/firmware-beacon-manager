
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Versions from "./pages/Versions";
import Statistics from "./pages/Statistics";
import BurnMonitor from "./pages/BurnMonitor";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Migration from "./pages/Migration";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/versions" element={<Versions />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/burn-monitor" element={<BurnMonitor />} />
            <Route path="/migration" element={<Migration />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
