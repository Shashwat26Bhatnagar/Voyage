import React, { useRef, useEffect, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { MapPin } from "lucide-react";


const getPlaceType = (place) => {
  const types = place?.types || [];

  if (types.includes("administrative_area_level_1")) return "state";
  if (types.includes("locality")) return "city";
  return "other";
};

const PlaceAutocompleteInput = ({ onPlaceSelect }) => {
  const [placeAutocomplete, setPlaceAutocomplete] = useState(null);
  const inputRef = useRef(null);
  const places = useMapsLibrary("places");

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: [
        "place_id",
        "geometry",
        "name",
        "formatted_address",
        "address_components",
        "types"
      ],
      types: ["(regions)"], // Limits to cities, states
      componentRestrictions: { country: "in" },
    };

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, options);
    setPlaceAutocomplete(autocomplete);
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener("place_changed", () => {
      const place = placeAutocomplete.getPlace();
      const type = getPlaceType(place);
      onPlaceSelect?.({ place, type });
    });
  }, [onPlaceSelect, placeAutocomplete]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        placeholder="Search and select a city or state from the dropdown list"
        className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800/50 border border-green-500/30 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
      />
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400">
        <MapPin className="w-4 h-4" />
      </div>
    </div>
  );

};

export default PlaceAutocompleteInput;
