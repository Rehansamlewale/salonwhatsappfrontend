import React from 'react';
import { colors, borderRadius } from '../../styles/designTokens';

// Status Badge Component
export const StatusBadge = ({ status, className = '' }) => {
  const getStatusStyle = (status) => {
    const statusLower = status?.toLowerCase() || '';

    if (statusLower.includes('approv') || statusLower.includes('sanction') || statusLower.includes('payout')) {
      return {
        bg: colors.status.approved.bg,
        text: colors.status.approved.text,
        label: status,
      };
    } else if (statusLower.includes('reject')) {
      return {
        bg: colors.status.rejected.bg,
        text: colors.status.rejected.text,
        label: status,
      };
    } else if (statusLower.includes('disburs')) {
      return {
        bg: colors.status.disbursed.bg,
        text: colors.status.disbursed.text,
        label: status,
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
        label: status, // Use the actual status text instead of forcing "In Process"
      };
    } else if (statusLower.includes('basic') || statusLower.includes('documents') || statusLower.includes('info') || statusLower.includes('details')) {
      return {
        bg: '#E0F2FE', // light blue
        text: '#0369A1', // dark blue
        label: status,
      };
    } else {
      return {
        bg: colors.neutral.gray100,
        text: colors.neutral.gray700,
        label: status || 'Unknown',
      };
    }
  };

  const style = getStatusStyle(status);

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-semibold ${className}`}
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderRadius: borderRadius.full,
      }}
    >
      {style.label}
    </span>
  );
};
