import { StaticImageData } from 'next/image';

import building1 from '../assets/images/building-1.jpg';
import building1_guest_services from '../assets/images/building-1-guest-services.jpg';
import building2 from '../assets/images/building-2.jpg';
import building2_key_offices from '../assets/images/building-2-key-offices.jpg';
import building3 from '../assets/images/building-3.jpg';
import building4 from '../assets/images/building-4.jpg';
import building5 from '../assets/images/building-5.jpg';
import building5_faculty_directory from '../assets/images/building-5-faculty-directory.jpg';
import building6 from '../assets/images/building-6.jpg';
import building6_faculty_offices from '../assets/images/building-6-faculty-offices.jpg';
import building7 from '../assets/images/building-7.jpg';
import building8 from '../assets/images/building-8.jpg';
import building9 from '../assets/images/building-9.jpg';
import building10 from '../assets/images/building-10.jpg';
import building12 from '../assets/images/building-12.jpg';
import building15_17 from '../assets/images/building-15-17.jpg';
import dpu_map from '../assets/images/dpu-map.png.png';
import food_court from '../assets/images/food-court.jpg';
import gym from '../assets/images/gym.jpg';
import library from '../assets/images/library.jpg';
import library_services from '../assets/images/library-services.jpg';
import logo from '../assets/images/Logo.jpg';
import pngegg from '../assets/images/pngegg.png';
import swimming_pool from '../assets/images/swimming-pool.jpg';
import basketball_court from '../assets/images/basketball-court.jpg';
import default_image from '../assets/images/default.png';
import roong_la_korn from '../assets/images/โรงละคร.jpg';


type ImageInfo = {
  url: StaticImageData;
  hint: string;
};

type ImagesData = {
  [key: string]: {
    main: ImageInfo;
    directoryPages?: {
      [key: string]: ImageInfo;
    };
  };
};

export const images: ImagesData = {
  'building-1': {
    main: {
      url: building1,
      hint: 'hotel lobby',
    },
    directoryPages: {
      'building-1-guest-services': {
        url: building1_guest_services,
        hint: 'reception desk',
      },
    },
  },
  'building-2': {
    main: {
      url: building2,
      hint: 'office building',
    },
    directoryPages: {
      'building-2-key-offices': {
        url: building2_key_offices,
        hint: 'modern office',
      },
    },
  },
  'building-3': {
    main: {
      url: building3,
      hint: 'medical building',
    },
  },
  'building-4': {
    main: {
      url: building4,
      hint: 'modern building',
    },
  },
  'building-5': {
    main: {
      url: building5,
      hint: 'modern building',
    },
    directoryPages: {
      'building-5-faculty-directory': {
        url: building5_faculty_directory,
        hint: 'tech classroom',
      },
    },
  },
  'building-6': {
    main: {
      url: building6,
      hint: 'university building',
    },
    directoryPages: {
      'building-6-faculty-offices': {
        url: building6_faculty_offices,
        hint: 'lecture hall',
      },
    },
  },
  'building-7': {
    main: {
      url: building7,
      hint: 'information desk',
    },
  },
  'building-8': {
    main: {
      url: building8,
      hint: 'engineering lab',
    },
  },
  'building-9': {
    main: {
      url: building9,
      hint: 'global flags',
    },
  },
  'building-10': {
    main: {
      url: building10,
      hint: 'hotel reception',
    },
  },
  'building-12': {
    main: {
      url: building12,
      hint: 'lecture hall',
    },
  },
  'โรงละคร': {
    main: {
      url: roong_la_korn,
      hint: 'theater stage',
    },
  },
  'building-15-17': {
    main: {
      url: building15_17,
      hint: 'airplane hangar',
    },
  },
  library: {
    main: {
      url: library,
      hint: 'library interior',
    },
    directoryPages: {
      'library-services': {
        url: library_services,
        hint: 'bookshelves',
      },
    },
  },
  'food-court': {
    main: {
      url: food_court,
      hint: 'food court',
    },
  },
  gym: {
    main: {
      url: gym,
      hint: 'gym equipment',
    },
  },
  'swimming-pool': {
    main: {
      url: swimming_pool,
      hint: 'swimming pool',
    },
  },
  'basketball-court': {
    main: {
      url: basketball_court,
      hint: 'basketball court',
    },
  },
  default: {
    main: {
      url: default_image,
      hint: 'placeholder',
    },
  },
};
