'use client';

import dynamic from 'next/dynamic';

// Import storage polyfill before anything else
import '../src/storage-polyfill';

const App = dynamic(() => import('../src/App'), { ssr: false });

export default function Home() {
  return <App />;
}
