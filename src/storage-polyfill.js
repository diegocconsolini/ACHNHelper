// Polyfill for window.storage API used by Claude artifacts
// Maps to localStorage in a normal browser environment

if (!window.storage) {
  window.storage = {
    async get(key) {
      const value = localStorage.getItem(key);
      return value !== null ? { value } : null;
    },
    async set(key, value) {
      localStorage.setItem(key, value);
    },
    async delete(key) {
      localStorage.removeItem(key);
    },
    async list() {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
      }
      return keys;
    }
  };
}
