import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/BottomNav";
import { GamificationProvider } from "@/hooks/useGamification";
import { CycleProvider } from "@/hooks/useCycle";
import Index from "./pages/Index";
import CheckInPage from "./pages/CheckInPage";
import ChatPage from "./pages/ChatPage";
import InsightsPage from "./pages/InsightsPage";
import ResourcesPage from "./pages/ResourcesPage";
import EmergencyPage from "./pages/EmergencyPage";
import BreathingPage from "./pages/BreathingPage";
import ClinicianPortal from "./pages/ClinicianPortal";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <GamificationProvider>
        <CycleProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/journal" element={<CheckInPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/emergency" element={<EmergencyPage />} />
              <Route path="/breathing" element={<BreathingPage />} />
              <Route path="/clinician" element={<ClinicianPortal />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </BrowserRouter>
        </CycleProvider>
      </GamificationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
