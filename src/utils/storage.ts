const STORAGE_PREFIX = 'aigc_';

export function storageGet<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

export function storageSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('storageSet error:', e);
  }
}

export function storageRemove(key: string): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
}
