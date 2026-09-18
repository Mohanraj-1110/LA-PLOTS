import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { storage } from './storage';
import { initialSales, monthlyFinancialTrend, projectSalesDistribution } from '../data/mockSales';
import { calculateNetProfit, calculateProfitMargin } from '../utils/calculateProfit';

const SALES_KEY = 'la_plots_sales_v1';

export const salesService = {
  async getAllSales() {
    try {
      // 1. Try fetching from Cloud Firestore 'sales' collection
      const salesRef = collection(db, 'sales');
      const q = query(salesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const firestoreSales = [];
        querySnapshot.forEach((d) => {
          firestoreSales.push({ id: d.id, ...d.data() });
        });
        storage.set(SALES_KEY, firestoreSales);
        return firestoreSales;
      }

      // 2. If empty, seed initial sales
      const localSales = storage.get(SALES_KEY, initialSales);
      try {
        for (const sale of localSales) {
          await setDoc(doc(db, 'sales', sale.id), sale, { merge: true });
        }
      } catch (seedErr) {
        console.warn('Firestore sales auto-seed note:', seedErr.message);
      }

      storage.set(SALES_KEY, localSales);
      return localSales;
    } catch (err) {
      console.warn('Firestore getAllSales fallback to local cache:', err.message);
      let sales = storage.get(SALES_KEY, null);
      if (!sales) {
        sales = initialSales;
        storage.set(SALES_KEY, sales);
      }
      return sales;
    }
  },

  async getFinancialTrends() {
    await new Promise((r) => setTimeout(r, 50));
    return monthlyFinancialTrend;
  },

  async getProjectDistribution() {
    await new Promise((r) => setTimeout(r, 50));
    return projectSalesDistribution;
  },

  async createSale(data) {
    const saleAmount = parseFloat(data.saleAmount) || 0;
    const costAmount = parseFloat(data.costAmount) || 0;
    const netProfit = calculateNetProfit(saleAmount, costAmount);
    const profitMargin = calculateProfitMargin(saleAmount, costAmount);

    const newSale = {
      id: `sale-${Date.now()}`,
      plotId: data.plotId || '',
      plotNumber: data.plotNumber || 'Plot-X',
      projectName: data.projectName || 'Greenfield Meadows',
      customerId: data.customerId || '',
      customerName: data.customerName || 'Customer',
      saleAmount,
      costAmount,
      netProfit,
      profitMargin,
      saleDate: data.saleDate || new Date().toISOString().split('T')[0],
      paymentStatus: data.paymentStatus || 'Completed',
      paymentMethod: data.paymentMethod || 'Bank Transfer (RTGS)',
      agentName: data.agentName || 'Vikram Mehta',
      createdAt: new Date().toISOString(),
    };

    // Store in Cloud Firestore
    try {
      await setDoc(doc(db, 'sales', newSale.id), newSale);
    } catch (err) {
      console.warn('Firestore setDoc sale note:', err.message);
    }

    // Update local cache
    const sales = storage.get(SALES_KEY, []);
    storage.set(SALES_KEY, [newSale, ...sales]);

    return newSale;
  },

  async deleteSale(id) {
    // Delete from Cloud Firestore
    try {
      await deleteDoc(doc(db, 'sales', id));
    } catch (err) {
      console.warn('Firestore deleteDoc sale note:', err.message);
    }

    // Update local cache
    const sales = storage.get(SALES_KEY, []);
    const filtered = sales.filter((s) => s.id !== id);
    storage.set(SALES_KEY, filtered);

    return true;
  },
};
