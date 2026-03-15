export const metadata = {
  title: 'ACNH Helper Suite',
  description: '23 interactive tools for Animal Crossing: New Horizons',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏝️</text></svg>",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0a1a10' }}>
        {children}
      </body>
    </html>
  );
}
