import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import TripSummaryCard from "@/components/TripSummaryCard";
import BackgroundPattern from "@/components/BackgroundPattern";
import MonumentCard from "@/components/MonumentCard";
import { Monument, TripData } from "@/types/travel";
import LoadingOverlay from "@/components/LoadingOverlay";

const Monuments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tripData: TripData = location.state || {};

  const [selectedMonuments, setSelectedMonuments] = useState<Monument[]>([]);
  const [groupedData, setGroupedData] = useState<Record<string, Monument[]>>({});
  const [fullDayData, setFullDayData] = useState<Record<string, Monument[]>>({});
  const [loading, setLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [daysUsed, setDaysUsed] = useState(0);
  const [dayExceeded, setDayExceeded] = useState(false);
  const [confirmUpdate, setConfirmUpdate] = useState(false);
  const [orderedCities, setOrderedCities] = useState<string[]>([]);
  const [cityWiseSelection, setCityWiseSelection] = useState<{
    [city: string]: {
      fullDay: Monument[];
      monuments: Monument[];
      outliers?: Monument[];
    };
  }>({});

  const [interCityMap, setInterCityMap] = useState<number[]>([]);
  const [cityDayCount, setCityDayCount] = useState<number[]>([]);

  const cities = tripData.selectedCities;
  const cityIndexMap = Object.fromEntries(cities.map((city, index) => [city, index]));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const monumentData: Record<string, Monument[]> = {};
        const fullDayDataMap: Record<string, Monument[]> = {};

        for (const city of cities) {
          const [monumentsRes, fullDayRes] = await Promise.all([
            fetch(`/api/monuments?cities=${city}`),
            fetch(`/api/full-day?cities=${city}`)
          ]);

          const monuments = ((await monumentsRes.json()).results || []).map((m: Monument) => ({
            ...m,
            type: "monument"
          }));
          const fullDay = ((await fullDayRes.json()).activities || []).map((m: Monument) => ({
            ...m,
            type: "full-day"
          }));

          monumentData[city] = monuments;
          fullDayDataMap[city] = fullDay;
        }

        setGroupedData(monumentData);
        setFullDayData(fullDayDataMap);

        const orderRes = await fetch(`/api/city-order?${cities.map(c => `cities=${encodeURIComponent(c)}`).join("&")}`);
        const orderData = await orderRes.json();
        if (orderRes.ok && orderData.orderedCities) {
          setOrderedCities(orderData.orderedCities);
        } else {
          toast.warning("City order couldn't be determined, showing default order.");
        }

      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isSameMonument = (a: Monument, b: Monument) => a.id === b.id && a.city === b.city;

  const handleMonumentSelect = (monument: Monument) => {
    const isSelected = selectedMonuments.some(m => isSameMonument(m, monument));

    setSelectedMonuments(prev => {
      const updated = isSelected
        ? prev.filter(m => !isSameMonument(m, monument))
        : [...prev, monument];

      setCityWiseSelection(prevMap => {
        const city = monument.city;
        const current = prevMap[city] || { fullDay: [], monuments: [] };
        const listToUpdate = monument.type === "full-day" ? current.fullDay : current.monuments;

        const updatedList = isSelected
          ? listToUpdate.filter(m => !isSameMonument(m, monument))
          : [...listToUpdate, monument];

        return {
          ...prevMap,
          [city]: {
            ...current,
            [monument.type === "full-day" ? "fullDay" : "monuments"]: updatedList,
          },
        };
      }
      );
      toast.success(`${isSelected ? "Removed" : "Added"} ${monument.name}`);
      return updated;
    });
  };

  const handleGenerateItinerary = () => {
    if (selectedMonuments.length === 0) {
      toast.error("Please select at least one monument");
      return;
    }

    navigate('/itinerary', {
      state: {
        ...tripData,
        selectedMonuments,
        cityWiseSelection,
        duration: dayExceeded && confirmUpdate ? daysUsed : tripData.duration,
        interCityMap,
        cityDayCount,
        orderedCities
      }
    });
  };

  const handleDone = () => {
    const orderedCityIndexMap = Object.fromEntries(orderedCities.map((city, index) => [city, index]));
    const monumentCountArr = Array(orderedCities.length).fill(0);
    const interCityMap = Array(orderedCities.length).fill(0);
    const cityDayCount = Array(orderedCities.length).fill(0);

    let n = 0;

    for (const monument of selectedMonuments) {
      const index = orderedCityIndexMap[monument.city];
      if (index === undefined) continue;

      if (monument.type === 'full-day') {
        n++;
        cityDayCount[index]++;
      } else {
        monumentCountArr[index]++;
      }
    }

    for (let i = 0; i < monumentCountArr.length; i++) {
      const fullDaysFromMonuments = Math.floor(monumentCountArr[i] / 4);
      if (fullDaysFromMonuments > 0) {
        n += fullDaysFromMonuments;
        cityDayCount[i] += fullDaysFromMonuments;
      }

      monumentCountArr[i] %= 4;
    }

    for (let i = 1; i < monumentCountArr.length; i++) {
      if (monumentCountArr[i - 1] > 1) {
        n++;
        cityDayCount[i - 1]++;
        monumentCountArr[i - 1] = 0;
      }
      else if (monumentCountArr[i - 1] === 1) {
        n++;
        interCityMap[i - 1] += 1;
        interCityMap[i] += 2;
        monumentCountArr[i - 1] = 0;
        monumentCountArr[i]--;
      }
    }

    const lastIndex = monumentCountArr.length - 1;
    if (monumentCountArr[lastIndex] > 0) {
      const days = Math.ceil(monumentCountArr[lastIndex] / 4);
      n += days;
      cityDayCount[lastIndex] += days;
    }


    setDaysUsed(n);
    const tripDays = typeof tripData.duration === 'string' ? parseInt(tripData.duration) : tripData.duration;
    setDayExceeded(n > tripDays);
    setShowSummary(true);
    setInterCityMap(interCityMap);
    setCityDayCount(cityDayCount);
  };

  const handleConfirmUpdate = () => {
    setConfirmUpdate(true);
    toast.success("Trip duration updated to match days required.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900 relative overflow-hidden">
      <BackgroundPattern />
      <div className="relative z-10 container mx-auto px-4 py-8">
        <PageHeader
          title="Explore"
          highlightText="Destinations"
          subtitle="Browse full-day experiences and monuments"
        />

        <div className="max-w-6xl mx-auto space-y-10">
          <TripSummaryCard
            tripData={{
              ...tripData,
              duration: confirmUpdate ? daysUsed : tripData.duration,
              orderedCities
            }}
          />

          {loading ? (
            <LoadingOverlay isVisible={loading} message="Loading monuments..." />
          ) : (
            <>
              {cities.map(city => (
                <div key={city} className="space-y-8">
                  <Card className="bg-black/40 backdrop-blur-md border border-green-500/20">
                    <CardHeader>
                      <CardTitle className="text-2xl text-white">Top Full-Day Experiences in {city}</CardTitle>
                      <CardDescription className="text-green-200/80">
                        Carefully curated experiences for an entire day
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-visible relative z-0">
                      {(fullDayData[city] || []).map(monument => (
                        <MonumentCard
                          key={`${monument.id}-${monument.city}`}
                          monument={monument}
                          isSelected={selectedMonuments.some(m => isSameMonument(m, monument))}
                          onSelect={handleMonumentSelect}
                        />
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 backdrop-blur-md border border-green-500/20">
                    <CardHeader>
                      <CardTitle className="text-2xl text-white">Famous Monuments in {city}</CardTitle>
                      <CardDescription className="text-green-200/80">
                        Choose monuments you'd like to visit
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(groupedData[city] || []).map(monument => (
                        <MonumentCard
                          key={`${monument.id}-${monument.city}`}
                          monument={monument}
                          isSelected={selectedMonuments.some(m => isSameMonument(m, monument))}
                          onSelect={handleMonumentSelect}
                        />
                      ))}
                    </CardContent>
                  </Card>
                </div>
              ))}

              <div className="pt-6 flex gap-4">
                <Button
                  onClick={handleDone}
                  disabled={selectedMonuments.length === 0}
                  className="flex-1 py-3 text-lg font-semibold bg-green-700 hover:bg-green-800 text-white rounded-md"
                >
                  Done Selecting ({selectedMonuments.length})
                </Button>
                <Button
                  onClick={handleGenerateItinerary}
                  disabled={!showSummary || (dayExceeded && !confirmUpdate)}
                  className="flex-1 py-3 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md disabled:opacity-50"
                >
                  Generate Itinerary
                </Button>
              </div>

              {showSummary && (
                <div className="pt-4 text-center">
                  <p className="text-white text-lg">
                    Days required based on your selection: <span className="font-bold text-green-400">{daysUsed}</span>
                  </p>
                  {dayExceeded && !confirmUpdate && (
                    <div className="mt-2">
                      <p className="text-red-400">
                        You have exceeded your trip duration of {tripData.duration} days.
                      </p>
                      <Button
                        onClick={handleConfirmUpdate}
                        className="mt-2 px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
                      >
                        Update trip to recommended days automatically
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Monuments;
