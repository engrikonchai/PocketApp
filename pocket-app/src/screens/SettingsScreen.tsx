import { useState } from 'react';
import { useStore } from '../lib/store';
import { eur2 } from '../lib/format';
import { Icon } from '../components/Icon';
import { AlertDialog } from '../components/Sheet';

export function SettingsScreen({ onBack, onArchived, onEditBalance }: { onBack: () => void; onArchived: () => void; onEditBalance: () => void }) {
  const { state, setTheme, eraseAll } = useStore();
  const [confirmErase, setConfirmErase] = useState(false);
  const archivedCount = state.goals.filter((g) => g.archived).length;

  return (
    <div className="pk-layer">
      <div className="pk-navbar">
        <button type="button" className="pk-circle pk-plain pk-press" aria-label="Back" onClick={onBack}><Icon id="back" className="pk-ico-s" /></button>
        <span className="pk-navtitle">Settings</span>
        <span style={{ width: 44 }} />
      </div>
      <div className="pk-layer-body pk-scroll">
        <div className="pk-col">
          <div className="pk-sec" style={{ margin: '8px 0' }}>Appearance</div>
          <div className="pk-seg">
            {(['system', 'light', 'dark'] as const).map((t) => (
              <button key={t} type="button" aria-pressed={state.theme === t} onClick={() => setTheme(t)}>
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="pk-sec" style={{ margin: '24px 0 4px' }}>Money</div>
          <button type="button" className="pk-settingrow pk-press" onClick={onEditBalance}>
            <span>Starting balance</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ink2)' }}>{eur2(state.startingBalance)}<Icon id="next" className="pk-ico-xs" /></span>
          </button>
          <div className="pk-settingrow" style={{ borderBottom: 'none' }}>
            <span>Currency</span>
            <span style={{ color: 'var(--ink2)' }}>Euro (&euro;)</span>
          </div>
          <p className="pk-note">Available starts from your starting balance and changes with every entry.</p>

          <div className="pk-sec" style={{ margin: '24px 0 4px' }}>Data</div>
          <button type="button" className="pk-settingrow pk-press" onClick={onArchived}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Icon id="archive" className="pk-ico-s" />Archived goals</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ink2)' }}>{archivedCount}<Icon id="next" className="pk-ico-xs" /></span>
          </button>

          <button type="button" className="pk-settingrow pk-press" style={{ color: 'var(--danger)', borderBottom: 'none', marginTop: 12 }} onClick={() => setConfirmErase(true)}>
            <span style={{ fontWeight: 700 }}>Erase all data</span>
            <Icon id="trash" className="pk-ico-s" />
          </button>
          <p className="pk-note">Pocket records money by hand on this device. It never connects to a bank or moves money.</p>
        </div>
      </div>

      {confirmErase && (
        <AlertDialog
          title="Erase all data?"
          message="Every goal, entry and your starting balance will be removed from this device."
          confirmLabel="Erase everything"
          danger
          onConfirm={() => { eraseAll(); setConfirmErase(false); onBack(); }}
          onCancel={() => setConfirmErase(false)}
        />
      )}
    </div>
  );
}
