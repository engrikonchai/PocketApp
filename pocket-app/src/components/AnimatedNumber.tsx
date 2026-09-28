import { useEffect, useRef, useState } from 'react';
import { animate } from 'motion/react';

/**
 * Spring-animates a numeric value between renders (e.g. balances updating after
 * an entry) instead of jumping straight to the new figure.
 */
export function AnimatedNumber({ value, format, className, style }: {
  value: number;
  format: (n: number) => string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const prefersReducedMotion = useRef(typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    prevRef.current = value;
    if (from === to) return;
    if (prefersReducedMotion.current) { setDisplay(to); return; }
    const controls = animate(from, to, {
      type: 'spring',
      stiffness: 260,
      damping: 32,
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value]);

  return <span className={className} style={style}>{format(display)}</span>;
}
