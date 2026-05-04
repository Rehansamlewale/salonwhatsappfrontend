import React from 'react';
import { colors, shadows, borderRadius } from '../../styles/designTokens';

// Modern Table Component
export const Table = ({ children, className = '' }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table
        className="min-w-full"
        style={{
          borderCollapse: 'separate',
          borderSpacing: 0,
        }}
      >
        {children}
      </table>
    </div>
  );
};

// Table Header
export const TableHeader = ({ children }) => {
  return (
    <thead style={{ backgroundColor: colors.table.headerBg }}>
      {children}
    </thead>
  );
};

// Table Header Cell
export const TableHeaderCell = ({ children, className = '', textAlign = 'center', ...props }) => {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${className}`}
      style={{
        color: colors.table.headerText,
        borderBottom: `1px solid ${colors.table.rowBorder}`,
        textAlign: textAlign,
      }}
      {...props}
    >
      {children}
    </th>
  );
};

// Table Body
export const TableBody = ({ children }) => {
  return <tbody>{children}</tbody>;
};

// Table Row
export const TableRow = ({ children, onClick, className = '' }) => {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors duration-150 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        borderBottom: `1px solid ${colors.table.rowBorder}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.table.rowHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {children}
    </tr>
  );
};

// Table Cell
export const TableCell = ({ children, className = '', primary = false, textAlign = 'center', ...props }) => {
  return (
    <td
      className={`px-4 py-3 text-sm ${className}`}
      style={{
        color: primary ? colors.table.textPrimary : colors.table.textSecondary,
        textAlign: textAlign,
      }}
      {...props}
    >
      {children}
    </td>
  );
};

// Card Component for wrapping tables
export const Card = ({ children, className = '', title }) => {
  return (
    <div
      className={`bg-white rounded-xl overflow-hidden ${className}`}
      style={{
        boxShadow: shadows.md,
        borderRadius: borderRadius.xl,
      }}
    >
      {title && (
        <div
          className="px-6 py-4 border-b"
          style={{ borderColor: colors.neutral.gray200 }}
        >
          <h3
            className="text-lg font-semibold"
            style={{ color: colors.neutral.gray800 }}
          >
            {title}
          </h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
