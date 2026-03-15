'use client';

import dynamic from 'next/dynamic';
import '../../src/storage-polyfill';

const App = dynamic(() => import('../../src/App'), { ssr: false });

export default function PortalPage() {
  return <App />;
}
