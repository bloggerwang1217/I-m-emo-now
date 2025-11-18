/**
 * I'm Emo Now - Atmospheric Sci-Fi Design System
 * Inspired by Flexoki and One Hunter color palettes
 *
 * Philosophy: Minimalist, atmospheric, introspective
 * Keywords: Inky, Desaturated, Text-Centric, High-Contrast, Elegant
 */

import { Platform } from 'react-native';

/**
 * One Hunter Color Palette
 * Each color has a semantic name and specific usage context
 */
export const AppColors = {
  // Core Background and Text
  inkyDark: '#1D2021',        // Background (The Void) - Very dark, desaturated charcoal
  ivory: '#E6E0C2',           // Primary Text (Starlight) - Soft off-white for easy reading
  slateGrey: '#928374',       // Secondary Text (Metadata) - Dates, timestamps, helper text

  // Accent Colors
  mutedGold: '#D79921',       // Accent 1 (Action) - Primary buttons, sliders, active states
  desaturatedTeal: '#458588', // Accent 2 (Highlight) - Challenge alerts, links, interactive elements
  mutedGreen: '#98971A',      // Accent 3 (Calm/Reflect) - Calm/reflective moods, success states
  softRust: '#CC241D',        // Accent 4 (Alert/Log) - Negative moods, delete confirmation, alerts

  // Additional UI Elements
  cardBackground: '#282828',  // Slightly lighter than main background for cards/modals
  inputBorder: '#928374',     // Form input borders (uses slateGrey)
  divider: '#3C3836',         // Subtle divider lines
};

/**
 * Base semantic color mapping (primarily dark theme)
 * Maps functional purposes to specific colors
 */
const BaseColors = {
  // Background colors
  background: {
    primary: AppColors.inkyDark,
    card: AppColors.cardBackground,
    elevated: AppColors.cardBackground,
  },

  // Text colors
  text: {
    primary: AppColors.ivory,
    secondary: AppColors.slateGrey,
    inverse: AppColors.inkyDark, // For text on colored backgrounds
  },

  // Interactive elements
  interactive: {
    primary: AppColors.mutedGold,
    secondary: AppColors.desaturatedTeal,
    disabled: AppColors.slateGrey,
  },

  // Status and feedback
  status: {
    success: AppColors.mutedGreen,
    warning: AppColors.mutedGold,
    error: AppColors.softRust,
    info: AppColors.desaturatedTeal,
  },

  // Emotion score colors (for 1-5 scale visualization)
  emotion: {
    veryNegative: AppColors.softRust,      // Score 1
    negative: '#B8651D',                    // Score 2 (blend)
    neutral: AppColors.mutedGold,           // Score 3
    positive: '#B89920',                    // Score 4 (blend)
    veryPositive: AppColors.mutedGreen,     // Score 5
  },

  // Borders and dividers
  border: {
    default: AppColors.inputBorder,
    focus: AppColors.mutedGold,
    divider: AppColors.divider,
  },
};

/**
 * Theme-aware color schemes
 * Supporting both light and dark modes
 */
export const Colors = {
  // Export base colors for backwards compatibility
  ...BaseColors,

  // Light mode colors (adjusted for light backgrounds)
  light: {
    text: AppColors.inkyDark,
    background: AppColors.ivory,
    tint: AppColors.mutedGold,
    icon: AppColors.slateGrey,
    tabIconDefault: AppColors.slateGrey,
    tabIconSelected: AppColors.mutedGold,
  },

  // Dark mode colors (our primary theme)
  dark: {
    text: AppColors.ivory,
    background: AppColors.inkyDark,
    tint: AppColors.mutedGold,
    icon: AppColors.ivory,
    tabIconDefault: AppColors.slateGrey,
    tabIconSelected: AppColors.mutedGold,
  },
};

/**
 * Typography System
 * Font families, sizes, and weights
 */
export const Typography = {
  // Font families (fallback to system fonts)
  fontFamily: {
    primary: Platform.select({
      ios: 'Inter',
      android: 'Inter',
      web: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      default: 'system-ui',
    }),
    fallback: Platform.select({
      ios: 'Manrope',
      android: 'Manrope',
      web: "'Manrope', system-ui, sans-serif",
      default: 'system-ui',
    }),
    mono: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      web: "'Courier New', Courier, monospace",
      default: 'monospace',
    }),
    rounded: Platform.select({
      ios: 'Inter',
      android: 'Inter',
      web: "'Inter', system-ui, sans-serif",
      default: 'system-ui',
    }),
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  // Font weights
  fontWeight: {
    regular: 400 as const,
    medium: 500 as const,
    semibold: 600 as const,
    bold: 700 as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

/**
 * Fonts export for backwards compatibility
 * Maps to Typography.fontFamily
 */
export const Fonts = Typography.fontFamily;

/**
 * Spacing System
 * Consistent spacing scale for margins, padding, gaps
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

/**
 * Border Radius
 * Minimal/subtle radius following design philosophy
 */
export const BorderRadius = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 8,
};

/**
 * Button Styles
 * Pre-configured button style objects
 */
export const ButtonStyles = {
  primary: {
    backgroundColor: AppColors.mutedGold,
    color: AppColors.inkyDark,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: AppColors.slateGrey,
    borderWidth: 1,
    color: AppColors.ivory,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: AppColors.ivory,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
};

/**
 * Shadow Styles
 * Minimal shadows - use sparingly per design philosophy
 */
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
};

/**
 * Icon Configuration
 * Guidelines for icon usage
 */
export const IconConfig = {
  defaultColor: AppColors.ivory,
  secondaryColor: AppColors.slateGrey,
  accentColor: AppColors.mutedGold,
  size: {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  },
  // Recommended: Use Heroicons or Feather Icons (thin, linear style)
  style: 'outline', // Prefer outline over filled
};

/**
 * Animation Durations
 * Keep animations subtle and minimal
 */
export const AnimationDuration = {
  fast: 150,
  normal: 300,
  slow: 500,
};

export default {
  AppColors,
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  ButtonStyles,
  Shadows,
  IconConfig,
  AnimationDuration,
};
