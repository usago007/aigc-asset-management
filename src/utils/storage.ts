const STORAGE_PREFIX = 'aigc_';

export function safeStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeStorageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error('safeStorageSet error:', e);
  }
}

export function safeStorageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('safeStorageRemove error:', e);
  }
}

export function storageGet<T>(key: string, defaultValue: T): T {
  try {
    const item = safeStorageGet(`${STORAGE_PREFIX}${key}`);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

export function storageSet<T>(key: string, value: T): void {
  try {
    safeStorageSet(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('storageSet error:', e);
  }
}

export function storageRemove(key: string): void {
  safeStorageRemove(`${STORAGE_PREFIX}${key}`);
}
