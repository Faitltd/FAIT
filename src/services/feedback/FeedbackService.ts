interface FeedbackForm {
  id: string;
  rating: number;
  comment?: string;
  category: FeedbackCategory;
  tags: string[];
  sessionId: string;
  timestamp: Date;
}

type FeedbackCategory = 'usability' | 'performance' | 'feature' | 'bug' | 'other';

export class FeedbackService {
  private static instance: FeedbackService;
  private logger: Logger;
  private analyticsService: ChatbotAnalyticsService;

  private constructor() {
    this.logger = new Logger('FeedbackService');
    this.analyticsService = ChatbotAnalyticsService.getInstance();
  }

  public static getInstance(): FeedbackService {
    if (!FeedbackService.instance) {
      FeedbackService.instance = new FeedbackService();
    }
    return FeedbackService.instance;
  }

  public async submitFeedback(feedback: Omit<FeedbackForm, 'id' | 'timestamp'>): Promise<void> {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...feedback,
          timestamp: new Date(),
        }),
      });

      if (!response.ok) throw new Error('Failed to submit feedback');

      // Track feedback event
      await this.analyticsService.trackEvent({
        type: 'feedback_submitted',
        data: feedback,
      });
    } catch (error) {
      this.logger.error('Failed to submit feedback:', error);
      throw error;
    }
  }

  public async getFeedbackSummary(): Promise<FeedbackSummary> {
    try {
      const response = await fetch('/api/feedback/summary');
      return await response.json();
    } catch (error) {
      this.logger.error('Failed to get feedback summary:', error);
      throw error;
    }
  }
}