import SessionWrapper from '../src/SessionWrapper';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'ACNH Helper Suite',
  description: '40 interactive tools for Animal Crossing: New Horizons',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏝️</text></svg>",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a1a10',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0a1a10' }}>
        <SessionWrapper>
          {children}
        </SessionWrapper>
        <Analytics />
      </body>
    </html>
  );
}
