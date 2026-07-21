import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LoadingButton = ({
  children,
  loading = false,
  loadingText = 'Loading...',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  icon: Icon = null,
  ...props
}) => {
  const buttonRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 'auto', height: 'auto' });

  // Measure and store current dimensions when button content is not loading,
  // to apply them during loading and prevent layout shift.
  useEffect(() => {
    if (buttonRef.current && !loading) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDimensions({
        width: rect.width ? `${rect.width}px` : 'auto',
        height: rect.height ? `${rect.height}px` : 'auto',
      });
    }
  }, [loading, children]);

  const style = loading && dimensions.width !== 'auto'
    ? { width: dimensions.width, height: dimensions.height }
    : {};

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={style}
      whileHover={!disabled && !loading ? { scale: 1.015 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.985 } : {}}
      className={`relative flex items-center justify-center font-bold transition-all duration-200 select-none ${
        disabled || loading
          ? 'cursor-not-allowed opacity-80'
          : 'cursor-pointer active:scale-95'
      } ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          {/* Custom micro-animated spinner */}
          <svg
            className="animate-spin h-4.5 w-4.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-xs tracking-wide">{loadingText}</span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-1.5 w-full h-full">
          {Icon && <Icon size={15} className="stroke-[2.5]" />}
          {children}
        </span>
      )}
    </motion.button>
  );
};

export default LoadingButton;
