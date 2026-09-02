import React from 'react';
import { motion } from 'motion/react';

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  id?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'emerald' | 'amber' | 'rose';
  className?: string;
}

export const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({
  checked,
  onChange,
  label,
  id,
  disabled = false,
  size = 'md',
  variant = 'emerald',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  const variantColors = {
    primary: {
      activeBg: 'bg-[#0F2D59] border-[#0F2D59]',
      glow: 'shadow-[0_0_10px_rgba(15,45,89,0.3)]',
      textColor: 'text-[#0F2D59]',
    },
    emerald: {
      activeBg: 'bg-emerald-600 border-emerald-600',
      glow: 'shadow-[0_0_10px_rgba(16,185,129,0.35)]',
      textColor: 'text-emerald-950',
    },
    amber: {
      activeBg: 'bg-amber-600 border-amber-600',
      glow: 'shadow-[0_0_10px_rgba(217,119,6,0.35)]',
      textColor: 'text-amber-950',
    },
    rose: {
      activeBg: 'bg-rose-600 border-rose-600',
      glow: 'shadow-[0_0_10px_rgba(225,29,72,0.35)]',
      textColor: 'text-rose-950',
    },
  };

  const currentVariant = variantColors[variant] || variantColors.emerald;

  return (
    <motion.label
      id={id}
      whileHover={disabled ? {} : { scale: 1.01 }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`inline-flex items-center gap-2.5 select-none transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />

      <motion.div
        animate={{
          scale: checked ? 1 : 1,
          borderColor: checked ? 'transparent' : '#cbd5e1',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`relative flex items-center justify-center rounded-md border-2 transition-colors duration-200 shrink-0 ${
          sizeClasses[size]
        } ${
          checked
            ? `${currentVariant.activeBg} ${currentVariant.glow}`
            : 'bg-white border-slate-300 hover:border-slate-400'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full p-0.5"
        >
          <motion.path
            d="M 4 12 L 9 17 L 20 6"
            initial={false}
            animate={{
              pathLength: checked ? 1 : 0,
              opacity: checked ? 1 : 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
              duration: 0.2,
            }}
          />
        </svg>
      </motion.div>

      {label && (
        <span
          className={`text-xs font-semibold transition-colors duration-150 ${
            checked ? `${currentVariant.textColor} font-bold` : 'text-slate-700'
          }`}
        >
          {label}
        </span>
      )}
    </motion.label>
  );
};
