import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Button = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '', 
  disabled = false,
  onClick,
  type = 'button',
  ...props 
}) => {
  const { darkMode } = useTheme();

  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: darkMode 
      ? 'bg-blue-600 text-white hover:bg-blue-700' 
      : 'bg-blue-600 text-white hover:bg-blue-700',
    outline: darkMode 
      ? 'border border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white' 
      : 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50',
    secondary: darkMode 
      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
      : 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    destructive: darkMode 
      ? 'bg-red-600 text-white hover:bg-red-700' 
      : 'bg-red-600 text-white hover:bg-red-700',
    ghost: darkMode 
      ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
      : 'text-gray-700 hover:bg-gray-100',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8',
    icon: 'h-10 w-10',
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
