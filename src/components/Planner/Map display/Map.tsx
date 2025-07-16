import React, { useEffect } from "react";
import { Map as GMap, useMap } from "@vis.gl/react-google-maps";
import Marker from "./Marker";

const Map = ({ place }) => {
  const mapInstance = useMap();

  useEffect(() => {
    if (place && mapInstance && place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      mapInstance.panTo({ lat, lng });
    }
  }, [place, mapInstance]);

  return (
    <GMap
      defaultCenter={{ lat: 20.5937, lng: 78.9629 }} // Center of India
      defaultZoom={4}
      disableDefaultUI
    >
      {place && <Marker place={place} />}
    </GMap>
  );
};

export default Map;
