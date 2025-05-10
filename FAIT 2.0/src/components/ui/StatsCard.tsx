import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { Card } from './CardNew';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: string;
  linkText?: string;
  linkUrl?: string;
  loading?: boolean;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  iconBgColor = 'bg-primary-100',
  linkText,
  linkUrl,
  loading = false,
  className = '',
}) => {
  return (
    <Card
      className={classNames('overflow-hidden', className)}
      padding="none"
    >
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBgColor} rounded-md p-1.5`}>
            {icon}
          </div>
          <div className="ml-3 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-500 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-neutral-900">
                  {loading ? '...' : value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>

      {linkText && linkUrl && (
        <div className="bg-neutral-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <Link to={linkUrl} className="font-medium text-primary-600 hover:text-primary-500">
              {linkText}
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
};

export default StatsCard;
