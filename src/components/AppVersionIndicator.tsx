import React, { useState } from 'react';

interface AppVersionIndicatorProps {
  version: string;
}

const AppVersionIndicator: React.FC<AppVersionIndicatorProps> = ({ version }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const getVersionColor = () => {
    switch (version) {
      case 'simple':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'minimal':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'enhanced':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'full':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getVersionName = () => {
    switch (version) {
      case 'simple':
        return 'Simple Test App';
      case 'minimal':
        return 'Minimal App';
      case 'enhanced':
        return 'Enhanced Minimal App';
      case 'full':
        return 'Full App';
      default:
        return 'Unknown Version';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`rounded-lg shadow-lg border ${getVersionColor()} overflow-hidden`}>
        <div 
          className="px-3 py-2 flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="font-medium text-sm">{getVersionName()}</span>
          <button 
            className="ml-2 text-xs opacity-70 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
        
        {isExpanded && (
          <div className="px-3 py-2 border-t border-opacity-20 text-xs">
            <div className="mb-2">
              <p>Try other versions:</p>
              <div className="flex flex-col mt-1 space-y-1">
                <a href="?version=simple" className="hover:underline">Simple Test App</a>
                <a href="?version=minimal" className="hover:underline">Minimal App</a>
                <a href="?version=enhanced" className="hover:underline">Enhanced Minimal App</a>
                <a href="?version=full" className="hover:underline">Full App</a>
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                className="text-xs opacity-70 hover:opacity-100 underline"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVisible(false);
                }}
              >
                Hide
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppVersionIndicator;
