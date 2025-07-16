import React, { useEffect, useState } from "react";
import axios from "axios";
import { City } from "@/types/travel";

interface Props {
  selectedState: string;
  onCitiesLoaded: (cities: City[]) => void;
}

const GoogleCityList: React.FC<Props> = ({ selectedState, onCitiesLoaded }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await axios.get(`/api/cities?state=${encodeURIComponent(selectedState)}`);
        const cityResults = res.data.results || [];

        const formattedCities: City[] = cityResults.map((result, index) => ({
          id: index + 1,
          name: result.name,
          state: selectedState
        }));

        onCitiesLoaded(formattedCities);
      } catch (err) {
        console.error("Failed to load cities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [selectedState, onCitiesLoaded]);

  if (loading) return <p className="text-white">Loading cities...</p>;
  return null;
};

export default GoogleCityList;
