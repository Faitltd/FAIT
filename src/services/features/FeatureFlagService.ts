import { Logger } from '../logging/Logger';
import { CacheService } from '../cache/CacheService';

interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage?: number;
  rules?: {
    userGroups?: string[];
    regions?: string[];
    startDate?: string;
    endDate?: string;
  };
}

export class FeatureFlagService {
  private static instance: FeatureFlagService;
  private logger: Logger;
  private cache: CacheService;
  private flags: Map<string, FeatureFlag> = new Map();

  private constructor() {
    this.logger = new Logger('FeatureFlagService');
    this.cache = CacheService.getInstance();
    this.initializeFlags();
  }

  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  private async initializeFlags(): Promise<void> {
    try {
      const cachedFlags = this.cache.get<FeatureFlag[]>('feature-flags');
      if (cachedFlags) {
        this.updateFlags(cachedFlags);
        return;
      }

      const response = await fetch(`${environment.apiUrl}/feature-flags`);
      const flags: FeatureFlag[] = await response.json();
      
      this.updateFlags(flags);
      this.cache.set('feature-flags', flags);
    } catch (error) {
      this.logger.error('Failed to initialize feature flags:', error);
    }
  }

  private updateFlags(flags: FeatureFlag[]): void {
    this.flags.clear();
    flags.forEach(flag => this.flags.set(flag.name, flag));
  }

  public isEnabled(featureName: string): boolean {
    const flag = this.flags.get(featureName);
    if (!flag) {
      this.logger.warn(`Feature flag "${featureName}" not found`);
      return false;
    }

    if (!flag.enabled) return false;

    if (flag.rolloutPercentage) {
      const userHash = this.getUserHash();
      return (userHash % 100) < flag.rolloutPercentage;
    }

    if (flag.rules) {
      return this.evaluateRules(flag.rules);
    }

    return true;
  }

  private getUserHash(): number {
    const userId = localStorage.getItem('userId') || 'anonymous';
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash % 100);
  }

  private evaluateRules(rules: FeatureFlag['rules']): boolean {
    if (!rules) return true;

    const userGroups = this.getCurrentUserGroups();
    if (rules.userGroups && !rules.userGroups.some(group => userGroups.includes(group))) {
      return false;
    }

    const userRegion = this.getUserRegion();
    if (rules.regions && !rules.regions.includes(userRegion)) {
      return false;
    }

    const now = new Date();
    if (rules.startDate && new Date(rules.startDate) > now) {
      return false;
    }
    if (rules.endDate && new Date(rules.endDate) < now) {
      return false;
    }

    return true;
  }

  private getCurrentUserGroups(): string[] {
    // Implement your user groups logic here
    return [];
  }

  private getUserRegion(): string {
    // Implement your region detection logic here
    return 'US';
  }
}