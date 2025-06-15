import React, { useState, useEffect } from 'react';
import { ChatbotAnalyticsService } from '../../services/analytics/ChatbotAnalyticsService';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { DateRangePicker } from '../ui/DateRangePicker';

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<ChatbotAnalytics | null>(null);
  const [timeframe, setTimeframe] = useState('week');
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    new Date()
  ]);

  const analyticsService = ChatbotAnalyticsService.getInstance();

  useEffect(() => {
    loadAnalytics();
  }, [timeframe, dateRange]);

  const loadAnalytics = async () => {
    try {
      const data = await analyticsService.getAnalytics(timeframe);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  if (!analytics) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Chatbot Analytics</h1>
        <div className="flex space-x-4">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="rounded-md border-gray-300"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Conversations"
          value={analytics.conversations.totalConversations}
          trend={10}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${(analytics.conversionRate.overallRate * 100).toFixed(1)}%`}
          trend={5}
        />
        <MetricCard
          title="Avg. Response Time"
          value={`${analytics.performance.averageResponseTime}s`}
          trend={-15}
        />
        <MetricCard
          title="User Satisfaction"
          value={`${(analytics.userFeedback.averageRating * 100).toFixed(1)}%`}
          trend={8}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Conversation Trends">
          <Line
            data={conversationTrendsData}
            options={chartOptions}
          />
        </ChartCard>
        <ChartCard title="Conversion by Project Type">
          <Bar
            data={conversionByTypeData}
            options={chartOptions}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UserFeedbackAnalysis feedback={analytics.userFeedback} />
        <DropOffAnalysis dropOffPoints={analytics.conversations.dropOffPoints} />
        <UserBehaviorAnalysis behavior={analytics.userBehavior} />
      </div>
    </div>
  );
}

function UserFeedbackAnalysis({ feedback }: { feedback: FeedbackMetrics }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">User Feedback Analysis</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Sentiment Distribution</h3>
          <Pie
            data={sentimentData}
            options={pieOptions}
          />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Common Issues</h3>
          <div className="space-y-2">
            {Object.entries(feedback.commonIssues)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([issue, count]) => (
                <div key={issue} className="flex justify-between">
                  <span>{issue}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}