import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Clock } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Monument } from "@/types/travel";

interface MonumentCardProps {
  monument: Monument;
  isSelected: boolean;
  onSelect: (monument: Monument) => void;
}

const MonumentCard = ({ monument, isSelected, onSelect }: MonumentCardProps) => {
  const imageUrl = monument.photo_url;

  return (
    <Card
      className={`relative z-30 cursor-pointer transition-all duration-300 hover:scale-105 overflow-visible ${isSelected
        ? "bg-green-500/20 border-green-400 shadow-lg"
        : "bg-gray-800/30 border-green-500/20 hover:bg-gray-700/40"
        }`}
      onClick={() => onSelect(monument)}
    >
      <CardContent className="p-0 overflow-visible">
        <div className="h-48 bg-gray-700 rounded-t-lg overflow-hidden">
          <img
            src={imageUrl}
            alt={monument.name || "Monument"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="p-4 space-y-3 relative z-20 overflow-visible">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-white leading-tight">
              {monument.name}
            </h3>
            {isSelected && (
              <Badge className="bg-green-500 text-white">Selected</Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-green-400 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{monument.city}</span>
          </div>

          {monument.rating && (
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <Star className="w-4 h-4 fill-current" />
              <span>{monument.rating}/5</span>
            </div>
          )}

          {monument.opening_hours?.length > 0 && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="flex items-center gap-1 text-gray-300 text-sm cursor-pointer hover:text-green-400 transition-colors">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">Opening Hours</span>
                  <span className="ml-1 text-green-300 text-xs italic animate-pulse">(hover)</span>
                </div>
              </HoverCardTrigger>

              <HoverCardContent
                side="top"
                className="w-64 p-3 bg-black text-white text-xs rounded-md shadow-xl border border-green-500/20 z-50"
              >
                <div className="font-semibold text-green-300 mb-2">Opening Hours</div>
                {monument.opening_hours.map((hour, idx) => (
                  <div key={idx} className="mb-1">{hour}</div>
                ))}
              </HoverCardContent>
            </HoverCard>
          )}



        </div>
      </CardContent>
    </Card>
  );
};

export default MonumentCard;
