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
import { initialCustomers } from '../data/mockCustomers';

const CUSTOMERS_KEY = 'la_plots_customers_v1';

export const customerService = {
  async getAllCustomers() {
    try {
      const customersRef = collection(db, 'customers');
      const q = query(customersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const firestoreCustomers = [];
        querySnapshot.forEach((d) => {
          firestoreCustomers.push({ id: d.id, ...d.data() });
        });
        storage.set(CUSTOMERS_KEY, firestoreCustomers);
        return firestoreCustomers;
      }

      // If collection is empty, auto-seed initial customers into Firestore
      const localCustomers = storage.get(CUSTOMERS_KEY, initialCustomers);
      try {
        for (const cust of localCustomers) {
          await setDoc(doc(db, 'customers', cust.id), cust, { merge: true });
        }
      } catch (seedErr) {
        console.warn('Firestore customer auto-seed note:', seedErr.message);
      }

      storage.set(CUSTOMERS_KEY, localCustomers);
      return localCustomers;
    } catch (err) {
      console.warn('Firestore getAllCustomers fallback to local cache:', err.message);
      let customers = storage.get(CUSTOMERS_KEY, null);
      if (!customers) {
        customers = initialCustomers;
        storage.set(CUSTOMERS_KEY, customers);
      }
      return customers;
    }
  },

  async getCustomerById(id) {
    const customers = await this.getAllCustomers();
    return customers.find((c) => c.id === id) || null;
  },

  async createCustomer(data) {
    const newCustomer = {
      id: `cust-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      email: data.email || '',
      address: data.address || '',
      city: data.city || 'Bengaluru',
      budgetMin: parseFloat(data.budgetMin) || 0,
      budgetMax: parseFloat(data.budgetMax) || 0,
      interestedProjectId: data.interestedProjectId || 'proj-01',
      interestedProjectName: data.interestedProjectName || 'Greenfield Meadows',
      interestedPlotId: data.interestedPlotId || '',
      interestedPlotNumber: data.interestedPlotNumber || '',
      status: data.status || 'New',
      nextFollowup: data.nextFollowup || '',
      notes: data.notes || '',
      assignedAgent: data.assignedAgent || 'Vikram Mehta',
      leadScore: data.leadScore || 50,
      createdAt: new Date().toISOString(),
    };

    // Store in Cloud Firestore
    try {
      await setDoc(doc(db, 'customers', newCustomer.id), newCustomer);
    } catch (err) {
      console.warn('Firestore setDoc customer note:', err.message);
    }

    // Update local cache
    const current = storage.get(CUSTOMERS_KEY, []);
    storage.set(CUSTOMERS_KEY, [newCustomer, ...current]);

    return newCustomer;
  },

  async updateCustomer(id, updates) {
    const customers = await this.getAllCustomers();
    const index = customers.findIndex((c) => c.id === id);
    const existing = index !== -1 ? customers[index] : {};

    const updatedCustomer = {
      ...existing,
      ...updates,
    };

    // Update in Cloud Firestore
    try {
      await updateDoc(doc(db, 'customers', id), updatedCustomer);
    } catch (err) {
      console.warn('Firestore updateDoc customer note:', err.message);
    }

    // Update local cache
    if (index !== -1) {
      customers[index] = updatedCustomer;
      storage.set(CUSTOMERS_KEY, customers);
    }

    return updatedCustomer;
  },

  async updateCustomerStatus(id, newStatus) {
    return this.updateCustomer(id, { status: newStatus });
  },

  async deleteCustomer(id) {
    // Delete in Cloud Firestore
    try {
      await deleteDoc(doc(db, 'customers', id));
    } catch (err) {
      console.warn('Firestore deleteDoc customer note:', err.message);
    }

    // Delete in local cache
    const customers = storage.get(CUSTOMERS_KEY, []);
    const filtered = customers.filter((c) => c.id !== id);
    storage.set(CUSTOMERS_KEY, filtered);

    return true;
  },
};
