import { beforeEach, describe, expect, it } from 'vitest';
import api, { setAccessToken } from './api';

const createStorage = () => {
    const store = new Map();

    return {
        getItem(key) {
            return store.has(key) ? store.get(key) : null;
        },
        setItem(key, value) {
            store.set(key, String(value));
        },
        removeItem(key) {
            store.delete(key);
        },
        clear() {
            store.clear();
        },
    };
};

beforeEach(() => {
    globalThis.localStorage = createStorage();
    setAccessToken(null);
});

describe('api auth header injection', () => {
    it('attaches the Authorization header from the in-memory token when localStorage is empty', async () => {
        setAccessToken('memory-token');

        const result = await api.interceptors.request.handlers[0].fulfilled({
            headers: {},
            url: '/tickets',
        });

        expect(result.headers.Authorization).toBe('Bearer memory-token');
    });
});
