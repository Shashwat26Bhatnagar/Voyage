
import { Monument, City, DayItinerary } from "@/types/travel";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const apiService = {
  async searchLocations(query: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/search-locations?q=${encodeURIComponent(query)}`);
      return await response.json();
    } catch (error) {
      console.error('Location search failed:', error);
      throw error;
    }
  },

  async getCitiesByState(state: string): Promise<City[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cities?state=${encodeURIComponent(state)}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch cities:', error);
      throw error;
    }
  },

  async getMonuments(cities: string[], page: number = 0, limit: number = 12): Promise<Monument[]> {
    try {
      const citiesParam = cities.join(',');
      const response = await fetch(`${API_BASE_URL}/api/monuments?cities=${encodeURIComponent(citiesParam)}&page=${page}&limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch monuments:', error);
      throw error;
    }
  },

  async generateItinerary(data: {
    monuments: string[];
    cities: string[];
    duration: string;
    startDate: string;
  }): Promise<Record<number, DayItinerary>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to generate itinerary:', error);
      throw error;
    }
  }
};
