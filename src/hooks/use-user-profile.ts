
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { StudentProfile } from '@/lib/types';

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<StudentProfile | null>(null);
  const [isProfileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user && sessionStorage.getItem('dpu-role') === 'student') {
        setProfileLoading(true);
        const userDocRef = doc(db, 'students', user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as StudentProfile);
          } else {
            console.warn("No profile found in 'students' collection for logged in user.");
            setUserProfile(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
        } finally {
          setProfileLoading(false);
        }
      } else {
        // Not a student or not logged in
        setUserProfile(null);
        setProfileLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { userProfile, isProfileLoading };
}
