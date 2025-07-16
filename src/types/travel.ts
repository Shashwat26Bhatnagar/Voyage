
export interface TripData {
  selectedCities?: string[];
  selectedState?: string;
  duration: number;
  startDate?: Date;
  orderedCities?: string[];
  cityWiseSelection?: {
    [city: string]: {
      fullDay: Monument[];
      monuments: Monument[];
      outliers?: Monument[];
    };
  };
  selectedMonuments?: Monument[];
  interCityMap?: number[];
  cityDayCount?: number[];
}



export interface Monument {
  id: number;
  name: string;
  city: string;
  state: string;
  rating: number;
  description: string;
  photo_url?: string;
  website?: string;
  opening_hours?: string[];
  lat: number;
  lng: number;
  type?: "monument" | "full-day";
}


export interface City {
  id: number;
  name: string;
  state: string;
}

export interface ItineraryPlace {
  id: number;
  name: string;
  time: string;
  duration: string;
  description: string;
  tips: string[];
}

export interface DayItinerary {
  date: string;
  distance: string;
  estimatedTime: string;
  places: ItineraryPlace[];
}
