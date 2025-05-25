import { apiCache, Cached, clearCacheByPattern } from '../cacheUtils';

describe('cacheUtils', () => {
  beforeEach(() => {
    apiCache.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('apiCache', () => {
    it('stores and retrieves values', () => {
      const testData = { id: 1, name: 'Test' };
      apiCache.set('test-key', testData);
      
      const retrieved = apiCache.get('test-key');
      expect(retrieved).toEqual(testData);
    });

    it('returns null for non-existent keys', () => {
      const retrieved = apiCache.get('non-existent');
      expect(retrieved).toBeNull();
    });

    it('respects expiration time', () => {
      const testData = { id: 1, name: 'Test' };
      apiCache.set('test-key', testData, { expiresIn: 1000 });
      
      // Before expiration
      expect(apiCache.get('test-key')).toEqual(testData);
      
      // After expiration
      jest.advanceTimersByTime(1100);
      expect(apiCache.get('test-key')).toBeNull();
    });

    it('removes items with remove()', () => {
      const testData = { id: 1, name: 'Test' };
      apiCache.set('test-key', testData);
      
      apiCache.remove('test-key');
      expect(apiCache.get('test-key')).toBeNull();
    });

    it('clears all items with clear()', () => {
      apiCache.set('key1', 'value1');
      apiCache.set('key2', 'value2');
      
      apiCache.clear();
      
      expect(apiCache.get('key1')).toBeNull();
      expect(apiCache.get('key2')).toBeNull();
    });

    it('clears expired items with clearExpired()', () => {
      apiCache.set('key1', 'value1', { expiresIn: 500 });
      apiCache.set('key2', 'value2', { expiresIn: 2000 });
      
      jest.advanceTimersByTime(1000);
      apiCache.clearExpired();
      
      expect(apiCache.get('key1')).toBeNull();
      expect(apiCache.get('key2')).toEqual('value2');
    });

    it('returns cache stats', () => {
      apiCache.set('key1', 'value1');
      apiCache.set('key2', 'value2');
      
      const stats = apiCache.getStats();
      expect(stats.size).toBe(2);
      expect(stats.keys).toContain('api-cache:key1');
      expect(stats.keys).toContain('api-cache:key2');
    });

    it('uses custom prefix when provided', () => {
      apiCache.setOptions({ prefix: 'custom:' });
      apiCache.set('key1', 'value1');
      
      const stats = apiCache.getStats();
      expect(stats.keys).toContain('custom:key1');
    });
  });

  describe('Cached decorator', () => {
    it('caches method results', async () => {
      class TestClass {
        callCount = 0;
        
        @Cached((id) => `test-${id}`)
        async fetchData(id: number) {
          this.callCount++;
          return { id, name: `Item ${id}` };
        }
      }
      
      const instance = new TestClass();
      
      // First call should execute the method
      const result1 = await instance.fetchData(1);
      expect(result1).toEqual({ id: 1, name: 'Item 1' });
      expect(instance.callCount).toBe(1);
      
      // Second call with same ID should use cache
      const result2 = await instance.fetchData(1);
      expect(result2).toEqual({ id: 1, name: 'Item 1' });
      expect(instance.callCount).toBe(1);
      
      // Call with different ID should execute the method
      const result3 = await instance.fetchData(2);
      expect(result3).toEqual({ id: 2, name: 'Item 2' });
      expect(instance.callCount).toBe(2);
    });
  });

  describe('clearCacheByPattern', () => {
    it('clears cache entries matching a pattern', () => {
      apiCache.set('user:1', { id: 1, name: 'User 1' });
      apiCache.set('user:2', { id: 2, name: 'User 2' });
      apiCache.set('post:1', { id: 1, title: 'Post 1' });
      
      clearCacheByPattern('user:');
      
      expect(apiCache.get('user:1')).toBeNull();
      expect(apiCache.get('user:2')).toBeNull();
      expect(apiCache.get('post:1')).not.toBeNull();
    });
  });
});
