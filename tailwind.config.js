/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#3385ff',
                    light: '#66a3ff',
                    dark: '#0066ff',
                },
                secondary: {
                    DEFAULT: '#3385ff',
                    light: '#66a3ff',
                    dark: '#0066ff',
                },
                accent: {
                    DEFAULT: '#3385ff',
                    light: '#66a3ff',
                    dark: '#0066ff',
                },
            },
            fontFamily: {
                'space-grotesk': ['Space Grotesk', 'Inter', 'sans-serif'],
                'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}
