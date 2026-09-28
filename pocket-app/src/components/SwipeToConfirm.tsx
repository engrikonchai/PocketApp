import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { Icon } from './Icon';

const HANDLE_D = 50;
const INSET = 4;

export function SwipeToConfirm({ label, disabled, onConfirm }: { label: string; disabled: boolean; onConfirm: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [maxTravel, setMaxTravel] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);

  const fillW = useTransform(x, (v) => v + HANDLE_D / 2 + INSET);
  const progress = useTransform(x, (v) => (maxTravel > 0 ? v / maxTravel : 0));
  const glowOpacity = useTransform(progress, (p) => 0.16 + p * 0.55);
  const labelOpacity = useTransform(progress, (p) => Math.max(0, 1 - p * 1.6));

  function measure() {
    const rect = trackRef.current?.getBoundingClientRect();
    const w = rect ? rect.width - HANDLE_D - INSET * 2 : 1;
    setMaxTravel(Math.max(1, w));
    return Math.max(1, w);
  }

  useEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function complete(travel: number) {
    setDone(true);
    animate(x, travel, { type: 'spring', stiffness: 420, damping: 40 });
    onConfirm();
  }

  function reset() {
    animate(x, 0, { type: 'spring', stiffness: 420, damping: 40 });
  }

  return (
    <div
      ref={trackRef}
      className="pk-swipe"
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={label}
      style={{ opacity: disabled ? 0.4 : 1, cursor: disabled ? 'default' : 'pointer' }}
      onClick={() => {
        if (disabled || dragging || done) return;
        const travel = measure();
        complete(travel);
      }}
      onKeyDown={(e) => {
        if (disabled || done) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); complete(measure()); }
      }}
    >
      <motion.span
        style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: fillW, background: 'linear-gradient(90deg, rgba(126,148,132,0.05) 0%, #7E9484 100%)' }}
      />
      <motion.span
        style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: fillW, boxShadow: '0 0 22px 5px #7E9484', opacity: glowOpacity, pointerEvents: 'none' }}
      />
      <motion.span className="pk-swipe-label" style={{ opacity: labelOpacity, transition: 'none' }}>{label}</motion.span>
      <motion.span
        className="pk-swipe-handle"
        style={{ x, left: INSET, transition: 'none', pointerEvents: disabled || done ? 'none' : 'auto', touchAction: 'none' }}
        drag={disabled || done ? false : 'x'}
        dragConstraints={{ left: 0, right: maxTravel }}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={() => { measure(); setDragging(true); }}
        onDragEnd={() => {
          setDragging(false);
          const p = maxTravel > 0 ? x.get() / maxTravel : 0;
          if (p >= 0.82) complete(maxTravel);
          else reset();
        }}
      >
        <Icon id="arrowR" className="pk-ico" style={{ width: 18, height: 18, strokeWidth: 2.2 }} />
      </motion.span>
    </div>
  );
}
