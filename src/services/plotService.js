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
import { initialPlots, projectList } from '../data/mockPlots';
import { calculatePlotTotal } from '../utils/calculateProfit';

const PLOTS_KEY = 'la_plots_inventory_v1';
const PROJECTS_KEY = 'la_plots_projects_v1';

export const plotService = {
  async getAllPlots() {
    try {
      // 1. Try reading from Cloud Firestore collection 'plots'
      const plotsRef = collection(db, 'plots');
      const q = query(plotsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const firestorePlots = [];
        querySnapshot.forEach((d) => {
          firestorePlots.push({ id: d.id, ...d.data() });
        });
        storage.set(PLOTS_KEY, firestorePlots);
        return firestorePlots;
      }

      // 2. If collection is empty, auto-seed initial realistic plots into Firestore
      const localPlots = storage.get(PLOTS_KEY, initialPlots);
      try {
        for (const plot of localPlots) {
          await setDoc(doc(db, 'plots', plot.id), plot, { merge: true });
        }
      } catch (seedErr) {
        console.warn('Firestore plot auto-seed note:', seedErr.message);
      }

      storage.set(PLOTS_KEY, localPlots);
      return localPlots;
    } catch (err) {
      console.warn('Firestore getAllPlots fallback to local cache:', err.message);
      let plots = storage.get(PLOTS_KEY, null);
      if (!plots) {
        plots = initialPlots;
        storage.set(PLOTS_KEY, plots);
      }
      return plots;
    }
  },

  async getPlotById(id) {
    const plots = await this.getAllPlots();
    return plots.find((p) => p.id === id) || null;
  },

  async createPlot(data) {
    const areaSqft = parseFloat(data.areaSqft) || 0;
    const ratePerSqft = parseFloat(data.ratePerSqft) || 0;
    const totalAmount = calculatePlotTotal(areaSqft, ratePerSqft);

    const newPlot = {
      id: `plot-${Date.now()}`,
      projectId: data.projectId || 'proj-01',
      projectName: data.projectName || 'Greenfield Meadows',
      location: data.location || 'Bengaluru',
      plotNumber: data.plotNumber,
      surveyNumber: data.surveyNumber,
      areaSqft,
      ratePerSqft,
      totalAmount,
      status: data.status || 'available',
      facing: data.facing || 'East',
      roadWidth: parseFloat(data.roadWidth) || 30,
      description: data.description || '',
      amenities: data.amenities || ['Gated Layout', 'Clear Title', 'Tar Road'],
      photos:
        data.photos && data.photos.length > 0
          ? data.photos
          : [
              'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
            ],
      documents: data.documents || [],
      coordinates: data.coordinates || '12.9716° N, 77.5946° E',
      createdAt: new Date().toISOString(),
    };

    // Store in Cloud Firestore
    try {
      await setDoc(doc(db, 'plots', newPlot.id), newPlot);
    } catch (err) {
      console.warn('Firestore setDoc plot note:', err.message);
    }

    // Update local cache
    const current = storage.get(PLOTS_KEY, []);
    storage.set(PLOTS_KEY, [newPlot, ...current]);

    return newPlot;
  },

  async updatePlot(id, updates) {
    const plots = await this.getAllPlots();
    const index = plots.findIndex((p) => p.id === id);
    const existing = index !== -1 ? plots[index] : {};

    const area = updates.areaSqft !== undefined ? parseFloat(updates.areaSqft) : existing.areaSqft || 0;
    const rate = updates.ratePerSqft !== undefined ? parseFloat(updates.ratePerSqft) : existing.ratePerSqft || 0;
    const totalAmount = calculatePlotTotal(area, rate);

    const updatedPlot = {
      ...existing,
      ...updates,
      areaSqft: area,
      ratePerSqft: rate,
      totalAmount,
    };

    // Update in Cloud Firestore
    try {
      await updateDoc(doc(db, 'plots', id), updatedPlot);
    } catch (err) {
      console.warn('Firestore updateDoc plot note:', err.message);
    }

    // Update local cache
    if (index !== -1) {
      plots[index] = updatedPlot;
      storage.set(PLOTS_KEY, plots);
    }

    return updatedPlot;
  },

  async updatePlotStatus(id, newStatus) {
    return this.updatePlot(id, { status: newStatus });
  },

  async deletePlot(id) {
    // Delete in Cloud Firestore
    try {
      await deleteDoc(doc(db, 'plots', id));
    } catch (err) {
      console.warn('Firestore deleteDoc plot note:', err.message);
    }

    // Delete in local cache
    const plots = storage.get(PLOTS_KEY, []);
    const filtered = plots.filter((p) => p.id !== id);
    storage.set(PLOTS_KEY, filtered);

    return true;
  },

  async getProjects() {
    let projects = storage.get(PROJECTS_KEY, null);
    if (!projects) {
      projects = projectList;
      storage.set(PROJECTS_KEY, projects);
    }
    return projects;
  },
};
