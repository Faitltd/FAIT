import React from 'react';
import { Dashboard as DashboardType } from '../../../types/analytics.types';
import MetricCard from './MetricCard';
import ChartCard from './ChartCard';

interface DashboardProps {
  dashboard: DashboardType;
  className?: string;
}

/**
 * Component to display an analytics dashboard
 */
const Dashboard: React.FC<DashboardProps> = ({ 
  dashboard,
  className = ''
}) => {
  return (
    <div className={`${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{dashboard.name}</h2>
        {dashboard.description && (
          <p className="mt-1 text-sm text-gray-500">{dashboard.description}</p>
        )}
      </div>

      {/* Metrics */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Key Metrics</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {dashboard.metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>

      {/* Charts */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Charts</h3>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {dashboard.charts.map((chart) => (
            <ChartCard key={chart.id} chart={chart} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
