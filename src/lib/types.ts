export type LocationCategory = 'Academic' | 'Food' | 'Recreation' | 'Services';

export interface RoomItem {
  name: string;
  details: string;
  imageId?: string; // Add imageId to RoomItem
}

export interface DirectoryPage {
  title: string;
  description?: string;
  items: RoomItem[];
  imageId?: string; // This can be the main image for the page
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
  image: string; // Main image URL for the location
  directoryInfo?: DirectoryPage[];
  isDeleted?: boolean;
}

export interface StudentProfile {
  studentId: string;
  name: string;
  surname: string;
  email: string;
  role: 'student';
}
