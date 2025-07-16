import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import TripSummaryCard from "@/components/TripSummaryCard";
import BackgroundPattern from "@/components/BackgroundPattern";
import LoadingOverlay from "@/components/LoadingOverlay";
import { City, TripData } from "@/types/travel";
import GoogleCityList from "@/pages/GoogleCityList";

const Cities = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tripData: TripData = location.state || {};
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [popularCities, setPopularCities] = useState<City[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  const handleCitySelect = (cityId: number, cityName: string) => {
    const cityIdStr = cityId.toString();
    if (selectedCities.includes(cityIdStr)) {
      setSelectedCities(selectedCities.filter(city => city !== cityIdStr));
      toast.success(`Removed ${cityName} from your list`);
    } else {
      if (selectedCities.length >= tripData.duration) {
        toast.error(`You can only select up to ${tripData.duration} cities`);
        return;
      }
      
      setSelectedCities([...selectedCities, cityIdStr]);
      toast.success(`Added ${cityName} to your list`);
    }
  };

  const handleNext = () => {
    if (selectedCities.length === 0) {
      toast.error("Please select at least one city");
      return;
    }

    const selectedCityNames = selectedCities
      .map(id => popularCities.find(city => city.id.toString() === id)?.name)
      .filter(Boolean) as string[];

    navigate('/monuments', {
      state: {
        ...tripData,
        selectedCities: selectedCityNames
      }
    });
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900 relative overflow-hidden">
      <BackgroundPattern />
      <LoadingOverlay isVisible={popularCities.length === 0} message="Loading cities..." />
      <div className="relative z-10 container mx-auto px-4 py-8">
        <PageHeader
          title="Select"
          highlightText="Cities"
          subtitle={`Choose cities to visit in ${tripData.selectedState}`}
          backPath="/planner"
        />

        <div className="max-w-6xl mx-auto space-y-8">
          <TripSummaryCard tripData={tripData} />

          <Card className="shadow-2xl border-0 bg-black/40 backdrop-blur-md border border-green-500/20">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-white mb-2">Choose Cities to Visit</CardTitle>
              <CardDescription className="text-green-200/80">
                Select up to {tripData.duration} cities for your {tripData.duration}-day trip
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <GoogleCityList
                selectedState={tripData.selectedState}
                onCitiesLoaded={setPopularCities}
              />

              <div className="text-center">
                <p className="text-white">
                  Selected: <span className="text-green-400 font-semibold">{selectedCities.length}</span> cities
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {popularCities.map((city) => (
                  <Button
                    key={city.id}
                    onClick={() => handleCitySelect(city.id, city.name)}
                    variant="outline"
                    className={`h-auto py-4 px-3 text-center transition-all duration-300 ${selectedCities.includes(city.id.toString())
                        ? "bg-green-500/30 border-green-400 text-white shadow-lg transform scale-105"
                        : "bg-gray-800/50 border-green-500/30 text-white hover:bg-green-500/20 hover:border-green-400"
                      }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <MapPin className="w-5 h-5 text-green-400" />
                      <span className="text-sm font-medium text-white">{city.name}</span>
                      <span className="text-xs text-gray-300">{city.state}</span>
                    </div>
                  </Button>
                ))}
              </div>

              <div className="pt-6">
                <Button
                  onClick={handleNext}
                  disabled={selectedCities.length === 0}
                  size="lg"
                  className="w-full py-4 text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transform hover:scale-105 transition-all duration-300 shadow-2xl rounded-lg border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Select Monuments
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cities;
