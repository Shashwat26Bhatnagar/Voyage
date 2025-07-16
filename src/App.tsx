import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Welcome from "./pages/Welcome";
import Options from "./pages/Options";
import Index from "./pages/Index";
import Cities from "./pages/Cities";
import Monuments from "./pages/Monuments";
import Itinerary from "./pages/Itinerary";
import VirtualTour from "./pages/VirtualTour";
import NotFound from "./pages/NotFound";
import GoogleMapsLoader from "@/components/App/GoogleMapsLoader";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <GoogleMapsLoader />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/options" element={<Options />} />
          <Route path="/planner" element={<Index />} />
          <Route path="/cities" element={<Cities />} />
          <Route path="/monuments" element={<Monuments />} />
          <Route path="/itinerary" element={<Itinerary />} />
          <Route path="/virtual-tour" element={<VirtualTour />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
