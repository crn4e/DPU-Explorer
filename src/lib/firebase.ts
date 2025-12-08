// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, writeBatch, getDocs, doc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { locations as initialLocations } from '@/lib/data';
import placeholderImages from '@/lib/placeholder-images.json';

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "dpu-explorer",
  "appId": "1:706173066492:web:0d701bbd2844a2c89e0b79",
  "storageBucket": "dpu-explorer.appspot.com",
  "apiKey": "AIzaSyDVZTfHCjrUgnHkGxF5NnFQINbX2j5v02Q",
  "authDomain": "dpu-explorer.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "706173066492"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Function to seed initial location data into Firestore
async function seedInitialData() {
  const locationsCollection = collection(db, 'locations');
  const snapshot = await getDocs(locationsCollection);

  if (snapshot.empty) {
    console.log('Seeding initial location data...');
    const batch = writeBatch(db);
    initialLocations.forEach((locationData) => {
      const locationDoc = doc(locationsCollection, locationData.id);
      
      const locationToWrite = { ...locationData };

      batch.set(locationDoc, locationToWrite);
    });
    await batch.commit();
    console.log('Initial location data has been seeded.');
  } else {
    // console.log('Locations collection already contains data. Skipping seed.');
  }
}

// Call the seeding function. It will only run if the collection is empty.
// Disabling seeding for now to avoid potential issues during development
// seedInitialData().catch(console.error);


export { app, auth, db, storage };
