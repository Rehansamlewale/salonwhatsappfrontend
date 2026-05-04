// Modern Fintech Design System
// Color Palette and Design Tokens

export const colors = {
  // Primary Colors
  primary: {
    indigo: '#4F46E5',
    indigoDark: '#4338CA',
    emerald: '#10B981',
    emeraldDark: '#059669',
  },

  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    gray50: '#F8FAFC',
    gray100: '#F1F5F9',
    gray200: '#E2E8F0',
    gray400: '#94A3B8',
    gray500: '#64748B',
    gray600: '#475569',
    gray700: '#334155',
    gray800: '#1E293B',
    gray900: '#0F172A',
  },

  // Sidebar & Navbar
  sidebar: {
    background: '#F5F7FA',
    border: '#E2E8F0',
    text: '#374151',
    textLight: '#6B7280',
    activeBackground: '#2E865F',
    activeText: '#FFFFFF',
    hoverBackground: 'rgba(156, 163, 175, 0.1)',
  },

  navbar: {
    background: '#FFFFFF',
    border: '#E2E8F0',
    text: '#1F2937',
  },

  // Table Colors
  table: {
    headerBg: '#F8FAFC',
    headerText: '#64748B',
    rowBorder: '#E2E8F0',
    rowHover: '#F1F5F9',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
  },

  // Status Colors
  status: {
    approved: {
      bg: '#DCFCE7',
      text: '#166534',
    },
    pending: {
      bg: '#FEF3C7',
      text: '#92400E',
    },
    rejected: {
      bg: '#FEE2E2',
      text: '#991B1B',
    },
    inProcess: {
      bg: '#DBEAFE',
      text: '#1E40AF',
    },
    disbursed: {
      bg: '#E0E7FF',
      text: '#4338CA',
    },
  },
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  button: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

export const borderRadius = {
  sm: '6px',
  md: '8px',
  lg: '10px',
  xl: '12px',
  full: '9999px',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
};

export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};
