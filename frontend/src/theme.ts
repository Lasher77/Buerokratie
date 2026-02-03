/**
 * BVMW Design System - Zentrales Farbthema
 *
 * Basierend auf dem offiziellen BVMW Corporate Design
 * Farben abgeleitet von www.bvmw.de
 */

export const colors = {
  // Primärfarbe - nur ein Rot-Ton
  primary: '#E30613',        // BVMW Rot - einzige Akzentfarbe

  // Neutrale Farben
  gray: '#58585A',           // BVMW Grau - für Tags, sekundäre Elemente
  grayLight: '#E5E5E5',      // Hellgrau für Trennlinien
  grayMedium: '#9b9b9b',     // Mittelgrau für Placeholder

  // Text
  textPrimary: '#1A1A1A',    // Schwarz für Überschriften
  textSecondary: '#2d2d2d',  // Dunkelgrau für Fließtext
  textMuted: '#777777',      // Gedämpft für Meta-Informationen

  // Hintergrund
  background: '#FFFFFF',     // Weiß
  backgroundAlt: '#f9f9f9',  // Leicht grauer Hintergrund

  // Status-Farben
  success: '#2E7D32',        // Grün für Erfolg
  warning: '#FFB400',        // Gelb für Warnung
  error: '#E30613',          // Rot für Fehler (= primary)
} as const;

// Status-Konfiguration für Meldungen
export const statusConfig = {
  approved: {
    label: 'Freigegeben',
    background: colors.success,
    color: '#fff',
    dotColor: '#A5D6A7',
  },
  pending: {
    label: 'In Prüfung',
    background: colors.warning,
    color: '#3A2A00',
    dotColor: '#FFE082',
  },
  rejected: {
    label: 'Abgelehnt',
    background: colors.primary,
    color: '#fff',
    dotColor: '#f9d8dc',
  },
  default: {
    label: 'Unbekannt',
    background: colors.gray,
    color: '#fff',
    dotColor: colors.grayLight,
  },
} as const;

export const getStatusConfig = (status: string | null | undefined) => {
  if (!status) {
    return statusConfig.default;
  }

  const normalizedStatus = status.toString().toLowerCase() as keyof typeof statusConfig;
  if (statusConfig[normalizedStatus]) {
    return statusConfig[normalizedStatus];
  }

  return {
    label: status,
    background: statusConfig.default.background,
    color: statusConfig.default.color,
    dotColor: statusConfig.default.dotColor,
  };
};

// Schatten
export const shadows = {
  small: '0 2px 10px rgba(0, 0, 0, 0.1)',
  medium: '0 4px 15px rgba(0, 0, 0, 0.15)',
  large: '0 8px 18px rgba(0, 0, 0, 0.12)',
  primary: '0 8px 18px rgba(227, 6, 19, 0.08)',
  primaryHover: '0 10px 22px rgba(227, 6, 19, 0.12)',
  primaryFocus: '0 0 0 3px rgba(227, 6, 19, 0.18)',
} as const;

// Abstände
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
} as const;

// Border Radius
export const borderRadius = {
  small: '4px',
  medium: '8px',
  large: '24px',
  pill: '999px',
} as const;

// Breakpoints
export const breakpoints = {
  mobile: '600px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1200px',
} as const;

// Typografie
export const typography = {
  fontFamily: "'Roboto Condensed', sans-serif",
  fontSizeSmall: '14px',
  fontSizeBase: '16px',
  fontSizeMedium: '18px',
  fontSizeLarge: '20px',
  fontSizeXL: '24px',
  fontWeightNormal: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
} as const;

// Theme-Objekt für styled-components
const theme = {
  colors,
  shadows,
  spacing,
  borderRadius,
  breakpoints,
  typography,
  statusConfig,
  getStatusConfig,
} as const;

export type Theme = typeof theme;

export default theme;
