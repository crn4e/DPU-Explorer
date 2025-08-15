export type LocationCategory = 'Academic' | 'Food' | 'Recreation' | 'Services';

export interface Location {
  id: string;
  name: string;
  category: LocationCategory;
  description: string;
  image: string;
  imageHint: string;
  hours: {
    // day name from 'EEEE' format of date-fns, e.g. "Monday"
    [day: string]: { open: string; close: string } | null;
  };
  announcement?: string;
  lat: number;
  lng: number;
}
