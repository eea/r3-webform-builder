// Reusable style constants for Form Builder components
import type { CSSProperties } from 'react';

export const colors = {
  primary: '#47B3FF',
  primaryDark: '#0083E0',
  primaryLight: '#A0D7FF',
  secondary: '#289588',
  danger: '#E56B38',
  dangerLight: '#FFEDD8',
  warning: '#B83230',

  purple: '#9E84B6',
  purpleDark: '#5C3285',
  purpleLight: '#EFEBF2',
  purpleBorder: '#BEADCE',

  gray: '#4C677F',
  grayLight: '#87A7C3',
  grayBorder: '#dee2e6',
  grayBg: '#f8f9fa',

  text: '#333',
  textDark: '#2E3E4C',
  textMuted: '#666',
  textLight: '#8B5E34',

  success: '#007B6C',
  info: '#003052',

  white: 'white',
  transparent: 'transparent',
};

export const getResponsiveFieldStyles = (fieldCount: number) => {
  if (fieldCount === 2) return { gap: '0.75rem', minWidth: '180px' };
  if (fieldCount === 3) return { gap: '0.5rem', minWidth: '150px' };
  if (fieldCount >= 4) return { gap: '0.4rem', minWidth: '120px' };
  return { gap: '1rem', minWidth: '200px' };
};

export const fieldBlockStyles: Record<string, CSSProperties> = {
  container: {
    marginBottom: '1rem',
  },
  horizontalBlock: {
    display: 'flex',
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: colors.purpleLight,
    borderRadius: '6px',
    border: `1px solid ${colors.purpleBorder}`,
  },
  primaryField: {
    padding: '0.75rem',
    backgroundColor: colors.white,
    border: `2px solid ${colors.purple}`,
    borderRadius: '6px',
  },
  primaryFieldInBlock: {
    padding: '0.5rem',
    backgroundColor: colors.white,
    border: `2px solid ${colors.purple}`,
    borderRadius: '4px',
  },
};

export const labelStyles: Record<string, CSSProperties> = {
  base: {
    display: 'block',
    marginBottom: '0.25rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: colors.textDark,
  },
  primary: {
    fontWeight: 'bold',
    color: colors.purpleDark,
  },
  required: {
    color: colors.warning,
    marginLeft: '0.25rem',
  },
  primaryBadge: {
    marginLeft: '0.5rem',
    fontSize: '0.7rem',
    backgroundColor: colors.purple,
    color: colors.white,
    padding: '0.15rem 0.4rem',
    borderRadius: '10px',
  },
};

export const tooltipStyles: CSSProperties = {
  marginBottom: '0.25rem',
  fontSize: '0.8rem',
  color: colors.gray,
  fontStyle: 'italic',
};

export const panelStyles: Record<string, CSSProperties> = {
  container: {
    width: '300px',
    backgroundColor: colors.grayBg,
    borderRight: `1px solid ${colors.grayBorder}`,
    padding: '1rem',
    overflow: 'auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: `1px solid ${colors.grayBorder}`,
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
    color: colors.text,
  },
};

export const buttonStyles: Record<string, CSSProperties> = {
  base: {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  primary: {
    backgroundColor: colors.primary,
    color: colors.white,
  },
  secondary: {
    backgroundColor: colors.gray,
    color: colors.white,
  },
  danger: {
    backgroundColor: colors.danger,
    color: colors.white,
  },
  disabled: {
    backgroundColor: colors.dangerLight,
    color: colors.textLight,
    cursor: 'not-allowed',
    opacity: 0.6,
  },
};

export const previewStyles: Record<string, CSSProperties> = {
  form: {
    maxWidth: '700px',
    background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
    padding: '2rem',
    marginRight: '1rem',
    borderRadius: '12px',
    border: '1px solid #94a3b8',
    boxShadow: `
      0 20px 40px rgba(0, 0, 0, 0.15),
      0 10px 20px rgba(0, 0, 0, 0.1),
      0 4px 8px rgba(0, 0, 0, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.3)
    `,
    position: 'relative',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tableContent: {
    padding: '1rem',
    backgroundColor: colors.purpleLight,
    borderRadius: '8px',
    border: `1px solid ${colors.purpleBorder}`,
    marginBottom: '1rem',
  },
  tabContainer: {
    display: 'flex',
    gap: '4px',
    borderBottom: `2px solid ${colors.purpleBorder}`,
    marginBottom: '0',
  },
  tabContent: {
    padding: '1.5rem',
    backgroundColor: colors.purpleLight,
    border: `1px solid ${colors.purpleBorder}`,
    borderTop: 'none',
    borderRadius: '0 0 8px 8px',
  },
};