import { useState, useEffect, Dispatch, SetStateAction } from 'react';

function getStorageValue<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') {
        return defaultValue;
    }
    const saved = localStorage.getItem(key);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error("Failed to parse localStorage value", e);
            localStorage.removeItem(key); // Remove corrupted value
            return defaultValue;
        }
    }
    return defaultValue;
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => {
        return getStorageValue(key, initialValue);
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error("Failed to set localStorage value", e);
        }
    }, [key, value]);

    useEffect(() => {
        const handleStorage = (event: StorageEvent) => {
            if (event.key !== key) {
                return;
            }
            if (event.newValue) {
                try {
                    setValue(JSON.parse(event.newValue));
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
