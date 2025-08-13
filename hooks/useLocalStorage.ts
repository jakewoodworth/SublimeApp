import { useState, useEffect, Dispatch, SetStateAction } from 'react';

interface UseLocalStorageOptions {
    /**
     * Maximum age in milliseconds before the stored value expires
     * and is removed from storage. If not provided, values persist
     * indefinitely.
     */
    maxAge?: number;
}

interface StorageEntry<T> {
    value: T;
    timestamp: number;
}

// Fallback map when localStorage is unavailable or full.
const memoryStorage = new Map<string, StorageEntry<any>>();

function getStorageValue<T>(key: string, defaultValue: T, options: UseLocalStorageOptions): T {
    if (typeof window === 'undefined') {
        return defaultValue;
    }
    const now = Date.now();
    const saved = localStorage.getItem(key);
    if (saved) {
        try {
            const parsed: StorageEntry<T> = JSON.parse(saved);
            if (options.maxAge && now - parsed.timestamp > options.maxAge) {
                localStorage.removeItem(key);
            } else {
                return parsed.value;
            }
        } catch (e) {
            console.error("Failed to parse localStorage value", e);
            localStorage.removeItem(key); // Remove corrupted value
        }
    }

    const memoryValue = memoryStorage.get(key);
    if (memoryValue) {
        if (options.maxAge && now - memoryValue.timestamp > options.maxAge) {
            memoryStorage.delete(key);
        } else {
            return memoryValue.value;
        }
    }
    return defaultValue;
}

export function useLocalStorage<T>(
    key: string,
    initialValue: T,
    options: UseLocalStorageOptions = {}
): [T, Dispatch<SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => {
        return getStorageValue(key, initialValue, options);
    });

    useEffect(() => {
        try {
            const entry: StorageEntry<T> = { value, timestamp: Date.now() };
            localStorage.setItem(key, JSON.stringify(entry));
            memoryStorage.delete(key); // clear fallback on successful write
        } catch (e: any) {
            if (e instanceof DOMException && e.name === 'QuotaExceededError') {
                console.warn('LocalStorage quota exceeded. Attempting cleanup.');
                try {
                    // Remove the oldest entry to make room
                    let oldestKey: string | null = null;
                    let oldestTimestamp = Infinity;
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        if (!k) continue;
                        const item = localStorage.getItem(k);
                        if (!item) continue;
                        try {
                            const parsed: StorageEntry<any> = JSON.parse(item);
                            if (parsed.timestamp < oldestTimestamp) {
                                oldestTimestamp = parsed.timestamp;
                                oldestKey = k;
                            }
                        } catch {
                            // If parsing fails, remove corrupted entry
                            localStorage.removeItem(k);
                        }
                    }
                    if (oldestKey) {
                        localStorage.removeItem(oldestKey);
                        const entry: StorageEntry<T> = { value, timestamp: Date.now() };
                        localStorage.setItem(key, JSON.stringify(entry));
                        memoryStorage.delete(key);
                    } else {
                        memoryStorage.set(key, { value, timestamp: Date.now() });
                        console.warn('LocalStorage quota exceeded. Using in-memory fallback.');
                    }
                } catch {
                    memoryStorage.set(key, { value, timestamp: Date.now() });
                    console.warn('LocalStorage quota exceeded. Using in-memory fallback.');
                }
            } else {
                console.error("Failed to set localStorage value", e);
            }
        }
    }, [key, value, options.maxAge]);

    useEffect(() => {
        const handleStorage = (event: StorageEvent) => {
            if (event.key !== key) {
                return;
            }
            if (event.newValue) {
                try {
                    const parsed: StorageEntry<T> = JSON.parse(event.newValue);
                    setValue(parsed.value);
                } catch (e) {
                    console.error("Failed to parse localStorage value", e);
                }
            } else {
                setValue(initialValue);
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => {
            window.removeEventListener('storage', handleStorage);
        };
    }, [key, initialValue]);

    return [value, setValue];
}
