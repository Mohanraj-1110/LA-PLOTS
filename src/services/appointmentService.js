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
import { initialAppointments } from '../data/mockAppointments';

const APPOINTMENTS_KEY = 'la_plots_appointments_v1';

export const appointmentService = {
  async getAllAppointments() {
    try {
      const apptsRef = collection(db, 'appointments');
      const q = query(apptsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const firestoreAppts = [];
        querySnapshot.forEach((d) => {
          firestoreAppts.push({ id: d.id, ...d.data() });
        });
        storage.set(APPOINTMENTS_KEY, firestoreAppts);
        return firestoreAppts;
      }

      // If collection is empty, auto-seed initial appointments into Firestore
      const localAppts = storage.get(APPOINTMENTS_KEY, initialAppointments);
      try {
        for (const appt of localAppts) {
          await setDoc(doc(db, 'appointments', appt.id), appt, { merge: true });
        }
      } catch (seedErr) {
        console.warn('Firestore appointment auto-seed note:', seedErr.message);
      }

      storage.set(APPOINTMENTS_KEY, localAppts);
      return localAppts;
    } catch (err) {
      console.warn('Firestore getAllAppointments fallback to local cache:', err.message);
      let appts = storage.get(APPOINTMENTS_KEY, null);
      if (!appts) {
        appts = initialAppointments;
        storage.set(APPOINTMENTS_KEY, appts);
      }
      return appts;
    }
  },

  async getAppointmentById(id) {
    const appts = await this.getAllAppointments();
    return appts.find((a) => a.id === id) || null;
  },

  async createAppointment(data) {
    const newAppt = {
      id: `appt-${Date.now()}`,
      customerId: data.customerId || '',
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      plotId: data.plotId || '',
      plotNumber: data.plotNumber || '',
      projectName: data.projectName || 'Greenfield Meadows',
      type: data.type || 'Site Visit',
      date: data.date,
      time: data.time,
      status: 'Upcoming',
      location: data.location || 'Site Office',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };

    // Store in Cloud Firestore
    try {
      await setDoc(doc(db, 'appointments', newAppt.id), newAppt);
    } catch (err) {
      console.warn('Firestore setDoc appointment note:', err.message);
    }

    // Update local cache
    const current = storage.get(APPOINTMENTS_KEY, []);
    storage.set(APPOINTMENTS_KEY, [newAppt, ...current]);

    return newAppt;
  },

  async updateAppointment(id, updates) {
    const appts = await this.getAllAppointments();
    const index = appts.findIndex((a) => a.id === id);
    const existing = index !== -1 ? appts[index] : {};

    const updatedAppt = {
      ...existing,
      ...updates,
    };

    // Update in Cloud Firestore
    try {
      await updateDoc(doc(db, 'appointments', id), updatedAppt);
    } catch (err) {
      console.warn('Firestore updateDoc appointment note:', err.message);
    }

    // Update local cache
    if (index !== -1) {
      appts[index] = updatedAppt;
      storage.set(APPOINTMENTS_KEY, appts);
    }

    return updatedAppt;
  },

  async updateAppointmentStatus(id, newStatus) {
    return this.updateAppointment(id, { status: newStatus });
  },

  async deleteAppointment(id) {
    // Delete in Cloud Firestore
    try {
      await deleteDoc(doc(db, 'appointments', id));
    } catch (err) {
      console.warn('Firestore deleteDoc appointment note:', err.message);
    }

    // Delete in local cache
    const appts = storage.get(APPOINTMENTS_KEY, []);
    const filtered = appts.filter((a) => a.id !== id);
    storage.set(APPOINTMENTS_KEY, filtered);

    return true;
  },
};
