// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, writeBatch, getDocs, doc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { locations as initialLocations } from '@/lib/data';

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
    initialLocations.forEach((location) => {
      // In Firestore, you don't set the ID like this. Firestore auto-generates it.
      // But for consistency with the existing app, we'll use the location.id as the document ID.
      const locationDoc = doc(locationsCollection, location.id);
      batch.set(locationDoc, location);
    });
    await batch.commit();
    console.log('Initial location data has been seeded.');
  } else {
    // console.log('Locations collection already contains data. Skipping seed.');
  }
}

// Call the seeding function. It will only run if the collection is empty.
seedInitialData().catch(console.error);


export { app, auth, db, storage };
