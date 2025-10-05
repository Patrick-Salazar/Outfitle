import { doc, getDoc, getDocs, collection, query, where, setDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { signInWithGoogle, logOut as authLogOut } from './auth';

// User helpers to replace base44 User API
export const User = {
  // Get current user profile
  me: async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return {
          ...userDoc.data(),
          uid: currentUser.uid,
          email: currentUser.email,
          id: currentUser.uid
        };
      } else {
        // Return basic user info from Firebase Auth
        return {
          uid: currentUser.uid,
          email: currentUser.email,
          full_name: currentUser.displayName || currentUser.email.split('@')[0],
          profile_image_url: currentUser.photoURL || '',
          id: currentUser.uid
        };
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Filter users by criteria
  filter: async (criteria) => {
    try {
      const usersRef = collection(db, 'users');
      let q = usersRef;

      // Build query from criteria
      if (criteria && Object.keys(criteria).length > 0) {
        const conditions = [];
        for (const [key, value] of Object.entries(criteria)) {
          conditions.push(where(key, '==', value));
        }
        q = query(usersRef, ...conditions);
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        uid: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error filtering users:', error);
      throw error;
    }
  },

  // Get user by ID
  get: async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return {
          id: userDoc.id,
          uid: userDoc.id,
          ...userDoc.data()
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Login with Google
  login: async () => {
    try {
      const user = await signInWithGoogle();

      // Create or update user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userDocRef, {
          email: user.email,
          full_name: user.displayName || user.email.split('@')[0],
          profile_image_url: user.photoURL || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      return user;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await authLogOut();
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }
};
