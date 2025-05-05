import React, { useState, useEffect, useRef } from 'react';

interface SelectDateFilterTypeProps {
  day: boolean;
  onChange: (value: boolean) => void;
}

export default function SelectDateFilterType({ day, onChange }: SelectDateFilterTypeProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const selectedValueText = day ? 'Day' : 'Month';

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

  const togglePicker = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (value: boolean) => {
    onChange(value);
    setIsOpen(false);
  };

  return (
    // Changed from inline-block to block for label layout
    <div className="relative block text-left w-64" ref={pickerRef}>
      {/* Label */}
      <label htmlFor="date-filter-type-button" className="block text-sm font-medium text-light_blue mb-1">
        Filter Granularity
      </label>
      {/* Display Button */}
      <div>
        <button
          type="button"
          id="date-filter-type-button" // Added ID for label association
          // Apply styles similar to DatePicker button - Keeping existing styles for now
          className="inline-flex justify-between w-full rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-800 text-sm font-medium text-gray-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
          onClick={togglePicker}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          {selectedValueText}
          {/* Dropdown icon */}
          <svg className="-mr-1 ml-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabIndex={-1}
        >
          <div className="py-1" role="none">
            <button
              onClick={() => handleSelect(true)} // true for Day
              className={`block w-full text-left px-4 py-2 text-sm ${
                day ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              } focus:outline-none focus:bg-gray-700 focus:text-white`}
              role="menuitem"
              tabIndex={-1}
              id="menu-item-0"
            >
              Day
            </button>
            <button
              onClick={() => handleSelect(false)} // false for Month
              className={`block w-full text-left px-4 py-2 text-sm ${
                !day ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              } focus:outline-none focus:bg-gray-700 focus:text-white`}
              role="menuitem"
              tabIndex={-1}
              id="menu-item-1"
            >
              Month
            </button>
          </div>
        </div>
      )}
    </div>
  );
}