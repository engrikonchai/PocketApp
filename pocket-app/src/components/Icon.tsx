import { resolveIconPath } from '../lib/icons';

export function Icon({ id, className, style }: { id: string; className?: string; style?: React.CSSProperties }) {
  const cls = className && className !== 'pk-ico' ? 'pk-ico ' + className : 'pk-ico';
  return (
    <svg className={cls} viewBox="0 0 24 24" aria-hidden="true" style={style}>
      <path d={resolveIconPath(id)} />
    </svg>
  );
}
