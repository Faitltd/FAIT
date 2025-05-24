import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimeSelectorProps {
  value: string;
  onChange: (time: string) => void;
  availableTimes: string[];
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  value,
  onChange,
  availableTimes,
  disabled = false,
  required = false,
  id = 'time-selector'
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Format time for display (e.g., "14:00" -> "2:00 PM")
  const formatTimeForDisplay = (time: string): string => {
    if (!time) return '';

    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="relative">
      <div className="relative">
        <div
          className="relative w-full"
          onClick={() => {
            if (!disabled && availableTimes.length > 0) {
              setShowDropdown(!showDropdown);
            }
          }}
        >
          <div
            ref={selectRef}
            className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm cursor-pointer ${disabled || availableTimes.length === 0 ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
          >
            {value ? formatTimeForDisplay(value) : 'Select a time'}
          </div>
          <div
            className="absolute right-3 top-2 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled && availableTimes.length > 0) {
                setShowDropdown(!showDropdown);
              }
            }}
          >
            <Clock className="h-5 w-5 text-gray-400" />
          </div>

          {/* Hidden select for form submission */}
          <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || availableTimes.length === 0}
            required={required}
            className="sr-only"
          >
            <option value="">Select a time</option>
            {availableTimes.map(timeSlot => (
              <option key={timeSlot} value={timeSlot}>
                {formatTimeForDisplay(timeSlot)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showDropdown && availableTimes.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto"
        >
          <div className="py-1">
            {availableTimes.map(timeSlot => (
              <div
                key={timeSlot}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  value === timeSlot ? 'bg-blue-50 text-blue-700' : ''
                }`}
                onClick={() => {
                  onChange(timeSlot);
                  setShowDropdown(false);
                }}
              >
                {formatTimeForDisplay(timeSlot)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSelector;
