import React, { useState } from 'react';
import { format, isValid, parse } from 'date-fns';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  id?: string;
  name: string;
  label?: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = 'Select date',
  required = false,
  disabled = false,
  className = '',
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value ? format(new Date(value), 'MM/dd/yyyy') : '');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Try to parse the date
    const parsedDate = parse(newValue, 'MM/dd/yyyy', new Date());
    if (isValid(parsedDate)) {
      onChange(name, format(parsedDate, 'yyyy-MM-dd'));
    }
  };

  const handleCalendarClick = () => {
    setIsOpen(!isOpen);
  };

  const handleDateSelect = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const displayDate = format(date, 'MM/dd/yyyy');
    
    setInputValue(displayDate);
    onChange(name, formattedDate);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label 
          htmlFor={id || name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type="text"
          id={id || name}
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            block w-full rounded-md border-gray-300 shadow-sm 
            focus:border-blue-500 focus:ring-blue-500 sm:text-sm
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
        />
        <button
          type="button"
          onClick={handleCalendarClick}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
          disabled={disabled}
        >
          <Calendar size={18} />
        </button>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 p-2">
          {/* Simple calendar implementation - in a real app, use a proper calendar component */}
          <div className="grid grid-cols-7 gap-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 p-1">
                {day}
              </div>
            ))}
            
            {/* This is a simplified calendar - in a real app, generate actual dates */}
            {Array.from({ length: 31 }, (_, i) => {
              const date = new Date();
              date.setDate(i + 1);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDateSelect(date)}
                  className="text-center p-1 text-sm hover:bg-gray-100 rounded-md"
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
