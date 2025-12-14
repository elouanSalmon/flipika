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
                    DEFAULT: '#0066ff',
                    light: '#3385ff',
                    dark: '#0052cc',
                },
                secondary: {
                    DEFAULT: '#0066ff',
                    light: '#3385ff',
                    dark: '#0052cc',
                },
                accent: {
                    DEFAULT: '#0066ff',
                    light: '#3385ff',
                    dark: '#0052cc',
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}
