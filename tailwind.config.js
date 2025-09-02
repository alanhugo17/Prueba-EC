/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}","./src/components/**/*.{js,ts,jsx,tsx,mdx}","./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#008666",
        "primary-foreground": "#ffffff",
        muted: { DEFAULT: "#f4f4f5", foreground: "#6b7280" },
        ring: "#008666"
      },
      borderRadius: { "2xl": "1rem" }
    },
  },
  plugins: [],
}