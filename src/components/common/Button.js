import React from 'react';
import { colors, shadows, borderRadius } from '../../styles/designTokens';

// Primary Button Component
export const PrimaryButton = ({
  children,
  onClick,
  disabled = false,
  type = 'button',
  variant = 'indigo', // 'indigo' or 'emerald'
  className = '',
  ...props
}) => {
  const bgColor = variant === 'emerald' ? colors.primary.emerald : colors.primary.indigo;
  const hoverColor = variant === 'emerald' ? colors.primary.emeraldDark : colors.primary.indigoDark;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 rounded-lg font-semibold text-white transition-all duration-200 ${className}`}
      style={{
        backgroundColor: disabled ? colors.neutral.gray400 : bgColor,
        boxShadow: disabled ? 'none' : shadows.button,
        cursor: disabled ? 'not-allowed' : 'pointer',
        borderRadius: borderRadius.md,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = hoverColor;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = bgColor;
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
};

// Secondary/Ghost Button Component
export const SecondaryButton = ({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 ${className}`}
      style={{
        backgroundColor: colors.neutral.white,
        border: `1px solid ${colors.neutral.gray200}`,
        color: disabled ? colors.neutral.gray400 : colors.neutral.gray600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        borderRadius: borderRadius.md,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = colors.neutral.gray50;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = colors.neutral.white;
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
};

// Danger Button Component
export const DangerButton = ({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 rounded-lg font-semibold text-white transition-all duration-200 ${className}`}
      style={{
        backgroundColor: disabled ? colors.neutral.gray400 : '#EF4444',
        boxShadow: disabled ? 'none' : shadows.button,
        cursor: disabled ? 'not-allowed' : 'pointer',
        borderRadius: borderRadius.md,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = '#DC2626';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = '#EF4444';
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
};
