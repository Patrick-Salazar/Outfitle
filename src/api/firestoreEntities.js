import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Generic Firestore entity class
class FirestoreEntity {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.collectionRef = collection(db, collectionName);
  }

  // Create a new document
  async create(data) {
    try {
      const docRef = await addDoc(this.collectionRef, {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Get a document by ID
  async get(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error getting ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Get all documents
  async getAll(queryConstraints = []) {
    try {
      const q = queryConstraints.length > 0
        ? query(this.collectionRef, ...queryConstraints)
        : this.collectionRef;

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error getting all ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Update a document
  async update(id, data) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return { id, ...data };
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Delete a document
  async delete(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      return { id };
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Query documents with conditions
  async query(conditions = []) {
    try {
      const q = query(this.collectionRef, ...conditions);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error querying ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Filter documents by criteria (for compatibility with old API)
  async filter(criteria = {}, orderByField = null) {
    try {
      const conditions = [];

      // Add where clauses for each criteria
      for (const [key, value] of Object.entries(criteria)) {
        conditions.push(where(key, '==', value));
      }

      // Add orderBy if specified (e.g., "-created_date" for descending)
      if (orderByField) {
        const isDescending = orderByField.startsWith('-');
        const field = isDescending ? orderByField.substring(1) : orderByField;
        conditions.push(orderBy(field, isDescending ? 'desc' : 'asc'));
      }

      const q = query(this.collectionRef, ...conditions);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error filtering ${this.collectionName}:`, error);
      throw error;
    }
  }
}

// Export Firestore query utilities for components
export { where, orderBy, limit };

// Create entity instances
export const ClothingItem = new FirestoreEntity('clothingItems');
export const DonationItem = new FirestoreEntity('donationItems');
export const CalendarEvent = new FirestoreEntity('calendarEvents');
export const Conversation = new FirestoreEntity('conversations');
export const ChatMessage = new FirestoreEntity('chatMessages');
