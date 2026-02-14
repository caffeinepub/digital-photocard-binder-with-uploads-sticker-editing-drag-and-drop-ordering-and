/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'oklch(var(--border))',
        input: 'oklch(var(--input))',
        ring: 'oklch(var(--ring))',
        background: 'oklch(var(--background))',
        foreground: 'oklch(var(--foreground))',
        primary: {
          DEFAULT: 'oklch(var(--primary))',
          foreground: 'oklch(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'oklch(var(--secondary))',
          foreground: 'oklch(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'oklch(var(--destructive))',
          foreground: 'oklch(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'oklch(var(--muted))',
          foreground: 'oklch(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'oklch(var(--accent))',
          foreground: 'oklch(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'oklch(var(--popover))',
          foreground: 'oklch(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'oklch(var(--card))',
          foreground: 'oklch(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'oklch(var(--sidebar))',
          foreground: 'oklch(var(--sidebar-foreground))',
          primary: 'oklch(var(--sidebar-primary))',
          'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
          accent: 'oklch(var(--sidebar-accent))',
          'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
          border: 'oklch(var(--sidebar-border))',
          ring: 'oklch(var(--sidebar-ring))',
        },
        cream: 'oklch(var(--cream))',
        peach: 'oklch(var(--peach))',
        sage: 'oklch(var(--sage))',
        coral: 'oklch(var(--coral))',
        'coral-dark': 'oklch(var(--coral-dark))',
        charcoal: 'oklch(var(--charcoal))',
        'binder-dark': 'oklch(var(--binder-dark))',
        'binder-surface': 'oklch(var(--binder-surface))',
        'binder-card': 'oklch(var(--binder-card))',
        'binder-border': 'oklch(var(--binder-border))',
        'binder-text': 'oklch(var(--binder-text))',
        'binder-text-muted': 'oklch(var(--binder-text-muted))',
        'binder-accent': 'oklch(var(--binder-accent))',
        'binder-accent-hover': 'oklch(var(--binder-accent-hover))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        handwriting: ['Caveat', 'cursive'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        binder: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)',
        'binder-lg': '0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'page-flip-left': 'page-flip-left 0.5s ease-out',
        'page-flip-right': 'page-flip-right 0.5s ease-out',
      },
      keyframes: {
        'page-flip-left': {
          '0%': { transform: 'translateX(0) rotateY(0deg)', opacity: '1' },
          '50%': { transform: 'translateX(-20px) rotateY(-5deg)', opacity: '0.7' },
          '100%': { transform: 'translateX(0) rotateY(0deg)', opacity: '1' },
        },
        'page-flip-right': {
          '0%': { transform: 'translateX(0) rotateY(0deg)', opacity: '1' },
          '50%': { transform: 'translateX(20px) rotateY(5deg)', opacity: '0.7' },
          '100%': { transform: 'translateX(0) rotateY(0deg)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};
