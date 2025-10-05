import { auth, db, storage } from '../config/firebase';

// Firebase client - replaces base44 SDK
export const firebaseClient = {
  auth,
  db,
  storage
};

// Keep base44 export name for backward compatibility during migration
export const base44 = firebaseClient;
