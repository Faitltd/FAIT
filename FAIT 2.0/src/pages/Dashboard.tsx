import React from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Users,
  DollarSign,
  Calendar,
  Briefcase,
  Wrench,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import DashboardStats from '../components/dashboard/DashboardStats';
import { useFAIT } from '../contexts/FAITContext';
import { UserRole } from '../types/UserRoles';
import {
  FadeInView,
  ScaleInView,
  SlideInView,
  RevealOnScroll
} from '../components/animations';

const Dashboard: React.FC = () => {
  const { userRole } = useFAIT();

  // Sample data for different user roles
  const roleSpecificStats = {
    [UserRole.CLIENT]: [
      { title: 'Active Projects', value: 3, icon: <Briefcase className="h-6 w-6 text-blue-500" />, detail: 'In progress', change: { value: 20, isPositive: true } },
      { title: 'Completed Projects', value: 12, icon: <CheckCircle className="h-6 w-6 text-green-500" />, detail: 'All time' },
      { title: 'Contractors Hired', value: 8, icon: <Wrench className="h-6 w-6 text-purple-500" />, detail: 'From 5 companies' },
      { title: 'Upcoming Appointments', value: 2, icon: <Calendar className="h-6 w-6 text-orange-500" />, detail: 'Next 7 days' },
    ],
    [UserRole.CONTRACTOR]: [
      { title: 'Active Jobs', value: 5, icon: <Briefcase className="h-6 w-6 text-blue-500" />, detail: 'In progress', change: { value: 15, isPositive: true } },
      { title: 'Completed Jobs', value: 47, icon: <CheckCircle className="h-6 w-6 text-green-500" />, detail: 'All time' },
      { title: 'Upcoming Appointments', value: 8, icon: <Calendar className="h-6 w-6 text-orange-500" />, detail: 'Next 7 days' },
      { title: 'Average Rating', value: '4.8', icon: <TrendingUp className="h-6 w-6 text-purple-500" />, detail: 'From 32 reviews' },
    ],
    [UserRole.ADMIN]: [
      { title: 'Total Users', value: 256, icon: <Users className="h-6 w-6 text-blue-500" />, detail: 'Active accounts', change: { value: 12, isPositive: true } },
      { title: 'Active Projects', value: 42, icon: <Briefcase className="h-6 w-6 text-green-500" />, detail: 'In progress' },
      { title: 'Platform Revenue', value: '$12,450', icon: <DollarSign className="h-6 w-6 text-purple-500" />, detail: 'This month', change: { value: 8, isPositive: true } },
      { title: 'Support Tickets', value: 5, icon: <MessageSquare className="h-6 w-6 text-orange-500" />, detail: 'Open tickets', change: { value: 30, isPositive: false } },
    ],
    [UserRole.ALLY]: [
      { title: 'Partner Projects', value: 15, icon: <Briefcase className="h-6 w-6 text-blue-500" />, detail: 'Active collaborations', change: { value: 25, isPositive: true } },
      { title: 'Resources Shared', value: 28, icon: <Wrench className="h-6 w-6 text-green-500" />, detail: 'All time' },
      { title: 'Community Impact', value: '$32,800', icon: <DollarSign className="h-6 w-6 text-purple-500" />, detail: 'Value generated' },
      { title: 'Upcoming Events', value: 3, icon: <Calendar className="h-6 w-6 text-orange-500" />, detail: 'Next 30 days' },
    ],
  };

  // Default stats if no role-specific stats are available
  const defaultStats = [
    { title: 'Platform Users', value: 256, icon: <Users className="h-6 w-6 text-blue-500" />, detail: 'Active accounts' },
    { title: 'Active Projects', value: 42, icon: <Briefcase className="h-6 w-6 text-green-500" />, detail: 'In progress' },
    { title: 'Platform Activity', value: '24/7', icon: <Clock className="h-6 w-6 text-purple-500" />, detail: 'Continuous operation' },
    { title: 'Community Size', value: 1250, icon: <Home className="h-6 w-6 text-orange-500" />, detail: 'Growing daily' },
  ];

  const stats = userRole && roleSpecificStats[userRole] ? roleSpecificStats[userRole] : defaultStats;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to your FAIT Platform dashboard. Here's an overview of your activity.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <FadeInView key={stat.title} delay={0.1 * index}>
            <DashboardStats
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              detail={stat.detail}
              change={stat.change}
              delay={0.1 * index}
            />
          </FadeInView>
        ))}
      </div>

      {/* Recent Activity Section */}
      <SlideInView delay={0.4} direction="up">
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item, index) => (
              <RevealOnScroll
                key={item}
                delay={0.1 * index}
                direction="left"
              >
                <div className="flex items-start p-3 hover:bg-gray-50 rounded-md transition-colors">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      Activity {item} - Lorem ipsum dolor sit amet
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {item} hour{item !== 1 ? 's' : ''} ago
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </SlideInView>

      {/* Quick Actions Section */}
      <ScaleInView delay={0.6}>
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: 'New Project', icon: <Briefcase className="h-6 w-6" />, color: 'bg-blue-100 text-blue-600' },
              { name: 'Schedule', icon: <Calendar className="h-6 w-6" />, color: 'bg-green-100 text-green-600' },
              { name: 'Messages', icon: <MessageSquare className="h-6 w-6" />, color: 'bg-purple-100 text-purple-600' },
              { name: 'Find Help', icon: <Wrench className="h-6 w-6" />, color: 'bg-orange-100 text-orange-600' },
            ].map((action, index) => (
              <motion.div
                key={action.name}
                className={`${action.color} rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer`}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: { delay: 0.7 + (index * 0.1) }
                }}
              >
                {action.icon}
                <span className="mt-2 text-sm font-medium">{action.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </ScaleInView>
    </div>
  );
};

export default Dashboard;
