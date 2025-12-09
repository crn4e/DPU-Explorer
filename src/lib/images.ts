import { StaticImageData } from 'next/image';

import building1 from '../../public/IMG_1804.jpg';
import building1_guest_services from '../../public/building-1-guest-services.jpg';
import building2 from '../../public/IMG_1805.jpg';
import building2_key_offices from '../../public/building-2-key-offices.jpg';
import building3 from '../../public/building-3.jpg';
import building4 from '../../public/building-4.jpg';
import building5 from '../../public/building-5.jpg';
import building5_faculty_directory from '../../public/building-5-faculty-directory.jpg';
import building6 from '../../public/building-6.jpg';
import building6_faculty_offices from '../../public/building-6-faculty-offices.jpg';
import building7 from '../../public/building-7.jpg';
import building8 from '../../public/building-8.jpg';
import building9 from '../../public/building-9.jpg';
import building10 from '../../public/building-10.jpg';
import building12 from '../../public/building-12.jpg';
import building15_17 from '../../public/building-15-17.jpg';
import food_court from '../../public/food-court.jpg';
import gym from '../../public/gym.jpg';
import library from '../../public/library.jpg';
import library_services from '../../public/library-services.jpg';
import swimming_pool from '../../public/swimming-pool.jpg';
import basketball_court from '../../public/basketball-court.jpg';
import default_image from '../../public/default.png';
import roong_la_korn from '../../public/โรงละคร.jpg';


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
  'library': {
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
  'gym': {
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
  'default': {
    main: {
      url: default_image,
      hint: 'placeholder',
    },
  },
};
