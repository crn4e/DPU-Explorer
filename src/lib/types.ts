export type LocationCategory = 'Academic' | 'Food' | 'Recreation' | 'Services';

export interface RoomItem {
  name: string;
  details: string;
}

export interface DirectoryPage {
  title: string;
  description?: string;
  items: RoomItem[];
  imageId?: string; // Unique key to look up image in placeholder-images.json
}

export interface Location {
  id: string;
  name: string;
  category: LocationCategory[];
  description: string;
  hours?: {
    // day name from 'EEEE' format of date-fns, e.g. "Monday"
    [day: string]: { open: string; close: string } | null;
  } | null; // Allow hours to be null
  announcement?: string;
  mapPosition: { x: number; y: number };
  directoryInfo?: DirectoryPage[];
}

export interface StudentProfile {
  studentId: string;
  name: string;
  surname: string;
  email: string;
  role: 'student';
}
