import type { Location } from './types';

const defaultHours = {
  Monday: { open: '08:00', close: '20:00' },
  Tuesday: { open: '08:00', close: '20:00' },
  Wednesday: { open: '08:00', close: '20:00' },
  Thursday: { open: '08:00', close: '20:00' },
  Friday: { open: '08:00', close: '18:00' },
  Saturday: { open: '09:00', close: '16:00' },
  Sunday: null,
};

export const locations: Location[] = [
  {
    id: 'building-5',
    name: 'Building 5 - Faculty of IT',
    category: 'Academic',
    description:
      'Home to the College of Creative Design and Entertainment Technology (ANT) and the College of Communication Arts (CA), fostering innovation in digital content and communication.',
    image: 'https://placehold.co/600x400.png',
    imageHint: 'modern building',
    hours: defaultHours,
    announcement: 'Special workshop on AI in Game Development this Saturday.',
    mapPosition: { x: 55.5, y: 55 },
  },
  {
    id: 'building-6',
    name: 'Building 6 - Chalermprakiat',
    category: 'Academic',
    description:
      'A central hub for various faculties including Law, Public Administration, and Business Administration. This building is a cornerstone of DPU\'s academic excellence.',
    image: 'https://placehold.co/600x400.png',
    imageHint: 'university building',
    hours: defaultHours,
    mapPosition: { x: 48, y: 58 },
  },
  {
    id: 'library',
    name: 'DPU Library',
    category: 'Services',
    description:
      'The heart of knowledge and research at DPU. Provides a vast collection of books, digital resources, and quiet study areas for students and faculty.',
    image: 'https://placehold.co/600x400.png',
    imageHint: 'library interior',
    hours: {
      ...defaultHours,
      Saturday: { open: '09:00', close: '17:00' },
      Sunday: { open: '09:00', close: '17:00' },
    },
    mapPosition: { x: 62.5, y: 41 },
  },
  {
    id: 'food-court',
    name: 'DPU Food Court',
    category: 'Food',
    description:
      'Offers a wide variety of delicious and affordable Thai and international food options in a lively atmosphere. A popular spot for students to eat and socialize.',
    image: 'https://placehold.co/600x400.png',
    imageHint: 'food court',
    hours: {
      Monday: { open: '07:30', close: '18:00' },
      Tuesday: { open: '07:30', close: '18:00' },
      Wednesday: { open: '07:30', close: '18:00' },
      Thursday: { open: '07:30', close: '18:00' },
      Friday: { open: '07:30', close: '18:00' },
      Saturday: null,
      Sunday: null,
    },
    announcement: 'New vegetarian stall now open!',
    mapPosition: { x: 38, y: 46 },
  },
  {
    id: 'gym',
    name: 'DPU Fitness Center',
    category: 'Recreation',
    description:
      'A state-of-the-art facility with modern equipment, a swimming pool, and various fitness classes to promote a healthy lifestyle for the DPU community.',
    image: 'https://placehold.co/600x400.png',
    imageHint: 'gym equipment',
    hours: {
      Monday: { open: '10:00', close: '21:00' },
      Tuesday: { open: '10:00', close: '21:00' },
      Wednesday: { open: '10:00', close: '21:00' },
      Thursday: { open: '10:00', close: '21:00' },
      Friday: { open: '10:00', close: '21:00' },
      Saturday: { open: '10:00', close: '19:00' },
      Sunday: null,
    },
    mapPosition: { x: 74, y: 28 },
  },
  {
    id: 'student-services',
    name: 'Student Services Center',
    category: 'Services',
    description:
      'A one-stop service point for all student needs, including registration, academic advising, and administrative support. Located in Building 7.',
    image: 'https://placehold.co/600x400.png',
    imageHint: 'information desk',
    hours: {
      Monday: { open: '08:30', close: '16:30' },
      Tuesday: { open: '08:30', close: '16:30' },
      Wednesday: { open: '08:30', close: '16:30' },
      Thursday: { open: '08:30', close: '16:30' },
      Friday: { open: '08:30', close: '16:30' },
      Saturday: null,
      Sunday: null,
    },
    mapPosition: { x: 44.5, y: 64 },
  },
];
