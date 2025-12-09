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
    id: 'building-1',
    name: 'อาคาร 1 - CIBA',
    category: ['Services'],
    description: 'คณะวิทยาลัยบริหารธุรกิจนวัตกรรมและการบัญชี (CIBA)',
    announcement: 'Hello World',
    image: '/IMG_001.jpg',
    hours: {
      "Monday": { open: '08:00', close: '20:00' },
      "Tuesday": { open: '08:00', close: '20:00' },
      "Wednesday": { open: '08:00', close: '20:00' },
      "Thursday": { open: '08:00', close: '20:00' },
      "Friday": { open: '08:00', close: '18:00' },
      "Saturday": { open: '09:00', close: '16:00' },
      "Sunday": null,
    },
    mapPosition: { x: 50, y: 28 },
    directoryInfo: [
        { title: 'Guest Services', description: '**Guest Services:**\n- Front Desk: Floor 1\n- Conference Rooms: Floor 2\n- Guest Rooms: Floors 3-5', items: [], imageId: 'building-1-guest-services' }
    ]
  },
  {
    id: 'building-2',
    name: 'Building 2 - Administration Office',
    category: ['Services'],
    description:
      'The main administration building, housing key university offices including the Office of the President.',
    image: '/IMG_1806.jpg',
    hours: {
      ...defaultHours,
      Saturday: null,
      Sunday: null,
    },
    mapPosition: { x: 53.5, y: 25 },
    directoryInfo: [
        { title: 'Key Offices', description: '**Key Offices:**\n- Office of the President: Floor 4\n- Human Resources: Floor 2\n- Finance Department: Floor 2', items: [], imageId: 'building-2-key-offices' }
    ]
  },
  {
    id: 'building-3',
    name: 'Building 3 - Health and Wellness',
    category: ['Academic'],
    description:
      'Home to the College of Health and Wellness and the Faculty of Nursing, focusing on health sciences and medical education.',
    image: '/IMG_3.jpg',
    hours: defaultHours,
    mapPosition: { x: 63, y: 33 },
  },
  {
    id: 'building-4',
    name: 'Building 4',
    category: ['Academic'],
    description: 'Houses various classrooms and faculty offices for general studies.',
    image: '/IMG_4.jpg',
    hours: defaultHours,
    mapPosition: { x: 57.55, y: 36 },
  },
  {
    id: 'building-5',
    name: 'Building 5 - Communication Arts & ANT',
    category: ['Academic'],
    description:
      'Home to the College of Creative Design and Entertainment Technology (ANT) and the College of Communication Arts (CA), fostering innovation in digital content and communication.',
    image: '/IMG_5.jpg',
    hours: defaultHours,
    announcement: 'Special workshop on AI in Game Development this Saturday.',
    mapPosition: { x: 71, y: 42 },
    directoryInfo: [
        { title: 'Faculty Directory', description: '**ANT Faculty:**\n- Dr. Somchai Jaidee: Room 5-301 (Game Design)\n- Aj. Siriporn Yindee: Room 5-305 (Animation)\n\n**CA Faculty:**\n- Dr. Pongsak Vanich: Room 5-402 (Broadcasting)', items: [], imageId: 'building-5-faculty-directory' }
    ]
  },
  {
    id: 'building-6',
    name: 'Building 6 - Chalermprakiat',
    category: ['Academic'],
    description:
      'A central hub for various faculties including Law, Public Administration, and Business Administration. This building is a cornerstone of DPU\'s academic excellence.',
    image: '/IMG_6.jpg',
    hours: defaultHours,
    mapPosition: { x: 67, y: 46 },
    directoryInfo: [
      { title: 'Faculty Offices', description: '**Faculty Offices:**\n- Faculty of Law: Floor 3\n- Faculty of Public Admin: Floor 4\n- Faculty of Business Admin: Floor 5 & 6', items: [], imageId: 'building-6-faculty-offices' }
    ]
  },
  {
    id: 'building-7',
    name: 'Building 7 - Student Services Center',
    category: ['Services'],
    description:
      'A one-stop service point for all student needs, including registration, academic advising, and administrative support.',
    image: '/IMG_7.jpg',
    hours: {
      Monday: { open: '08:30', close: '16:30' },
      Tuesday: { open: '08:30', close: '16:30' },
      Wednesday: { open: '08:30', close: '16:30' },
      Thursday: { open: '08:30', close: '16:30' },
      Friday: { open: '08:30', close: '16:30' },
      Saturday: null,
      Sunday: null,
    },
    mapPosition: { x: 62, y: 51.5 },
  },
  {
    id: 'building-8',
    name: 'Building 8',
    category: ['Academic'],
    description: 'Part of the Engineering and Technology complex, with specialized labs and workshops.',
    image: '/IMG_8.jpg',
    hours: defaultHours,
    mapPosition: { x: 75, y: 63 },
  },
  {
    id: 'building-9',
    name: 'Building 9 - International College',
    category: ['Academic'],
    description:
      'The hub for international students and programs, home to the DPU International College (DPUIC).',
    image: '/IMG_9.jpg',
    hours: defaultHours,
    mapPosition: { x: 73.5, y: 66 },
  },
  {
    id: 'building-10',
    name: 'Building 10 - Tourism and Hospitality',
    category: ['Academic'],
    description: 'Home to the Faculty of Tourism and Hospitality, with specialized training rooms and facilities.',
    image: '/IMG_10.jpg',
    hours: defaultHours,
    mapPosition: { x: 32, y: 46 },
  },
  {
    id: 'building-11',
    name: 'Building 11',
    category: ['Academic'],
    description: 'Placeholder description for Building 11.',
    image: '/IMG_11.jpg',
    hours: defaultHours,
    mapPosition: { x: 50, y: 50 },
    directoryInfo: []
  },
  {
    id: 'building-12',
    name: 'Building 12 - Sports Complex',
    category: ['Recreation'],
    description:
      'Features an indoor gymnasium, basketball court, and other sports facilities. Also includes the main university football field.',
    image: '/IMG_12.jpg',
    hours: defaultHours,
    mapPosition: { x:82, y: 60 },
  },
  {
    id: 'IMG-13',
    name: 'Building 13',
    category: ['Academic'],
    description: 'Placeholder description for Building 13.',
    image: '/IMG_13.jpg',
    hours: defaultHours,
    mapPosition: { x: 50, y: 50 },
    directoryInfo: []
  },
  {
    id: 'building-14',
    name: 'Building 14',
    category: ['Academic'],
    description: 'Placeholder description for Building 14.',
    image: '/default.png',
    hours: defaultHours,
    mapPosition: { x: 50, y: 50 },
    directoryInfo: []
  },
  {
    id: 'โรงละคร',
    name: 'โรงละคร - Tourism and Hospitality',
    category: ['Academic'],
    description: 'Home to the Faculty of Tourism and Hospitality, with specialized training rooms and facilities.',
    image: '/IMG_39.jpg',
    hours: defaultHours,
    mapPosition: { x: 82, y: 50 },
  },
  {
    id: 'EV-1',
    name: 'EV',
    category: ['Academic'],
    description: 'Home to the Faculty of Tourism and Hospitality, with specialized training rooms and facilities.',
    image: '/IMG_33.jpg',
    hours: defaultHours,
    mapPosition: { x: 82, y: 50 },
  },
  {
    id: 'building-15',
    name: 'Building 15',
    category: ['Academic'],
    description: 'The College of Aviation Development and Training (CADT), featuring advanced simulators and a full-size aircraft for hands-on learning.',
    image: '/IMG_15.jpg',
    hours: defaultHours,
    mapPosition: { x: 12, y: 36 },
  },
  {
    id: 'building-16',
    name: 'Building 16 - New Building',
    category: ['Academic'],
    description: 'A new building with modern facilities.',
    image: '/IMG_16.jpg',
    hours: defaultHours,
    mapPosition: { x: 40, y: 50 },
  },
  {
    id: 'building-17',
    name: 'Building 17 - New Building',
    category: ['Academic'],
    description: 'A new building with modern facilities.',
    image: '/IMG_17.jpg',
    hours: defaultHours,
    mapPosition: { x: 40, y: 50 },
  },
  {
    id: 'DPUplace',
    name: 'DPU Library',
    category: ['Services'],
    description:
      'The heart of knowledge and research at DPU. Provides a vast collection of books, digital resources, and quiet study areas for students and faculty.',
    image: '/IMG_36.jpg',
    hours: {
      ...defaultHours,
      Saturday: { open: '09:00', close: '17:00' },
      Sunday: { open: '09:00', close: '17:00' },
    },
    mapPosition: { x: 44, y: 70 },
    directoryInfo: [
        { title: 'Services', description: '**Library Services:**\n- Circulation Desk: Floor 1\n- Digital Media Zone: Floor 2\n- Quiet Study Area: Floor 3', items: [], imageId: 'library-services' }
    ]
  },
  {
    id: 'food-court',
    name: 'DPU Food Court',
    category: ['Food'],
    description:
      'Offers a wide variety of delicious and affordable Thai and international food options in a lively atmosphere. A popular spot for students to eat and socialize.',
    image: '/IMG_32.jpg',
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
    mapPosition: { x: 38, y: 64.5 },
  },
  {
    id: 'gym',
    name: 'DPU Fitness Center',
    category: ['Recreation'],
    description:
      'A state-of-the-art facility with modern equipment, a swimming pool, and various fitness classes to promote a healthy lifestyle for the DPU community.',
    image: '/IMG_27.jpg',
    hours: {
      Monday: { open: '10:00', close: '21:00' },
      Tuesday: { open: '10:00', close: '21:00' },
      Wednesday: { open: '10:00', close: '21:00' },
      Thursday: { open: '10:00', close: '21:00' },
      Friday: { open: '10:00', close: '21:00' },
      Saturday: { open: '10:00', close: '19:00' },
      Sunday: null,
    },
    mapPosition: { x: 25, y: 62 }, // The gym is inside Building 10
  },
  {
    id: 'swimming-pool',
    name: 'Swimming Pool',
    category: ['Recreation'],
    description:
      'An outdoor swimming pool for leisure and exercise, located next to Building 10.',
    image: '/IMG_28.jpg',
    hours: {
      Monday: { open: '10:00', close: '20:00' },
      Tuesday: { open: '10:00', close: '20:00' },
      Wednesday: { open: '10:00', close: '20:00' },
      Thursday: { open: '10:00', close: '20:00' },
      Friday: { open: '10:00', close: '20:00' },
      Saturday: { open: '10:00', close: '19:00' },
      Sunday: null,
    },
    mapPosition: { x: 31, y: 62 },
  },
  {
    id: 'basketball-court',
    name: 'Basketball Court',
    category: ['Recreation'],
    description:
      'An indoor basketball court available for student use and university team practices, located in Building 10.',
    image: '/basketball-court.jpg',
    hours: defaultHours,
    mapPosition: { x: 27, y: 58 }, // Inside Building 10
  },
  {
    id: 'building-38',
    name: 'อาคาร 1001',
    category: ['Services'],
    description: '1000',
    image: '/IMG_38.jpg',
    hours: {
      Monday: { open: '08:00', close: '20:00' },
      Tuesday: { open: '08:00', close: '20:00' },
      Wednesday: { open: '08:00', close: '20:00' },
      Thursday: { open: '08:00', close: '20:00' },
      Friday: { open: '08:00', close: '18:00' },
      Saturday: null,
      Sunday: null,
    },
    mapPosition: { x: 50, y: 50 },
  }
];
