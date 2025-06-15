interface ChatbotAnalytics {
  conversations: ConversationMetrics;
  performance: PerformanceMetrics;
  userFeedback: FeedbackMetrics;
  conversionRate: ConversionMetrics;
  userBehavior: BehaviorMetrics;
}

interface ConversationMetrics {
  totalConversations: number;
  averageDuration: number;
  completionRate: number;
  dropOffPoints: Record<string, number>;
  peakHours: Record<string, number>;
}

interface PerformanceMetrics {
  averageResponseTime: number;
  errorRate: number;
  successfulSubmissions: number;
  failedSubmissions: number;
}

interface FeedbackMetrics {
  averageRating: number;
  totalFeedback: number;
  sentimentAnalysis: SentimentScore;
  commonIssues: Record<string, number>;
}

interface ConversionMetrics {
  overallRate: number;
  byProjectType: Record<string, number>;
  byUserType: Record<string, number>;
  timeToConversion: number;
}

interface BehaviorMetrics {
  commonPaths: PathAnalysis[];
  userInteractions: InteractionData[];
  sessionDuration: number[];
}

export class ChatbotAnalyticsService {
  private static instance: ChatbotAnalyticsService;
  private logger: Logger;
  private cache: Map<string, any>;

  private constructor() {
    this.logger = new Logger('ChatbotAnalyticsService');
    this.cache = new Map();
  }

  public static getInstance(): ChatbotAnalyticsService {
    if (!ChatbotAnalyticsService.instance) {
      ChatbotAnalyticsService.instance = new ChatbotAnalyticsService();
    }
    return ChatbotAnalyticsService.instance;
  }

  public async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      this.logger.error('Failed to track event:', error);
    }
  }

  public async getAnalytics(timeframe: string = 'week'): Promise<ChatbotAnalytics> {
    const cacheKey = `analytics_${timeframe}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`/api/analytics?timeframe=${timeframe}`);
      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      this.logger.error('Failed to fetch analytics:', error);
      throw error;
    }
  }

  public async generateReport(filters: AnalyticsFilters): Promise<AnalyticsReport> {
    try {
      const response = await fetch('/api/analytics/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });
      return await response.json();
    } catch (error) {
      this.logger.error('Failed to generate report:', error);
      throw error;
    }
  }
}