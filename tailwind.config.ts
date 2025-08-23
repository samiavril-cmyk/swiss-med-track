import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				
				/* Primary Deep Teal */
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))'
				},
				
				/* Secondary Fresh Mint */
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					hover: 'hsl(var(--secondary-hover))'
				},

				/* Enhanced Typography Colors */
				text: {
					primary: 'hsl(var(--text-primary))',
					secondary: 'hsl(var(--text-secondary))',
					muted: 'hsl(var(--text-muted))'
				},

				/* Activity Ring Colors - Vibrant but Professional */
				activity: {
					mint: 'hsl(var(--activity-mint))',
					coral: 'hsl(var(--activity-coral))',
					lavender: 'hsl(var(--activity-lavender))',
					amber: 'hsl(var(--activity-amber))'
				},

				/* Accent Colors - Sparingly Used */
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					coral: 'hsl(var(--accent-coral))',
					gold: 'hsl(var(--accent-gold))',
					lavender: 'hsl(var(--accent-lavender))'
				},

				/* Professional Card System */
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
					border: 'hsl(var(--card-border))'
				},

				/* Muted Backgrounds */
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},

				/* Status Colors */
				success: 'hsl(var(--success))',
				warning: 'hsl(var(--warning))',
				error: 'hsl(var(--error))'
			},

			/* Professional Gradients */
			backgroundImage: {
				'gradient-medical': 'var(--gradient-medical)',
				'gradient-subtle': 'var(--gradient-subtle)',
				'gradient-progress': 'var(--gradient-progress)'
			},

			/* Elegant Shadow System */
			boxShadow: {
				'card': 'var(--shadow-card)',
				'card-hover': 'var(--shadow-card-hover)',
				'elegant': 'var(--shadow-elegant)',
				'progress': 'var(--shadow-progress)'
			},

			/* Professional Transitions */
			transitionProperty: {
				'smooth': 'var(--transition-smooth)',
				'progress': 'var(--transition-progress)'
			},

			/* Medical Border Radius */
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				medical: 'var(--radius-medical)',
				progress: 'var(--radius-progress)'
			},

			/* Enhanced Font System */
			fontFamily: {
				sans: [
					'Inter',
					'-apple-system',
					'BlinkMacSystemFont',
					'"Segoe UI"',
					'Roboto',
					'"Helvetica Neue"',
					'Arial',
					'sans-serif'
				]
			},

			/* Professional Animations */
			keyframes: {
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(8px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-up': {
					'0%': { opacity: '0', transform: 'translateY(16px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'elegant-pulse': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'progress-glow': {
					'0%': { boxShadow: '0 0 5px hsl(var(--activity-mint))' },
					'50%': { boxShadow: '0 0 20px hsl(var(--activity-mint)), 0 0 30px hsl(var(--activity-mint))' },
					'100%': { boxShadow: '0 0 5px hsl(var(--activity-mint))' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.3s ease-out',
				'accordion-up': 'accordion-up 0.3s ease-out',
				'fade-in': 'fade-in 0.4s ease-out',
				'slide-up': 'slide-up 0.5s ease-out',
				'elegant-pulse': 'elegant-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'progress-glow': 'progress-glow 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;