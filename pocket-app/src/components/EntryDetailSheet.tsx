import { useState } from 'react';
import { useStore } from '../lib/store';
import { rowOf } from '../lib/rows';
import { Icon } from './Icon';
import { Sheet, AlertDialog } from './Sheet';
import { useIsDark } from '../lib/hooks';

export function EntryDetailSheet({ entryId, onClose }: { entryId: string; onClose: () => void }) {
  const { state, deleteEntry } = useStore();
  const dark = useIsDark();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const entry = state.entries.find((e) => e.id === entryId);
  if (!entry) return null;
  const row = rowOf(entry, state, dark, false);

  return (
    <Sheet title="Entry" onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 0 20px' }}>
        <span className="pk-badge" style={{ width: 52, height: 52, background: row.badgeBg, color: row.badgeColor }}>
          <Icon id={row.iconId} className="pk-ico" />
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <span style={{ fontSize: 17, fontWeight: 700 }} className="pk-ell">{row.title}</span>
          <span className="pk-t2">{row.sub}</span>
        </span>
      </div>
      <div className="pk-plan-row" style={{ borderTop: 'none' }}><span>Amount</span><span style={{ color: row.amtColor }}>{row.amt}</span></div>
      <div className="pk-plan-row"><span>Date</span><span>{row.when}{row.time ? ' · ' + row.time : ''}</span></div>
      <button type="button" className="pk-btn pk-btn-danger pk-press" style={{ width: '100%', marginTop: 20 }} onClick={() => setConfirmDelete(true)}>
        <Icon id="trash" className="pk-ico-s" />Delete entry
      </button>

      {confirmDelete && (
        <AlertDialog
          title="Delete this entry?"
          message="This can't be undone."
          confirmLabel="Delete"
          danger
          onConfirm={() => { deleteEntry(entry.id); setConfirmDelete(false); onClose(); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </Sheet>
  );
}
