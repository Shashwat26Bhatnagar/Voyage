import React from "react";
import PlaceAutocompleteInput from "./PlaceAutocompleteInput";

interface Props {
  onPlaceSelect: (place: any, type?: string) => void;
}

const LocationSearchPanel: React.FC<Props> = ({ onPlaceSelect }) => {
  return (
    <div className="location-search-panel">
      <PlaceAutocompleteInput
        onPlaceSelect={({ place, type }) => {
          if (!place || !place.geometry?.location) {
            console.warn("❌ Invalid place or missing geometry:", place);
            return;
          }
          onPlaceSelect(place, type);
        }}
      />
    </div>
  );
};

export default LocationSearchPanel;
