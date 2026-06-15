'use client';

import dynamic from 'next/dynamic';

const PdfToolkitClient = dynamic(() => import('./PdfToolkitClient'), { ssr: false });

export default function PdfToolkitWrapper() {
  return <PdfToolkitClient />;
}
