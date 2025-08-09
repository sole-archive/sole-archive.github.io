/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        // Primary Colors - Deep Academic Blues
        primary: {
          DEFAULT: "#1e3a8a", // blue-900 - Deep academic blue, trustworthy research foundation
          50: "#eff6ff", // blue-50
          100: "#dbeafe", // blue-100
          200: "#bfdbfe", // blue-200
          300: "#93c5fd", // blue-300
          400: "#60a5fa", // blue-400
          500: "#3b82f6", // blue-500
          600: "#2563eb", // blue-600
          700: "#1d4ed8", // blue-700
          800: "#1e40af", // blue-800
          900: "#1e3a8a", // blue-900
        },
        // Secondary Colors - Interface Hierarchy Support
        secondary: {
          DEFAULT: "#1e40af", // blue-800 - Slightly lighter blue, interface hierarchy support
          50: "#eff6ff", // blue-50
          100: "#dbeafe", // blue-100
          200: "#bfdbfe", // blue-200
          300: "#93c5fd", // blue-300
          400: "#60a5fa", // blue-400
          500: "#3b82f6", // blue-500
          600: "#2563eb", // blue-600
          700: "#1d4ed8", // blue-700
          800: "#1e40af", // blue-800
          900: "#1e3a8a", // blue-900
        },
        // Accent Colors - Discovery Moments
        accent: {
          DEFAULT: "#f59e0b", // amber-500 - Warm amber, discovery moments and connections
          50: "#fffbeb", // amber-50
          100: "#fef3c7", // amber-100
          200: "#fde68a", // amber-200
          300: "#fcd34d", // amber-300
          400: "#fbbf24", // amber-400
          500: "#f59e0b", // amber-500
          600: "#d97706", // amber-600
          700: "#b45309", // amber-700
          800: "#92400e", // amber-800
          900: "#78350f", // amber-900
        },
        // Background Colors
        background: "#fefefe", // gray-50 - Pure white, optimal reading canvas
        surface: "#f8fafc", // slate-50 - Subtle gray, card depth without distraction
        // Text Colors
        "text-primary": "#1f2937", // gray-800 - Near black, extended reading comfort
        "text-secondary": "#6b7280", // gray-500 - Medium gray, clear metadata hierarchy
        // Status Colors
        success: "#059669", // emerald-600 - Forest green, positive research actions
        warning: "#d97706", // amber-600 - Warm orange, helpful guidance without alarm
        error: "#dc2626", // red-600 - Clear red, constructive problem indication
        // Border Colors
        border: "#e5e7eb", // gray-200 - Functional delineation
        "border-light": "#f3f4f6", // gray-100
      },
      fontFamily: {
        crimson: ['Crimson Text', 'serif'], // Headlines - Scholarly serif that bridges traditional academic gravitas with digital readability
        inter: ['Inter', 'sans-serif'], // Body and CTAs - Modern sans-serif optimized for extended reading sessions
        mono: ['JetBrains Mono', 'monospace'], // Accents - Monospace for citation formats, DOIs, and technical metadata
        sans: ['Inter', 'sans-serif'], // Default sans-serif
        serif: ['Crimson Text', 'serif'], // Default serif
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      boxShadow: {
        'subtle': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      transitionDuration: {
        '300': '300ms',
      },
      transitionTimingFunction: {
        'smooth': 'ease-out',
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
} 