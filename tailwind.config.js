/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
  		fontFamily: {
  			sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  			mono: ['SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
  			patent: ['Times New Roman', 'Georgia', 'serif'],
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			'bg-panel-header': 'hsl(var(--bg-panel-header))',
  			'bg-hover': 'hsl(var(--bg-hover))',
  			'border-light': 'hsl(var(--border-light))',
  			'blue-400': 'hsl(var(--blue-400))',
  			'blue-500': 'hsl(var(--blue-500))',
  			'text-primary': 'hsl(var(--text-primary))',
  			'text-secondary': 'hsl(var(--text-secondary))',
  			'text-tertiary': 'hsl(var(--text-tertiary))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
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
			},
			'fade-in': {
				from: { opacity: '0' },
				to: { opacity: '1' },
			},
			'fade-out': {
				from: {
					opacity: '1'
				},
				to: {
					opacity: '0'
				}
			},
			'zoom-in': {
				from: {
					transform: 'scale(0.95)'
				},
				to: {
					transform: 'scale(1)'
				}
			},
			'zoom-out': {
				from: {
					transform: 'scale(1)'
				},
				to: {
					transform: 'scale(0.95)'
				}
			},
			'slide-in': {
				from: {
					transform: 'translateX(-100%)'
				},
				to: {
					transform: 'translateX(0)'
				}
			},
			'slide-out': {
				from: {
					transform: 'translateX(0)'
				},
				to: {
					transform: 'translateX(100%)'
				}
			},
			'shimmer': {
				'0%': { 
					backgroundPosition: '-200% 0'
				},
				'100%': { 
					backgroundPosition: '200% 0'
				}
			},
			'wave': {
				'0%': {
					transform: 'translateX(-100%)'
				},
				'50%': {
					transform: 'translateX(0%)'
				},
				'100%': {
					transform: 'translateX(100%)'
				}
			},
			'pulse-enhanced': {
				'0%, 100%': {
					opacity: '0.6',
					transform: 'scale(1)'
				},
				'50%': {
					opacity: '1',
					transform: 'scale(1.02)'
				}
			},
			'glow': {
				'0%, 100%': {
					boxShadow: '0 0 5px hsl(var(--primary) / 0.2)'
				},
				'50%': {
					boxShadow: '0 0 20px hsl(var(--primary) / 0.4)'
				}
			},
			'fade-in-scale': {
				from: { opacity: '0', transform: 'scale(0.95)' },
				to: { opacity: '1', transform: 'scale(1)' },
			},
			'slide-up': {
				from: { transform: 'translateY(8px)', opacity: '0' },
				to: { transform: 'translateY(0)', opacity: '1' },
			},
			'progress': {
				from: { width: '0%' },
				to: { width: '100%' },
			},
		},
		animation: {
			'accordion-down': 'accordion-down 0.2s ease-out',
			'accordion-up': 'accordion-up 0.2s ease-out',
			'fade-in': 'fade-in 0.3s ease-out',
			'fade-out': 'fade-out 0.2s ease-out',
			'zoom-in': 'zoom-in 0.2s ease-out',
			'zoom-out': 'zoom-out 0.2s ease-out',
			'slide-in': 'slide-in 0.2s ease-out',
			'slide-out': 'slide-out 0.2s ease-out',
			'shimmer': 'shimmer 2s linear infinite',
			'wave': 'wave 2s ease-in-out infinite',
			'pulse-enhanced': 'pulse-enhanced 1.5s ease-in-out infinite',
			'glow': 'glow 2s ease-in-out infinite',
			'fade-in-scale': 'fade-in-scale 0.3s ease-out',
			'slide-up': 'slide-up 0.3s ease-out',
			'progress': 'progress 0.8s ease-out forwards',
		},
		transitionTimingFunction: {
			'smooth-out': 'cubic-bezier(0.32, 0.72, 0, 1)',
		},
		transitionDuration: {
			'250': '250ms',
			'350': '350ms',
			'400': '400ms',
		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
} 