import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { Card } from './CardNew';

interface ActionCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  linkUrl: string;
  className?: string;
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  iconBgColor = 'bg-primary-100',
  linkUrl,
  className = '',
}) => {
  return (
    <Link to={linkUrl} className="block">
      <Card
        className={classNames('hover:shadow-card-hover transition-shadow', className)}
        padding="none"
      >
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${iconBgColor} rounded-md p-1.5`}>
              {icon}
            </div>
            <div className="ml-3">
              <h3 className="text-base font-medium text-neutral-900">{title}</h3>
              {description && (
                <p className="text-xs text-neutral-500">{description}</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ActionCard;
