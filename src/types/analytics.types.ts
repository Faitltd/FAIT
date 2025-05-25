/**
 * Analytics system types
 */

export type TimeRange = 
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'all_time'
  | 'custom';

export type MetricType =
  | 'count'
  | 'sum'
  | 'average'
  | 'percentage'
  | 'rate';

export type ChartType =
  | 'line'
  | 'bar'
  | 'pie'
  | 'doughnut'
  | 'area'
  | 'scatter';

export type UserSegment =
  | 'all'
  | 'clients'
  | 'service_agents'
  | 'verified'
  | 'unverified'
  | 'active'
  | 'inactive'
  | 'new'
  | 'returning';

export interface MetricValue {
  value: number;
  change?: number;
  change_percentage?: number;
  previous_value?: number;
}

export interface Metric {
  id: string;
  name: string;
  description: string;
  type: MetricType;
  value: MetricValue;
  unit?: string;
  icon?: string;
  color?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface Chart {
  id: string;
  title: string;
  description: string;
  type: ChartType;
  data: ChartData;
  options?: any;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  metrics: Metric[];
  charts: Chart[];
  created_at: string;
  updated_at: string;
}

export interface UserActivity {
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata?: any;
  created_at: string;
}

export interface UserMetrics {
  user_id: string;
  full_name: string;
  user_type: string;
  avatar_url?: string;
  signup_date: string;
  last_active_date: string;
  total_logins: number;
  total_sessions: number;
  average_session_duration: number;
  total_actions: number;
  conversion_rate?: number;
  retention_rate?: number;
  engagement_score: number;
}

export interface GrowthMetrics {
  new_users: MetricValue;
  active_users: MetricValue;
  user_retention: MetricValue;
  referrals: MetricValue;
  conversion_rate: MetricValue;
  verification_rate: MetricValue;
  forum_activity: MetricValue;
  points_awarded: MetricValue;
  achievements_unlocked: MetricValue;
}

export interface AnalyticsFilter {
  time_range: TimeRange;
  custom_start_date?: string;
  custom_end_date?: string;
  user_segment?: UserSegment;
  user_type?: string;
  action_type?: string;
  resource_type?: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  user_id?: string;
  user_type?: string;
  resource_type?: string;
  resource_id?: string;
  metadata?: any;
  created_at: string;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date?: string;
  status: 'draft' | 'running' | 'completed' | 'cancelled';
  variants: {
    id: string;
    name: string;
    description: string;
    allocation_percentage: number;
    metrics: {
      [key: string]: MetricValue;
    };
  }[];
  target_metric: string;
  target_audience: UserSegment[];
  results?: {
    winning_variant?: string;
    confidence_level?: number;
    improvement_percentage?: number;
  };
}
