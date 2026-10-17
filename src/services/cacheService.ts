interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheItem<any>> = new Map();
  private maxCapacity: number;
  private hits: number = 0;
  private misses: number = 0;

  constructor(maxCapacity: number = 500) {
    this.maxCapacity = maxCapacity;
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) {
      this.misses += 1;
      return undefined;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.misses += 1;
      return undefined;
    }

    // Refresh position for LRU
    this.cache.delete(key);
    this.cache.set(key, item);
    this.hits += 1;
    return item.value as T;
  }

  public set<T>(key: string, value: T, ttlSeconds: number = 60): void {
    if (this.cache.size >= this.maxCapacity) {
      // Evict oldest (first key in map iterator)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  public clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  public getStats() {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRatio: this.hits + this.misses > 0 ? (this.hits / (this.hits + this.misses)).toFixed(2) : '0.00'
    };
  }
}
