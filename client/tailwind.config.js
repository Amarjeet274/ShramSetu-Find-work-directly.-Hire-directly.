export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#F97316',
          orangeDark: '#EA580C',
          orangeLight: '#FB923C',
          navy: '#0B1220',
          navy2: '#111827',
          navy3: '#1E293B',
          slate: '#64748B',
        },
        success: { light: '#DCFCE7', DEFAULT: '#16A34A', dark: '#15803D' },
        warn: { light: '#FEF3C7', DEFAULT: '#D97706', dark: '#B45309' },
        danger: { light: '#FEE2E2', DEFAULT: '#DC2626', dark: '#B91C1C' },
        info: { light: '#DBEAFE', DEFAULT: '#2563EB', dark: '#1D4ED8' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        base: ['15px', '1.55'],
      },
      minHeight: { touch: '52px' },
      minWidth: { touch: '52px' },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.03)',
        cardHover: '0 4px 12px -2px rgb(0 0 0 / 0.08)',
      },
      borderRadius: { '2xl': '14px', '3xl': '20px' },
    },
  },
  plugins: [],
};