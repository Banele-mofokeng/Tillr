import { useEffect, useRef } from 'react';

// USB/Bluetooth barcode scanners act as keyboards.
// They type the barcode very fast (< 50ms between chars) and end with Enter.
// This hook detects that pattern and fires onScan with the barcode string.

export function useHidScanner(onScan: (barcode: string) => void, enabled = true) {
  const buffer = useRef('');
  const lastKeyTime = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      const timeSinceLast = now - lastKeyTime.current;
      lastKeyTime.current = now;

      // If gap between keystrokes > 100ms, it's a human typing — reset buffer
      if (timeSinceLast > 100) buffer.current = '';

      if (e.key === 'Enter') {
        const barcode = buffer.current.trim();
        if (barcode.length >= 4) onScan(barcode); // min 4 chars = valid barcode
        buffer.current = '';
      } else if (e.key.length === 1) {
        buffer.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onScan, enabled]);
}
