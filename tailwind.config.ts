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
				
				/* Medical Design System Colors */
				medical: {
					primary: 'hsl(var(--medical-primary))',
					'primary-light': 'hsl(var(--medical-primary-light))',
					'primary-dark': 'hsl(var(--medical-primary-dark))'
				},
				swiss: {
					blue: 'hsl(var(--swiss-blue))',
					'blue-foreground': 'hsl(var(--swiss-blue-foreground))',
					gray: 'hsl(var(--swiss-gray))',
					'gray-foreground': 'hsl(var(--swiss-gray-foreground))'
				},
				progress: {
					complete: 'hsl(var(--progress-complete))',
					partial: 'hsl(var(--progress-partial))',
					pending: 'hsl(var(--progress-pending))'
				},
				
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					hover: 'hsl(var(--secondary-hover))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
					border: 'hsl(var(--card-border))'
				},
				success: 'hsl(var(--success))',
				warning: 'hsl(var(--warning))',
				error: 'hsl(var(--error))'
			},
			backgroundImage: {
				'gradient-medical': 'var(--gradient-medical)',
				'gradient-progress': 'var(--gradient-progress)',
				'gradient-hero': 'var(--gradient-hero)'
			},
			boxShadow: {
				'medical': 'var(--shadow-medical)',
				'card': 'var(--shadow-card)',
				'progress': 'var(--shadow-progress)'
			},
			transitionProperty: {
				'medical': 'var(--transition-medical)',
				'progress': 'var(--transition-progress)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				medical: 'var(--radius-medical)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
