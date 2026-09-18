import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { storage } from './storage';
import { initialEnquiries } from '../data/mockEnquiries';

const ENQUIRIES_KEY = 'la_plots_enquiries_v1';

export const enquiryService = {
  async getAllEnquiries() {
    try {
      const enqsRef = collection(db, 'enquiries');
      const q = query(enqsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const firestoreEnqs = [];
        querySnapshot.forEach((d) => {
          firestoreEnqs.push({ id: d.id, ...d.data() });
        });
        storage.set(ENQUIRIES_KEY, firestoreEnqs);
        return firestoreEnqs;
      }

      // Auto-seed initial enquiries
      const localEnqs = storage.get(ENQUIRIES_KEY, initialEnquiries);
      try {
        for (const enq of localEnqs) {
          await setDoc(doc(db, 'enquiries', enq.id), enq, { merge: true });
        }
      } catch (seedErr) {
        console.warn('Firestore enquiries auto-seed note:', seedErr.message);
      }

      storage.set(ENQUIRIES_KEY, localEnqs);
      return localEnqs;
    } catch (err) {
      console.warn('Firestore getAllEnquiries fallback:', err.message);
      let enqs = storage.get(ENQUIRIES_KEY, null);
      if (!enqs) {
        enqs = initialEnquiries;
        storage.set(ENQUIRIES_KEY, enqs);
      }
      return enqs;
    }
  },

  async createEnquiry(data) {
    const newEnq = {
      id: `enq-${Date.now()}`,
      customerName: data.customerName,
      phone: data.phone,
      email: data.email || '',
      project: data.project || 'Greenfield Meadows',
      budget: data.budget || '₹40 - 60 Lakhs',
      requirement: data.requirement || '',
      source: data.source || 'Website',
      status: 'New',
      createdAt: new Date().toISOString(),
    };

    // Store in Cloud Firestore
    try {
      await setDoc(doc(db, 'enquiries', newEnq.id), newEnq);
    } catch (err) {
      console.warn('Firestore setDoc enquiry note:', err.message);
    }

    // Update local cache
    const enqs = storage.get(ENQUIRIES_KEY, []);
    storage.set(ENQUIRIES_KEY, [newEnq, ...enqs]);

    return newEnq;
  },

  async updateEnquiryStatus(id, newStatus) {
    // Update in Cloud Firestore
    try {
      await updateDoc(doc(db, 'enquiries', id), { status: newStatus });
    } catch (err) {
      console.warn('Firestore updateDoc enquiry note:', err.message);
    }

    // Update local cache
    const enqs = await this.getAllEnquiries();
    const index = enqs.findIndex((e) => e.id === id);
    if (index !== -1) {
      enqs[index].status = newStatus;
      storage.set(ENQUIRIES_KEY, enqs);
      return enqs[index];
    }
    return { id, status: newStatus };
  },

  async deleteEnquiry(id) {
    // Delete from Cloud Firestore
    try {
      await deleteDoc(doc(db, 'enquiries', id));
    } catch (err) {
      console.warn('Firestore deleteDoc enquiry note:', err.message);
    }

    // Update local cache
    const enqs = storage.get(ENQUIRIES_KEY, []);
    const filtered = enqs.filter((e) => e.id !== id);
    storage.set(ENQUIRIES_KEY, filtered);

    return true;
  },
};
