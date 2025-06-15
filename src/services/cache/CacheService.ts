import { Logger } from '../logging/Logger';

interface CacheOptions {
  ttl: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
}

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, { value: any; timestamp: number }>;
  private logger: Logger;
  private options: CacheOptions;

  private constructor(options: CacheOptions) {
    this.cache = new Map();
    this.logger = new Logger('CacheService');
    this.options = options;
  }

  public static getInstance(options: CacheOptions = { ttl: 5 * 60 * 1000 }): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(options);
    }
    return CacheService.instance;
  }

  public set(key: string, value: any): void {
    this.cleanup();
    
    if (this.options.maxSize && this.cache.size >= this.options.maxSize) {
      const oldestKey = this.findOldestKey();
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
    this.logger.debug(`Cache set for key: ${key}`);
  }

  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;

    if (this.isExpired(item.timestamp)) {
      this.cache.delete(key);
      this.logger.debug(`Cache expired for key: ${key}`);
      return null;
    }

    this.logger.debug(`Cache hit for key: ${key}`);
    return item.value as T;
  }

  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.options.ttl;
  }

  private findOldestKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    this.cache.forEach((value, key) => {
      if (value.timestamp < oldestTimestamp) {
        oldestTimestamp = value.timestamp;
        oldestKey = key;
      }
    });

    return oldestKey;
  }

  private cleanup(): void {
    this.cache.forEach((value, key) => {
      if (this.isExpired(value.timestamp)) {
        this.cache.delete(key);
      }
    });
  }
}