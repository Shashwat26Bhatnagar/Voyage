import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import BackgroundPattern from "@/components/BackgroundPattern";
import TouristRoutePlanner from "@/components/Itenary/TouristRoutePlanner";
import { TripData } from "@/types/travel";
import DinoWrapper from "@/components/Itenary/DinoWrapper";


type GeminiDayPlan = {
  day: number;
  city: string;
  plan: string;
};

const Itinerary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tripData: TripData = location.state || {};

  const [activeDay, setActiveDay] = useState(1);
  const [dayRoutes, setDayRoutes] = useState<any[]>([]);
  const [geminiPlans, setGeminiPlans] = useState<GeminiDayPlan[]>([]);
  const [updatedCityWiseSelection, setUpdatedCityWiseSelection] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const displayLocation = tripData.selectedCities?.length
    ? tripData.selectedCities.join(", ")
    : tripData.selectedState;

  const cleanGeminiText = (text: string) => {
    return text.replace(/\*\*/g, '');
  };

  useEffect(() => {
    async function detect() {
      if (!tripData.interCityMap || !tripData.cityWiseSelection || !tripData.orderedCities) return;
      const res = await fetch("/api/compute-outliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityWiseSelection: tripData.cityWiseSelection,
          interCityMap: tripData.interCityMap,
          orderedCities: tripData.orderedCities,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        const upd = { ...tripData.cityWiseSelection };
        for (const city in result) {
          if (!upd[city]) upd[city] = { monuments: [], fullDay: [] };
          upd[city].monuments = result[city].monuments;
          upd[city].outliers = result[city].outliers;
        }
        setUpdatedCityWiseSelection(upd);
      } else {
        console.error("Outlier detection failed", result);
      }
    }
    detect();
  }, [tripData]);

  useEffect(() => {
    if (!tripData.duration || !tripData.orderedCities || !updatedCityWiseSelection) return;

    async function build() {
      const totalDays = Number(tripData.duration);
      const raw: any[] = [];
      let currentDay = 0;

      for (let i = 0; i < tripData.orderedCities.length; i++) {
        const city = tripData.orderedCities[i];
        const cityData = updatedCityWiseSelection[city] || { fullDay: [], monuments: [], outliers: [] };

        for (const fd of cityData.fullDay) {
          if (currentDay >= totalDays) break;
          raw.push({ day: currentDay + 1, type: "full-day", monuments: [fd] });
          currentDay++;
        }

        const mon = cityData.monuments || [];
        if (mon.length) {
          const clustersRes = await fetch("/api/cluster-monuments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ monuments: mon, max_per_cluster: 4 }),
          });
          const { clusters } = await clustersRes.json();
          for (const cl of clusters) {
            if (currentDay >= totalDays) break;
            raw.push({ day: currentDay + 1, type: "monument", monuments: cl });
            currentDay++;
          }
        }

        if (tripData.interCityMap[i] && i + 1 < tripData.orderedCities.length) {
          const next = tripData.orderedCities[i + 1];
          const outA = cityData.outliers || [];
          const outB = updatedCityWiseSelection[next]?.outliers || [];
          if (outA.length && outB.length && currentDay < totalDays) {
            raw.push({
              day: currentDay + 1,
              type: "inter-city",
              monuments: [outA[0], outB[0]],
            });
            currentDay++;
          }
        }
      }
      try {
        const r = await fetch("/api/generate-day-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawItinerary: raw }),
        });
        const { routes } = await r.json();
        setDayRoutes(routes);
      } catch (e) {
        console.error("Route fetch failed", e);
      }

      try {
        const r2 = await fetch("/api/generate-itinerary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cities: tripData.orderedCities, days: raw }),
        });
        const { itinerary } = await r2.json();
        setGeminiPlans(itinerary);
      } catch (e) {
        console.error("Gemini fetch failed", e);
      } finally {
        setLoading(false);
      }
    }

    build();
  }, [updatedCityWiseSelection, tripData]);

  const currentPlan = geminiPlans[activeDay - 1];
  const currentRoute = dayRoutes.find(r => r.day === activeDay);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900 relative overflow-hidden">
      <BackgroundPattern />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <PageHeader
          title="Your"
          highlightText="Itinerary"
          subtitle={`${tripData.duration}-Day Tourist Route for ${displayLocation}`}
        />

        <div className="mb-6">
          <Button
            onClick={() => navigate('/')}
            className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-md"
          >
            Return to Home
          </Button>
        </div>

        <Card className="shadow-2xl border-0 bg-black/40 backdrop-blur-md border border-green-500/20">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({ length: Number(tripData.duration) }).map((_, i) => (
                <Button
                  key={i}
                  variant={activeDay === i + 1 ? "default" : "outline"}
                  onClick={() => setActiveDay(i + 1)}
                  className={activeDay === i + 1
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-transparent border-green-500/50 text-white hover:bg-green-500/20 hover:border-green-400"
                  }
                >
                  Day {i + 1}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-top bg-black/90 text-white pt-16">
            <div >
              <DinoWrapper />
            </div>
          </div>

        ) : (
          <>
            {currentRoute && (
              <TouristRoutePlanner
                activeDay={activeDay}
                routes={dayRoutes}
              />
            )}

            {currentPlan && (
              <Card className="shadow-2xl border-0 bg-black/40 backdrop-blur-md border border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-xl text-white">
                    Day {activeDay} – {currentPlan.city}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-white text-base leading-relaxed space-y-2">
                  {cleanGeminiText(currentPlan.plan)
                    .split(/\.(?=\s+[A-Z]|\s*$)/)
                    .filter((s) => s.trim())
                    .map((pt, idx) => {
                      const cleanedText = pt.trim().replace(/^\s*Start your day at/, 'Start your day at');
                      const finalText = cleanedText.match(/[.!?]$/) ? cleanedText : cleanedText + '.';

                      return (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="mt-1 text-red-400">•</span>
                          <span>{finalText}</span>
                        </div>
                      );
                    })}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Itinerary;