import { useMemo } from 'react';
import { useStore } from '../lib/store';
import { derive, goalInfo } from '../lib/calc';
import { eur } from '../lib/format';
import { tintOf } from '../lib/icons';
import { Icon } from '../components/Icon';
import { useIsDark } from '../lib/hooks';

export function ArchivedGoalsScreen({ onBack, onOpenGoal }: { onBack: () => void; onOpenGoal: (id: string) => void }) {
  const { state } = useStore();
  const dark = useIsDark();
  const dv = useMemo(() => derive(state), [state]);
  const archived = state.goals.filter((g) => g.archived);

  return (
    <div className="pk-layer">
      <div className="pk-navbar">
        <button type="button" className="pk-circle pk-plain pk-press" aria-label="Back" onClick={onBack}><Icon id="back" className="pk-ico-s" /></button>
        <span className="pk-navtitle">Archived goals</span>
        <span style={{ width: 44 }} />
      </div>
      <div className="pk-layer-body pk-scroll">
        <div className="pk-col">
          {archived.length === 0 ? (
            <div className="pk-empty">
              <Icon id="archive" className="pk-ico" />
              <b>No archived goals</b>
              <p>Goals you archive will show up here.</p>
            </div>
          ) : (
            <div className="pk-list">
              {archived.map((g) => {
                const info = goalInfo(g, dv);
                const t = tintOf(g.tint, dark);
                return (
                  <button key={g.id} type="button" className="pk-row pk-press" onClick={() => onOpenGoal(g.id)}>
                    <span className="pk-badge" style={{ background: t.soft, color: t.ink }}><Icon id={g.icon} className="pk-ico-s" /></span>
                    <span style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span className="pk-t1 pk-ell">{g.name}</span>
                      <span className="pk-t2">{eur(info.saved)} of {eur(g.target)}</span>
                    </span>
                    <Icon id="next" className="pk-ico-xs" style={{ color: 'var(--ink2)' }} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
