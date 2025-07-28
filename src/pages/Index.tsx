import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { APIProvider } from "@vis.gl/react-google-maps";
import LocationSearchPanel from "@/components/Planner/Search box/LocationSearchPanel";
import Map from "@/components/Planner/Map display/Map";
import PageHeader from "@/components/PageHeader";
import LoadingOverlay from "@/components/LoadingOverlay";
import BackgroundPattern from "@/components/BackgroundPattern";

const Index = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState(true);
  const navigate = useNavigate();

  const [state, setState] = useState("");
  const [tripDays, setTripDays] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationType, setLocationType] = useState("state");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/key/index")
      .then((res) => res.json())
      .then((data) => {
        if (data.apiKey) {
          setApiKey(data.apiKey);
        } else {
          throw new Error("Key missing");
        }
      })
      .catch((err) => {
        console.error("API key fetch error", err);
        toast.error("Google Maps API key not found");
      })
      .finally(() => {
        setLoadingKey(false);
      });
  }, []);

  const handlePlaceSelection = async (place: any, type?: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (place && place.geometry?.location) {
        const newPlace = {
          name: place.name,
          address: place.formatted_address,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
          type: type || "state",
        };
        setSelectedPlace(newPlace);
        setState(place.name);
        setLocationType(type || "state");
        toast.success("Location selected successfully!");
      } else {
        toast.error("Invalid place data");
      }
    } catch (error) {
      toast.error("Failed to select location");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (!state || !tripDays || !startDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const tripData = { selectedState: state, duration: Number(tripDays), startDate };

      if (locationType === "state") {
        navigate("/cities", { state: tripData });
      } else {
        navigate("/monuments", { state: { ...tripData, selectedCities: [state] } });
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900 relative overflow-hidden">
      <BackgroundPattern />
      <LoadingOverlay isVisible={isLoading} />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <PageHeader
          title="Travel"
          highlightText="Planner"
          subtitle="Let's start with the basics"
          backPath="/options"
        />

        <div className="max-w-4xl mx-auto space-y-8">
          {loadingKey ? (
            <div className="text-white text-center py-12 text-xl">
              Loading map configuration...
            </div>
          ) : apiKey ? (
            <APIProvider apiKey={apiKey} libraries={["geometry"]}>
              <Card className="shadow-2xl border-0 bg-black/40 backdrop-blur-md border border-green-500/20">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl text-white mb-2">Trip Details</CardTitle>
                  <CardDescription className="text-green-200/80">
                    Tell us about your travel plans
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {!selectedPlace && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-green-400" />
                        <Label className="text-lg font-semibold text-white">
                          Search Location
                        </Label>
                      </div>
                      <LocationSearchPanel onPlaceSelect={handlePlaceSelection} />
                    </div>
                  )}

                  {selectedPlace && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-green-400" />
                        <Label className="text-lg font-semibold text-white">
                          Selected Location ({locationType})
                        </Label>
                      </div>
                      <div className="flex gap-3">
                        <Input
                          value={state}
                          readOnly
                          className="flex-1 bg-gray-800/50 border-green-500/30 text-white placeholder:text-gray-400"
                        />
                        <Button
                          onClick={() => {
                            setSelectedPlace(null);
                            setState("");
                          }}
                          variant="outline"
                          className="bg-gray-800/50 border-green-500/30 text-white hover:bg-green-500/10 hover:border-green-400"
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-green-400" />
                      <Label htmlFor="days" className="text-lg font-semibold text-white">
                        Trip Duration
                      </Label>
                    </div>
                    <Input
                      id="days"
                      type="number"
                      min="1"
                      max="30"
                      placeholder="Number of days"
                      value={tripDays}
                      onChange={(e) => setTripDays(e.target.value)}
                    className="bg-gray-800/50 border border-transparent text-white placeholder:text-gray-400"
                    />

                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-green-400" />
                      <Label className="text-lg font-semibold text-white">Start Date</Label>
                    </div>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-gray-800/50 border-green-500/30 text-white hover:bg-gray-700/50",
                            !startDate && "text-gray-400"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => {
                            setStartDate(date);
                            setOpen(false);
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="pt-6">
                    <Button
                      onClick={handleNext}
                      disabled={isLoading}
                      size="lg"
                      className="w-full py-4 text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transform hover:scale-105 transition-all duration-300 shadow-2xl rounded-lg border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-2xl border-0 bg-black/40 backdrop-blur-md border border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Location Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="map-container w-full h-96 bg-gray-800/50 rounded-lg border border-green-500/20 flex items-center justify-center">
                    <Map place={selectedPlace} />
                  </div>
                </CardContent>
              </Card>
            </APIProvider>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Index;
