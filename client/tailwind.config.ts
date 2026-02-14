import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                accent: {
                    DEFAULT: 'rgba(var(--accent-rgb), <alpha-value>)',
                    deep: 'rgba(var(--accent-deep-rgb), <alpha-value>)',
                    muted: 'rgba(var(--accent-muted-rgb), <alpha-value>)',
                },
                brand: {
                    50: '#FFFBEB',
                    100: '#FEF3C7',
                    200: '#FDE68A',
                    300: '#FCD34D',
                    400: '#FBBF24',
                    500: '#F59E0B',
                    600: '#D97706',
                    700: '#B45309',
                    800: '#92400E',
                    900: '#78350F',
                },
                dark: {
                    50: '#E5E7EB',
                    100: '#D1D5DB',
                    200: '#9CA3AF',
                    300: '#6B7280',
                    400: '#374151',
                    500: '#1F1F1F',
                    600: '#141414',
                    700: '#111111',
                    800: '#0A0A0A',
                    900: '#050505',
                },
                gold: {
                    50: '#FFFBEB',
                    100: '#FEF3C7',
                    200: '#FDE68A',
                    300: '#FCD34D',
                    400: '#FBBF24',
                    500: '#F59E0B',
                    600: '#D97706',
                    700: '#B45309',
                    800: '#92400E',
                    900: '#78350F',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-gradient': 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)',
                'card-gradient': 'linear-gradient(135deg, rgba(251,191,36,0.05) 0%, rgba(217,119,6,0.02) 100%)',
                'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(43,96%,56%,0.15) 0px, transparent 50%), radial-gradient(at 80% 70%, hsla(38,92%,50%,0.1) 0px, transparent 50%), radial-gradient(at 10% 90%, hsla(48,96%,53%,0.1) 0px, transparent 50%)',
                'gold-gradient': 'linear-gradient(90deg, #FBBF24, #F59E0B)',
                'gold-gradient-135': 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                'glass-lg': '0 12px 48px 0 rgba(0, 0, 0, 0.4)',
                'neon': '0 0 15px rgba(251, 191, 36, 0.2), 0 0 45px rgba(251, 191, 36, 0.05)',
                'neon-lg': '0 0 30px rgba(251, 191, 36, 0.3), 0 0 60px rgba(251, 191, 36, 0.1)',
                'gold-glow': '0 0 20px rgba(251, 191, 36, 0.15)',
                'gold-glow-lg': '0 0 40px rgba(251, 191, 36, 0.25)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'slide-up': 'slideUp 0.5s ease-out',
                'fade-in': 'fadeIn 0.5s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2s infinite',
                'typing': 'typing 1.5s steps(3) infinite',
                'gold-pulse': 'goldPulse 2s ease-in-out infinite alternate',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(251, 191, 36, 0.2)' },
                    '100%': { boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                typing: {
                    '0%': { content: '"."' },
                    '33%': { content: '".."' },
                    '66%': { content: '"..."' },
                },
                goldPulse: {
                    '0%': { opacity: '0.5' },
                    '100%': { opacity: '1' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            borderRadius: {
                '2xl': '16px',
                '3xl': '20px',
            },
        },
    },
    plugins: [],
};

export default config;
