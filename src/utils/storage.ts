export function safeGetItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch (e) {
    console.warn("localStorage access denied", e);
    return null;
  }
}

export function safeSetItem(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch (e) {
    console.warn("localStorage access denied", e);
  }
}

export function safeRemoveItem(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch (e) {
    console.warn("localStorage access denied", e);
  }
}
