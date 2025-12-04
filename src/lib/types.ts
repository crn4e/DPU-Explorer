export type LocationCategory = 'Academic' | 'Food' | 'Recreation' | 'Services';

export interface RoomItem {
  name: string;
  details: string;
}

export interface DirectoryPage {
  title: string;
  description?: string;
  items: RoomItem[];
}

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
  mapPosition: { x: number; y: number };
  directoryInfo?: DirectoryPage[];
}

export interface StudentProfile {
  name: string;
  surname: string;
  email: string;
  studentId: string;
}
