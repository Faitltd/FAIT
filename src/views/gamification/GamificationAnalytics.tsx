import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gamificationAnalyticsService } from '../../services/analytics/GamificationAnalyticsService';
import { 
  AnalyticsFilterOptions, 
  AnalyticsTimePeriod,
  GamificationAnalyticsDashboard
} from '../../types/gamification-analytics.types';
import AnalyticsFilters from '../../modules/gamification/components/analytics/AnalyticsFilters';
import EngagementMetricsCard from '../../modules/gamification/components/analytics/EngagementMetricsCard';
import ImpactMetricsCard from '../../modules/gamification/components/analytics/ImpactMetricsCard';
import EngagementDistributionChart from '../../modules/gamification/components/analytics/EngagementDistributionChart';
import TimeSeriesChart from '../../modules/gamification/components/analytics/TimeSeriesChart';
import TopChallengesCard from '../../modules/gamification/components/analytics/TopChallengesCard';

/**
 * Gamification Analytics Dashboard View
 */
const GamificationAnalytics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<GamificationAnalyticsDashboard | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilterOptions>({
    timePeriod: AnalyticsTimePeriod.MONTH
  });

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await gamificationAnalyticsService.getAnalyticsDashboard(filters);
      setDashboardData(data);
    } catch (err: any) {
      console.error('Error fetching gamification analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: AnalyticsFilterOptions) => {
    setFilters(newFilters);
  };

  // Fetch data when filters change
  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">Gamification Analytics</h1>
              <div className="flex space-x-4">
                <Link
                  to="/gamification"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back to Dashboard
                </Link>
                <button
                  onClick={fetchDashboardData}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Error message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4 my-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading analytics data</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="my-6">
              <AnalyticsFilters
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>

            {/* Dashboard Content */}
            <div className="space-y-6 py-6">
              {/* Top Row: Engagement and Impact Metrics */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {dashboardData && (
                  <>
                    <EngagementMetricsCard
                      metrics={dashboardData.engagementMetrics}
                      isLoading={isLoading}
                    />
                    <ImpactMetricsCard
                      metrics={dashboardData.impactMetrics}
                      isLoading={isLoading}
                    />
                  </>
                )}
              </div>

              {/* Middle Row: Charts */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {dashboardData && (
                  <>
                    <EngagementDistributionChart
                      distribution={dashboardData.userEngagementDistribution}
                      isLoading={isLoading}
                    />
                    <TopChallengesCard
                      challenges={dashboardData.topChallenges}
                      isLoading={isLoading}
                    />
                  </>
                )}
              </div>

              {/* Bottom Row: Time Series Charts */}
              <div className="space-y-6">
                {dashboardData && (
                  <>
                    <TimeSeriesChart
                      data={dashboardData.pointsAwardedOverTime}
                      title="Points Awarded Over Time"
                      description="Total points awarded to users over the selected time period"
                      yAxisLabel="Points"
                      isLoading={isLoading}
                    />
                    <TimeSeriesChart
                      data={dashboardData.userEngagementOverTime}
                      title="User Engagement Over Time"
                      description="Number of active users over the selected time period"
                      yAxisLabel="Active Users"
                      isLoading={isLoading}
                    />
                    <TimeSeriesChart
                      data={dashboardData.retentionOverTime}
                      title="Retention Rate Over Time"
                      description="User retention rate over the selected time period"
                      yAxisLabel="Retention Rate (%)"
                      isLoading={isLoading}
                    />
                  </>
                )}
              </div>

              {/* Loading State */}
              {isLoading && !dashboardData && (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GamificationAnalytics;
