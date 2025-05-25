import React from 'react';
import { Car, Walking, Bike, Bus } from 'lucide-react';
import { TransportMode } from '../../utils/directionsService';

interface TransportModeSelectorProps {
  selectedMode: TransportMode;
  onChange: (mode: TransportMode) => void;
  className?: string;
}

/**
 * Component for selecting transportation mode
 */
const TransportModeSelector: React.FC<TransportModeSelectorProps> = ({
  selectedMode,
  onChange,
  className = '',
}) => {
  const transportModes: { mode: TransportMode; label: string; icon: React.ReactNode }[] = [
    {
      mode: 'DRIVING',
      label: 'Driving',
      icon: <Car className="h-4 w-4" />,
    },
    {
      mode: 'WALKING',
      label: 'Walking',
      icon: <Walking className="h-4 w-4" />,
    },
    {
      mode: 'BICYCLING',
      label: 'Cycling',
      icon: <Bike className="h-4 w-4" />,
    },
    {
      mode: 'TRANSIT',
      label: 'Transit',
      icon: <Bus className="h-4 w-4" />,
    },
  ];

  return (
    <div className={`flex space-x-1 ${className}`}>
      {transportModes.map(({ mode, label, icon }) => (
        <button
          key={mode}
          type="button"
          className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            selectedMode === mode
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => onChange(mode)}
          title={label}
        >
          {icon}
          <span className="ml-1.5 hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};

export default TransportModeSelector;
