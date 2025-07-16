
import { useState } from 'react';
import { TripData } from '@/types/travel';

export const useTripData = () => {
  const [tripData, setTripData] = useState<TripData>({
    duration: '',
    startDate: new Date(),
  });

  const updateTripData = (updates: Partial<TripData>) => {
    setTripData(prev => ({ ...prev, ...updates }));
  };

  return {
    tripData,
    updateTripData,
    setTripData,
  };
};
