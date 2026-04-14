import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';
import { useEffect, useRef, useState } from 'react';

interface Props {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function CameraScanner({ onScan, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [error, setError] = useState('');
  const scannedRef = useRef(false);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current!, (result, err) => {
        if (result && !scannedRef.current) {
          scannedRef.current = true;
          onScan(result.getText());
        }
        if (err && !(err instanceof NotFoundException)) {
          setError('Camera error. Please try again.');
        }
      })
      .catch(() => setError('Could not access camera. Check permissions.'));

    return () => {
      // Stop all camera streams
      BrowserMultiFormatReader.releaseAllStreams();
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-950">
        <span className="text-white font-bold text-sm">Scan Barcode</span>
        <button onClick={onClose} className="text-neutral-400 hover:text-white text-2xl leading-none">×</button>
      </div>

      {/* Camera view */}
      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" />

        {/* Targeting overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-64 h-32">
            {/* Corner borders */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-sm" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-sm" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-sm" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-sm" />

            {/* Scanning line animation */}
            <div className="absolute left-2 right-2 h-0.5 bg-amber-400 opacity-80 animate-scan" />
          </div>
        </div>

        {/* Dim outside the scan zone */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 18rem 10rem at center, transparent 40%, rgba(0,0,0,0.65) 100%)' }}
        />
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-900 text-red-200 text-sm text-center">{error}</div>
      )}

      <div className="px-4 py-3 bg-neutral-950 text-center text-neutral-500 text-xs">
        Point camera at the barcode on the product
      </div>
    </div>
  );
}
