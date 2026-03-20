'use client';

import dynamic from 'next/dynamic';
import '../../src/storage-polyfill';
import SyncManager from '../../src/SyncManager';

const App = dynamic(() => import('../../src/App'), { ssr: false });

export default function PortalPage() {
  return (
    <SyncManager>
      <App />
    </SyncManager>
  );
}
