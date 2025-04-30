import React, { useState, useEffect, useRef } from 'react';

// Define types for props
interface DatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date) => void;
  pickerType?: 'month-year' | 'day-month-year'; // New prop, defaults to 'month-year'
}

// Helper function to get month names
const getMonthNames = (locale: string = 'en-US', format: 'short' | 'long' | 'narrow' = 'short'): string[] => {
  const formatter = new Intl.DateTimeFormat(locale, { month: format, timeZone: 'UTC' });
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(Date.UTC(2000, i, 1)); // Use UTC to avoid timezone issues
    return formatter.format(date);
  });
  return months;
};

// Helper function to get days in a month
const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

// Helper function to get the first day of the month (0=Sun, 1=Mon, ...)
const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

// Helper function to format date
const formatDate = (date: Date | null, type: 'month-year' | 'day-month-year', months: string[]): string => {
    if (!date) {
        return type === 'month-year' ? 'Select Month / Year' : 'Select Date';
    }
    if (type === 'month-year') {
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    } else {
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day < 10 ? '0' + day : day} ${month} ${year}`;
    }
};

// Renamed Component: DatePicker
export const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onChange,
  pickerType = 'month-year', // Default to month-year
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  // State for the currently *viewed* month and year in the picker
  const [viewDate, setViewDate] = useState<Date>(selectedDate || new Date());

  const pickerRef = useRef<HTMLDivElement>(null);
  const months: string[] = getMonthNames();
  const daysOfWeek: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // Or use Intl for localization

  // Update viewDate if selectedDate changes from outside
  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
    }
  }, [selectedDate]);

  // Handle clicks outside the picker to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [pickerRef]);

  // Toggle the picker display
  const togglePicker = () => {
    // Reset view to selected date or current date when opening
    if (!isOpen) {
        setViewDate(selectedDate || new Date());
    }
    setIsOpen(!isOpen);
  };

  // Handle view month/year change
  const handleViewChange = (increment: number, unit: 'month' | 'year') => {
    setViewDate(prevDate => {
        const newDate = new Date(prevDate);
        if (unit === 'month') {
            newDate.setMonth(newDate.getMonth() + increment);
        } else {
            newDate.setFullYear(newDate.getFullYear() + increment);
        }
        return newDate;
    });
  };

  // Handle month selection (only relevant for month-year picker type)
  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(viewDate.getFullYear(), monthIndex, 1);
    if (pickerType === 'month-year') {
        onChange(newDate);
        setIsOpen(false);
    } else {
        // For day-month-year, just update the view
        setViewDate(newDate);
        // Potentially switch view state here if needed (e.g., from year view to month/day view)
    }
  };

  // Handle day selection
  const handleDaySelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(newDate);
    setIsOpen(false);
  };

  // Format the display date string based on pickerType
  const displayValue: string = formatDate(selectedDate, pickerType, months);

  // --- Calendar Grid Logic ---
  const currentViewYear = viewDate.getFullYear();
  const currentViewMonth = viewDate.getMonth(); // 0-indexed

  const daysInMonth = getDaysInMonth(currentViewYear, currentViewMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentViewYear, currentViewMonth);

  const calendarDays: (number | null)[] = [];
  // Add empty cells for days before the 1st of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }
  // Add empty cells to fill the last row (optional, for consistent grid look)
  // while (calendarDays.length % 7 !== 0) {
  //   calendarDays.push(null);
  // }


  return (
    <div className="relative inline-block text-left w-64" ref={pickerRef}>
      {/* Display Area */}
      <div>
        <button
          type="button"
          className="inline-flex justify-between w-full rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-800 text-sm font-medium text-gray-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
          onClick={togglePicker}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          {displayValue}
          {/* Dropdown icon */}
          <svg className="-mr-1 ml-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Picker Popup */}
      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10" // Increased width for day view
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabIndex={-1}
        >
          <div className="py-1" role="none">
            {/* Month/Year Navigation Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
              <button
                onClick={() => handleViewChange(-1, 'month')}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                aria-label="Previous month"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              {/* Month and Year Display */}
              <span className="text-sm font-semibold text-gray-200">
                {months[currentViewMonth]} {currentViewYear}
              </span>
              <button
                onClick={() => handleViewChange(1, 'month')}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                aria-label="Next month"
              >
                 <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
               {/* Optional: Add Year quick navigation if needed */}
               {/* <button onClick={() => handleViewChange(-1, 'year')} ... > Prev Year </button> */}
               {/* <button onClick={() => handleViewChange(1, 'year')} ... > Next Year </button> */}
            </div>

            {/* Conditional Content: Month Grid or Day Grid */}
            {pickerType === 'month-year' ? (
              // Month Grid (Original Logic)
              <div className="grid grid-cols-3 gap-1 p-2">
                {months.map((month, index) => (
                  <button
                    key={month}
                    onClick={() => handleMonthSelect(index)}
                    className={`py-2 px-1 text-center text-sm rounded-md ${
                      selectedDate && selectedDate.getMonth() === index && selectedDate.getFullYear() === currentViewYear
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10`}
                    role="menuitem"
                    tabIndex={-1}
                  >
                    {month}
                  </button>
                ))}
              </div>
            ) : (
              // Day Grid
              <div className="p-2">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {daysOfWeek.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-400">
                      {day}
                    </div>
                  ))}
                </div>
                {/* Day Cells */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => day !== null && handleDaySelect(day)}
                      disabled={day === null}
                      className={`py-1 text-center text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 ${
                        day === null
                          ? 'cursor-default' // Empty cell
                          : selectedDate &&
                            selectedDate.getDate() === day &&
                            selectedDate.getMonth() === currentViewMonth &&
                            selectedDate.getFullYear() === currentViewYear
                          ? 'bg-indigo-600 text-white font-semibold' // Selected day
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white' // Normal day
                      }`}
                      role="menuitem"
                      tabIndex={day === null ? -1 : 0}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};