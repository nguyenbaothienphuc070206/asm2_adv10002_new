/**
 * LocalStorage Service with In-Memory Map Fallback and Namespace Prefixing
 * Ensures full persistence across browser sessions and deterministic state in Node.js unit tests
 * or strict private-browsing environments where localStorage is disabled.
 */
export class StorageService {
  constructor(prefix = 'th_') {
    this.prefix = prefix;
    this.memoryFallback = new Map();
    this.storage = (() => {
      try {
        localStorage.setItem('th_test', '1');
        localStorage.removeItem('th_test');
        return localStorage;
      } catch {
        return null;
      }
    })();
  }

  get(key, defaultValue = null) {
    const fullKey = this.prefix + key;
    try {
      if (!this.storage) {
        return this.memoryFallback.has(fullKey)
          ? JSON.parse(this.memoryFallback.get(fullKey))
          : defaultValue;
      }
      const val = this.storage.getItem(fullKey);
      return val === null ? defaultValue : JSON.parse(val);
    } catch {
      return defaultValue;
    }
  }

  set(key, value) {
    const fullKey = this.prefix + key;
    const serialized = JSON.stringify(value);
    try {
      if (!this.storage) {
        this.memoryFallback.set(fullKey, serialized);
        return;
      }
      this.storage.setItem(fullKey, serialized);
    } catch {
      this.memoryFallback.set(fullKey, serialized);
    }
  }

  remove(key) {
    const fullKey = this.prefix + key;
    try {
      this.memoryFallback.delete(fullKey);
      if (this.storage) {
        this.storage.removeItem(fullKey);
      }
    } catch {
      // Ignore storage error
    }
  }
}

export const storageService = new StorageService();
