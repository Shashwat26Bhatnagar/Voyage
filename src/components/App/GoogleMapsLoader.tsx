import { useEffect, useState } from "react";

const GoogleMapsLoader = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadScript = async () => {
      try {
        const res = await fetch("/api/key/index");
        const { apiKey } = await res.json();

        if (!apiKey) throw new Error("API key not found");

        const existingScript = document.getElementById("googleMapsScript");
        if (existingScript) {
          existingScript.remove();
        }

        const script = document.createElement("script");
        script.id = "googleMapsScript";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,marker`;
        script.async = true;
        script.defer = true;
        script.onload = () => setLoaded(true);

        document.head.appendChild(script);
      } catch (err) {
        console.error("Failed to load Google Maps script:", err);
      }
    };

    loadScript();
  }, []);

  return null;
};

export default GoogleMapsLoader;
