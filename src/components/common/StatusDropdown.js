import React from 'react';
import { colors } from '../../styles/designTokens';

// Helper function to get status colors
const getStatusColors = (status) => {
  const statusLower = status?.toLowerCase() || '';

  if (statusLower.includes('approv') || statusLower.includes('sanction') || statusLower.includes('payout')) {
    return {
      bg: colors.status.approved.bg,
      text: colors.status.approved.text,
      border: colors.status.approved.text,
    };
  } else if (statusLower.includes('reject')) {
    return {
      bg: colors.status.rejected.bg,
      text: colors.status.rejected.text,
      border: colors.status.rejected.text,
    };
  } else if (statusLower.includes('disburs')) {
    return {
      bg: colors.status.disbursed.bg,
      text: colors.status.disbursed.text,
      border: colors.status.disbursed.text,
    };
  } else if (
    statusLower.includes('process') ||
    statusLower.includes('pending') ||
    statusLower.includes('verification') ||
    statusLower.includes('valuation') ||
    statusLower.includes('check') ||
    statusLower.includes('rto') ||
    statusLower.includes('collection') ||
    statusLower.includes('search') ||
    statusLower.includes('paper')
  ) {
    return {
      bg: colors.status.pending.bg,
      text: colors.status.pending.text,
      border: colors.status.pending.text,
    };
  } else if (statusLower.includes('basic') || statusLower.includes('documents') || statusLower.includes('info') || statusLower.includes('details')) {
    // New color mapping for Info/Docs stage - Blue-ish/Info
    return {
      bg: colors.primary.blue50, // Assuming this exists or using a hex if needed, but sticking to designTokens structure if possible. 
      // Let's use what's likely available or fallback to pending if blue isn't strictly defined in this file's imports
      // Checking imports: import { colors } from '../../styles/designTokens';
      // Let's just map to pending (yellow/orange) or if designTokens has info, use that.
      // For now, let's map to a neutral but distinct style if possible, or just use pending.
      // actually, 'documents' usually implies pending.
      bg: '#E0F2FE', // light blue
      text: '#0369A1', // dark blue
      border: '#7DD3FC', // medium blue
    };
  } else {
    return {
      bg: colors.neutral.gray100,
      text: colors.neutral.gray700,
      border: colors.neutral.gray400,
    };
  }
};

// Colored Status Dropdown Component
export const StatusDropdown = ({ value, onChange, options, className = '', ...props }) => {
  const statusColors = getStatusColors(value);

  return (
    <select
      value={value || ''}
      onChange={onChange}
      className={`px-3 py-1.5 rounded-lg border text-sm font-semibold focus:ring-2 focus:outline-none ${className}`}
      style={{
        backgroundColor: statusColors.bg,
        color: statusColors.text,
        borderColor: statusColors.border,
        borderWidth: '1px',
      }}
      {...props}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
