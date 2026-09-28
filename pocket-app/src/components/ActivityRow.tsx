import type { EntryRow } from '../lib/rows';
import { Icon } from './Icon';

export function ActivityRow({ row, onClick }: { row: EntryRow; onClick?: () => void }) {
  return (
    <button type="button" className="pk-row pk-press" onClick={onClick} aria-label={`${row.title}, ${row.sub}, ${row.amt}, ${row.when}`}>
      <span className="pk-badge" style={{ background: row.badgeBg, color: row.badgeColor }}>
        <Icon id={row.iconId} className="pk-ico-s" />
      </span>
      <span style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span className="pk-t1 pk-ell">{row.title}</span>
        <span className="pk-t2 pk-ell">{row.sub}</span>
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
        <span className="pk-amt" style={{ color: row.amtColor }}>{row.amt}</span>
        <span className="pk-t3">{row.when}{row.time ? ', ' + row.time : ''}</span>
      </span>
    </button>
  );
}
