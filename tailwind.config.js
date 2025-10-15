/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Nature-inspired color palette
        // Forest & Earth tones
        forest: {
          50: '#F0F4F2',
          100: '#D9E6E0',
          200: '#B3CDC0',
          300: '#8DB4A0',
          400: '#679B80',
          500: '#2E4A3B', // Primary forest green
          600: '#253B2F',
          700: '#1C2C23',
          800: '#131D17',
          900: '#0A0E0B',
        },
        earth: {
          50: '#F7F3F0',
          100: '#EFE7E1',
          200: '#DFCFC3',
          300: '#CFB7A5',
          400: '#BF9F87',
          500: '#8B6B4A', // Primary earth brown
          600: '#6F5640',
          700: '#534136',
          800: '#372C2B',
          900: '#1B1716',
        },
        sky: {
          50: '#F0F7FF',
          100: '#E1EFFF',
          200: '#C3DFFF',
          300: '#A5CFFF',
          400: '#87BFFF',
          500: '#4A90E2', // Primary sky blue
          600: '#3B73B5',
          700: '#2C5688',
          800: '#1D395B',
          900: '#0E1C2E',
        },
        river: {
          50: '#F0F9F8',
          100: '#E1F3F1',
          200: '#C3E7E3',
          300: '#A5DBD5',
          400: '#87CFC7',
          500: '#3BAFA9', // Primary river teal
          600: '#2F8F8A',
          700: '#236F6B',
          800: '#174F4C',
          900: '#0B2F2D',
        },
        sand: {
          50: '#FEFCF8',
          100: '#FDF9F1',
          200: '#FBF3E3',
          300: '#F9EDD5',
          400: '#F7E7C7',
          500: '#F5E6C8', // Primary light sand
          600: '#C4B8A0',
          700: '#938A78',
          800: '#625C50',
          900: '#312E28',
        },
        // Mountain adventure palette
        charcoal: {
          50: '#F5F5F5',
          100: '#E5E5E5',
          200: '#CCCCCC',
          300: '#B3B3B3',
          400: '#999999',
          500: '#6B6B6B',
          600: '#555555',
          700: '#404040',
          800: '#2A2A2A',
          900: '#1C1C1C', // Deep charcoal
        },
        moss: {
          50: '#F2F5F3',
          100: '#E5EBE7',
          200: '#CBD7CF',
          300: '#B1C3B7',
          400: '#97AF9F',
          500: '#3F704D', // Moss green
          600: '#325A3E',
          700: '#25432F',
          800: '#182C20',
          900: '#0B1511',
        },
        rust: {
          50: '#FDF4F0',
          100: '#FBE9E1',
          200: '#F7D3C3',
          300: '#F3BDA5',
          400: '#EFA787',
          500: '#D96C3D', // Rust orange
          600: '#AE5629',
          700: '#83411F',
          800: '#582C15',
          900: '#2D170B',
        },
        // Legacy colors for compatibility
        bg: '#1C1C1C', // Deep charcoal
        card: '#2A2A2A', // Slightly lighter charcoal
        primary: '#4A90E2', // Sky blue
        action: '#FF6B6B', // Keep red for emergency
        text: '#F5E6C8', // Light sand
        muted: '#6B6B6B', // Stone gray
        // Map background
        map: '#5DAA9D', // Aqua green for map areas
      }
    },
  },
  plugins: [],
}

