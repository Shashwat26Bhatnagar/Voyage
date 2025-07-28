import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BackgroundPattern from "@/components/BackgroundPattern";
import PageHeader from "@/components/PageHeader";
import { toast } from "sonner";

import hawaMahalImg from "@/assets/hawa-mahal.jpg";
import tajMahalImg from "@/assets/taj-mahal.jpg";
import redFortImg from "@/assets/red-fort.jpg";

interface TourMonument {
  id: number;
  name: string;
  city: string;
  state: string;
  description: string;
  imageUrl: string;
  tourDuration: string;
}

const VirtualTour = () => {
  const navigate = useNavigate();
  const [selectedMonument, setSelectedMonument] = useState<TourMonument | null>(null);

  const monuments: TourMonument[] = [
    {
      id: 1,
      name: "hawa-mahal",
      city: "Jaipur",
      state: "Rajasthan",
      description:
        "The Palace of Winds, a stunning example of Rajput architecture with its intricate latticework and 953 small windows.",
      imageUrl: hawaMahalImg,
      tourDuration: "7 minutes",
    },
    {
      id: 2,
      name: "taj-mahal",
      city: "Agra",
      state: "Uttar Pradesh",
      description:
        "An ivory-white marble mausoleum, one of the Seven Wonders of the World and a UNESCO World Heritage Site.",
      imageUrl: tajMahalImg,
      tourDuration: "11 minutes",
    },
    {
      id: 3,
      name: "red-fort",
      city: "Delhi",
      state: "Delhi",
      description:
        "A historic Mughal fort that served as the main residence of the Mughal emperors for nearly 200 years.",
      imageUrl: redFortImg,
      tourDuration: "6 minutes",
    },
  ];

  const formatMonumentName = (slug: string) => {
    if (slug === "hawa-mahal") return "Hawa Mahal";
    if (slug === "taj-mahal") return "Taj Mahal";
    if (slug === "red-fort") return "Red Fort";
    return slug;
  };

  const handleStartTour = (monument: TourMonument) => {
    setSelectedMonument(monument);
    const readableName = formatMonumentName(monument.name);
    toast.success(`Starting virtual tour of ${readableName}`);
    navigate("/overlay", { state: { monument: readableName } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900 relative overflow-hidden">
      <BackgroundPattern />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <PageHeader
          title="Virtual"
          highlightText=" Tours"
          subtitle="Explore monuments from the comfort of your home"
          backPath="/options"
        />

        <div className="max-w-6xl mx-auto space-y-8">
          <Card className="shadow-2xl border-0 bg-black/40 backdrop-blur-md border border-green-500/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Camera className="w-6 h-6 text-emerald-400" />
                Available Virtual Tours
              </CardTitle>
              <CardDescription className="text-green-200/80">
                Choose a monument to start your AI-guided virtual experience
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {monuments.map((monument) => (
                  <Card
                    key={monument.id}
                    className="cursor-pointer transition-all duration-300 hover:scale-105 bg-gray-800/30 border-green-500/20 hover:bg-gray-700/40"
                  >
                    <CardContent className="p-0">
                      <div className="h-48 bg-gray-700 rounded-t-lg overflow-hidden">
                        <img
                          src={monument.imageUrl}
                          alt={monument.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <div className="p-4 space-y-3">
                        <h3 className="text-lg font-semibold text-white">
                          {formatMonumentName(monument.name)}
                        </h3>

                        <p className="text-green-400 text-sm">
                          {monument.city}, {monument.state}
                        </p>

                        <p className="text-gray-300 text-sm leading-relaxed">
                          {monument.description}
                        </p>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-emerald-400 text-sm font-medium">
                            {monument.tourDuration}
                          </span>

                          <Button
                            onClick={() => handleStartTour(monument)}
                            size="sm"
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start Tour
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VirtualTour;
