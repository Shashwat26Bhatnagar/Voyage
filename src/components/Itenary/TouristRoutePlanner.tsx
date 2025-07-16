import React, { useEffect } from "react";

interface POI { name: string; lat: number; lng: number }
interface DayRoute { day: number; polyline: string | null; places: POI[] }

export default function TouristRoutePlanner({
  activeDay,
  routes,
}: {
  activeDay: number;
  routes: DayRoute[];
}) {
  useEffect(() => {
    const container = document.getElementById("maps");
    if (!container) return;
    container.innerHTML = "";

    const mapDiv = document.createElement("div");
    mapDiv.id = `map-${activeDay}`;
    mapDiv.className = "map-container";
    container.appendChild(mapDiv);

    const route = routes.find((r) => r.day === activeDay);
    if (!route || !window.google?.maps) return;

    const map = new window.google.maps.Map(mapDiv, {
      zoom: 12,
      center: {
        lat: route.places[0].lat,
        lng: route.places[0].lng,
      },
    });

    if (route.polyline) {
      const path = window.google.maps.geometry.encoding.decodePath(
        route.polyline
      );
      new window.google.maps.Polyline({
        path,
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        map,
      });
    }

    route.places.forEach((p) => {
      new window.google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map,
        title: p.name,
      });
    });
  }, [activeDay, routes]);

  return (
    <div>
      <div id="maps"></div>
      <style>{`
        .map-container {
          height: 400px;
          width: 100%;
          margin-bottom: 2rem;
        }
      `}</style>
    </div>
  );
}
