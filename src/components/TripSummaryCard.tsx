import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Navigation, ListOrdered } from "lucide-react";
import { TripData } from "@/types/travel";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TripSummaryCardProps {
  tripData: TripData & { originalDuration?: number };
  cityOrder?: string[];
}

const TripSummaryCard = ({ tripData, cityOrder }: TripSummaryCardProps) => {
  const navigate = useNavigate();
  const displayLocation =
    (tripData.selectedCities?.length ? tripData.selectedCities.join(", ") : tripData.selectedState);

  const ordered = tripData.orderedCities;


  return (
    <Card className="shadow-2xl border-0 bg-black/40 backdrop-blur-md border border-green-500/20">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-400" />
          Trip Summary
        </CardTitle>

        <Button
          onClick={async () => {
            navigate("/planner");
          }}
          className="bg-green-800 hover:bg-green-700 text-green-100 hover:text-white border border-green-500"
        >
          Change
        </Button>

      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">Location:</span>
            <span className="font-medium">{displayLocation}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">Duration:</span>
            <span className="font-medium">
              {tripData.duration} days
              {tripData.originalDuration &&
                tripData.duration !== tripData.originalDuration && (
                  <span className="ml-2 text-yellow-400 text-xs font-semibold">(updated)</span>
                )}
            </span>
          </div>



          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">Starting on:</span>
            <span className="font-medium">{tripData.startDate?.toDateString()}</span>
          </div>
        </div>

        {ordered?.length > 0 && (
          <div className="text-white">
            <div className="flex items-center gap-2 mb-1">
              <ListOrdered className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Travel Route:</span>
            </div>
            <div className="text-green-200 text-base font-semibold ml-6">
              {ordered.join(" → ")}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default TripSummaryCard;
