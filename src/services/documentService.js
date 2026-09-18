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
import { initialDocuments } from '../data/mockDocuments';

const DOCUMENTS_KEY = 'la_plots_documents_v1';

export const documentService = {
  async getAllDocuments() {
    try {
      const docsRef = collection(db, 'documents');
      const q = query(docsRef, orderBy('uploadedAt', 'desc'));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const firestoreDocs = [];
        querySnapshot.forEach((d) => {
          firestoreDocs.push({ id: d.id, ...d.data() });
        });
        storage.set(DOCUMENTS_KEY, firestoreDocs);
        return firestoreDocs;
      }

      // Auto-seed initial documents (text records only)
      const localDocs = storage.get(DOCUMENTS_KEY, initialDocuments);
      try {
        for (const d of localDocs) {
          await setDoc(doc(db, 'documents', d.id), d, { merge: true });
        }
      } catch (seedErr) {
        console.warn('Firestore documents auto-seed note:', seedErr.message);
      }

      storage.set(DOCUMENTS_KEY, localDocs);
      return localDocs;
    } catch (err) {
      console.warn('Firestore getAllDocuments fallback:', err.message);
      let docs = storage.get(DOCUMENTS_KEY, null);
      if (!docs) {
        docs = initialDocuments;
        storage.set(DOCUMENTS_KEY, docs);
      }
      return docs;
    }
  },

  async uploadDocument(data) {
    // Only store text metadata and records in Cloud Firestore
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: data.name || 'Untitled Document',
      category: data.category || 'Other',
      notes: data.notes || '',
      fileUrl: data.fileUrl || '#',
      fileSize: data.fileSize || 'Text Record',
      fileType: data.fileType || 'text/plain',
      projectId: data.projectId || '',
      projectName: data.projectName || '',
      plotId: data.plotId || '',
      plotNumber: data.plotNumber || '',
      customerId: data.customerId || '',
      customerName: data.customerName || '',
      uploadedBy: data.uploadedBy || 'Vikram Mehta',
      uploadedAt: new Date().toISOString(),
    };

    // Store in Cloud Firestore as pure text document record
    try {
      await setDoc(doc(db, 'documents', newDoc.id), newDoc);
    } catch (err) {
      console.warn('Firestore setDoc document note:', err.message);
    }

    // Update local cache
    const current = storage.get(DOCUMENTS_KEY, []);
    storage.set(DOCUMENTS_KEY, [newDoc, ...current]);

    return newDoc;
  },

  async deleteDocument(id) {
    // Delete from Firestore
    try {
      await deleteDoc(doc(db, 'documents', id));
    } catch (err) {
      console.warn('Firestore deleteDoc document note:', err.message);
    }

    // Update local cache
    const docs = storage.get(DOCUMENTS_KEY, []);
    const filtered = docs.filter((d) => d.id !== id);
    storage.set(DOCUMENTS_KEY, filtered);

    return true;
  },
};
