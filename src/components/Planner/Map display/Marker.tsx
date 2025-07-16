import React, { useState } from "react";
import {
  Marker as GMarker,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import InfoWindow from "./InfoWindow";

const Marker = ({ place }) => {
  const [markerRef, markerInstance] = useAdvancedMarkerRef();
  const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(false);

  return (
    <>
      <GMarker
        position={{
          lat: place.latitude,
          lng: place.longitude,
        }}
        onClick={() => {
          setIsInfoWindowOpen(true);
        }}
      />
      {isInfoWindowOpen && (
        <InfoWindow
          anchor={markerInstance}
          onCloseClick={() => setIsInfoWindowOpen(false)}
          place={place}
        />
      )}
    </>
  );
};

export default Marker;
