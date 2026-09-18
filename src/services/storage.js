/**
 * Safe localStorage wrapper with memory fallback
 */
const memoryStore = {};

export const storage = {
  get(key, fallback = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return memoryStore[key] ?? fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      memoryStore[key] = value;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      delete memoryStore[key];
    }
  },
};
