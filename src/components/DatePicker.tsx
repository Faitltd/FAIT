import React, { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  min?: string;
  required?: boolean;
  id?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  min,
  required = false,
  id = 'date-picker'
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate calendar days
  const generateCalendar = () => {
    const today = new Date();
    const currentDate = value ? new Date(value) : today;
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const minDate = min ? new Date(min) : null;

    const days = [];
    let day = 1;

    // Create weeks
    for (let i = 0; i < 6; i++) {
      const week = [];

      // Create days in a week
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < startingDay) {
          // Empty cells before the first day
          week.push(null);
        } else if (day > daysInMonth) {
          // Empty cells after the last day
          week.push(null);
        } else {
          // Valid day
          const date = new Date(currentYear, currentMonth, day);
          const isDisabled = minDate ? date < minDate : false;
          const isSelected = value === date.toISOString().split('T')[0];

          week.push({
            day,
            date,
            isDisabled,
            isSelected,
            isToday: date.toDateString() === today.toDateString()
          });

          day++;
        }
      }

      days.push(week);

      // Stop if we've gone past the last day
      if (day > daysInMonth) {
        break;
      }
    }

    return {
      days,
      month: currentDate.toLocaleString('default', { month: 'long' }),
      year: currentYear
    };
  };

  const calendar = generateCalendar();

  const handleDateClick = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    onChange(formattedDate);
    setShowCalendar(false);
  };

  const handlePrevMonth = () => {
    if (!value) return;

    const date = new Date(value);
    date.setMonth(date.getMonth() - 1);
    onChange(date.toISOString().split('T')[0]);
  };

  const handleNextMonth = () => {
    if (!value) return;

    const date = new Date(value);
    date.setMonth(date.getMonth() + 1);
    onChange(date.toISOString().split('T')[0]);
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <div
          className="relative w-full"
          onClick={() => setShowCalendar(true)}
        >
          <input
            ref={inputRef}
            type="date"
            id={id}
            value={value}
            min={min}
            required={required}
            onChange={(e) => onChange(e.target.value)}
            onClick={(e) => {
              // Prevent the native date picker from opening on mobile
              e.preventDefault();
              setShowCalendar(true);
            }}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm cursor-pointer"
          />
        </div>
        <div
          className="absolute right-3 top-2 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setShowCalendar(true);
          }}
        >
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {showCalendar && (
        <div
          ref={calendarRef}
          className="absolute z-10 mt-1 w-64 bg-white shadow-lg rounded-md border border-gray-200"
        >
          <div className="p-2 border-b flex justify-between items-center">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              &lt;
            </button>
            <div className="font-medium">
              {calendar.month} {calendar.year}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              &gt;
            </button>
          </div>

          <div className="p-2">
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
              <div>Su</div>
              <div>Mo</div>
              <div>Tu</div>
              <div>We</div>
              <div>Th</div>
              <div>Fr</div>
              <div>Sa</div>
            </div>

            <div className="mt-1">
              {calendar.days.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-1">
                  {week.map((day, dayIndex) => (
                    <div key={dayIndex} className="text-center">
                      {day ? (
                        <button
                          type="button"
                          disabled={day.isDisabled}
                          onClick={() => handleDateClick(day.date)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                            ${day.isSelected ? 'bg-blue-600 text-white' : ''}
                            ${day.isToday && !day.isSelected ? 'border border-blue-600' : ''}
                            ${day.isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                          `}
                        >
                          {day.day}
                        </button>
                      ) : (
                        <div className="w-8 h-8"></div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
