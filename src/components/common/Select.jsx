import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Select = ({ 
  children, 
  defaultValue, 
  value, 
  onValueChange, 
  placeholder = "Seleccionar...",
  className = '',
  disabled = false,
  ...props 
}) => {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const selectedValue = value !== undefined ? value : defaultValue;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    setIsOpen(false);
    if (onValueChange) {
      onValueChange(value);
    }
  };

  const selectedOption = React.Children.toArray(children).find(
    child => child.props.value === selectedValue
  );

  const baseClasses = 'relative w-full';
  const triggerClasses = `
    flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors
    ${darkMode 
      ? 'border-gray-600 bg-gray-800 text-gray-200 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-gray-500' 
      : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-gray-400'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  const contentClasses = `
    absolute top-full left-0 z-50 w-full mt-1 rounded-md border shadow-lg
    ${darkMode 
      ? 'border-gray-600 bg-gray-800' 
      : 'border-gray-300 bg-white'
    }
  `;

  return (
    <div className={`${baseClasses} ${className}`} ref={selectRef} {...props}>
      <div
        className={triggerClasses}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? '' : 'text-gray-500'}>
          {selectedOption ? selectedOption.props.children : placeholder}
        </span>
        <ChevronDown 
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`} 
        />
      </div>
      
      {isOpen && (
        <div className={contentClasses}>
          <div className="max-h-60 overflow-auto p-1">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  onClick: () => handleSelect(child.props.value),
                  className: `
                    relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors
                    ${darkMode 
                      ? 'text-gray-200 hover:bg-gray-700 focus:bg-gray-700' 
                      : 'text-gray-900 hover:bg-gray-100 focus:bg-gray-100'
                    }
                    ${child.props.value === selectedValue 
                      ? darkMode ? 'bg-gray-700 text-white' : 'bg-blue-100 text-blue-900' 
                      : ''
                    }
                  `
                });
              }
              return child;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const SelectItem = ({ children, value, className = '', ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

const SelectTrigger = ({ children, className = '', ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

const SelectContent = ({ children, className = '', ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

const SelectValue = ({ placeholder, className = '', ...props }) => {
  return (
    <span className={className} {...props}>
      {placeholder}
    </span>
  );
};

export { Select, SelectItem, SelectTrigger, SelectContent, SelectValue };
