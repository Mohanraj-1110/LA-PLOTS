import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { storage } from './storage';
import { initialConversations } from '../data/mockMessages';

const CONVERSATIONS_KEY = 'la_plots_conversations_v1';

export const messageService = {
  async getAllConversations() {
    try {
      const convosRef = collection(db, 'conversations');
      const querySnapshot = await getDocs(convosRef);

      if (!querySnapshot.empty) {
        const firestoreConvos = [];
        querySnapshot.forEach((d) => {
          firestoreConvos.push({ id: d.id, ...d.data() });
        });
        storage.set(CONVERSATIONS_KEY, firestoreConvos);
        return firestoreConvos;
      }

      // Auto-seed initial conversations
      const localConvos = storage.get(CONVERSATIONS_KEY, initialConversations);
      try {
        for (const c of localConvos) {
          await setDoc(doc(db, 'conversations', c.id), c, { merge: true });
        }
      } catch (seedErr) {
        console.warn('Firestore conversations auto-seed note:', seedErr.message);
      }

      storage.set(CONVERSATIONS_KEY, localConvos);
      return localConvos;
    } catch (err) {
      console.warn('Firestore getAllConversations fallback:', err.message);
      let convos = storage.get(CONVERSATIONS_KEY, null);
      if (!convos) {
        convos = initialConversations;
        storage.set(CONVERSATIONS_KEY, convos);
      }
      return convos;
    }
  },

  async getConversationById(id) {
    const convos = await this.getAllConversations();
    return convos.find((c) => c.id === id) || null;
  },

  async sendMessage(conversationId, text, sender = 'agent') {
    const convos = await this.getAllConversations();
    const index = convos.findIndex((c) => c.id === conversationId);
    if (index === -1) throw new Error(`Conversation ${conversationId} not found`);

    const newMsg = {
      id: `m-${Date.now()}`,
      sender,
      text,
      timestamp: new Date().toISOString(),
    };

    const target = convos[index];
    const updatedMessages = [...(target.messages || []), newMsg];
    const unreadCount = sender === 'customer' ? (target.unreadCount || 0) + 1 : (target.unreadCount || 0);

    const updatedConvo = {
      ...target,
      messages: updatedMessages,
      lastMessage: text,
      timestamp: newMsg.timestamp,
      unreadCount,
    };

    // Update in Cloud Firestore
    try {
      await updateDoc(doc(db, 'conversations', conversationId), updatedConvo);
    } catch (err) {
      console.warn('Firestore updateDoc conversation note:', err.message);
    }

    // Update local cache
    convos[index] = updatedConvo;
    storage.set(CONVERSATIONS_KEY, convos);

    return newMsg;
  },

  async markAsRead(conversationId) {
    try {
      await updateDoc(doc(db, 'conversations', conversationId), { unreadCount: 0 });
    } catch (err) {
      console.warn('Firestore markAsRead note:', err.message);
    }

    const convos = await this.getAllConversations();
    const index = convos.findIndex((c) => c.id === conversationId);
    if (index !== -1) {
      convos[index].unreadCount = 0;
      storage.set(CONVERSATIONS_KEY, convos);
    }
  },
};
