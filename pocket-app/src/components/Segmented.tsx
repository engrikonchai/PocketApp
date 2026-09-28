import { motion } from 'motion/react';
import { useId } from 'react';

export function Segmented<T extends string>({ value, options, onChange }: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const layoutId = useId();
  return (
    <div className="pk-seg">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          style={{ position: 'relative', background: 'none', boxShadow: 'none' }}
        >
          {value === o.id && (
            <motion.span
              layoutId={layoutId}
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              style={{
                position: 'absolute', inset: 0, borderRadius: 10, background: 'var(--surface)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.10)', zIndex: 0,
              }}
            />
          )}
          <span style={{ position: 'relative', zIndex: 1 }}>{o.label}</span>
        </button>
      ))}
    </div>
  );
}
