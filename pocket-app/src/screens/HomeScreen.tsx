import { useMemo } from 'react';
import { useStore } from '../lib/store';
import { derive, activeGoals, goalInfo } from '../lib/calc';
import { eur2 } from '../lib/format';
import { rowOf } from '../lib/rows';
import { Icon } from '../components/Icon';
import { GoalArc } from '../components/GoalArc';
import { ActivityRow } from '../components/ActivityRow';
import { useIsDark } from '../lib/hooks';
import type { Goal } from '../lib/types';

export function HomeScreen({ onOpenGoal, onNewGoal, onSeeAllActivity, onEditEntry }: {
  onOpenGoal: (id: string) => void;
  onNewGoal: () => void;
  onSeeAllActivity: () => void;
  onEditEntry: (id: string) => void;
}) {
  const { state, setSelectedGoal } = useStore();
  const dark = useIsDark();
  const dv = useMemo(() => derive(state), [state]);
  const active = useMemo(() => activeGoals(state, dv), [state, dv]);
  const selected: Goal | null = useMemo(() => {
    if (state.selectedGoalId) {
      const g = active.find((x) => x.id === state.selectedGoalId);
      if (g) return g;
    }
    return active[0] ?? null;
  }, [state.selectedGoalId, active]);

  const recent = state.entries.slice(0, 4).map((e) => rowOf(e, state, dark, false));
  const availableColor = dv.available < 0 ? 'var(--danger)' : 'var(--ink)';

  return (
    <section className="pk-screen pk-scroll" aria-label="Home">
      <div className="pk-col pk-col-wide">
        <div className="pk-homehead" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon id="shield" className="pk-ico" />
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Pocket</span>
          </div>
        </div>

        {active.length === 0 ? (
          <div className="pk-empty">
            <Icon id="target" className="pk-ico" />
            <b>No savings goal yet</b>
            <p>Create a goal and Pocket will show your progress here.</p>
            <button type="button" className="pk-btn pk-btn-secondary pk-press" style={{ marginTop: 8, height: 46 }} onClick={onNewGoal}>Create goal</button>
          </div>
        ) : (
          <>
            <div className="pk-pills" role="tablist" aria-label="Goals">
              {active.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className="pk-pill pk-press"
                  aria-pressed={selected?.id === g.id}
                  onClick={() => setSelectedGoal(g.id)}
                >
                  <Icon id={g.icon} className="pk-ico-s" />
                  <span className="pk-ell">{g.name}</span>
                </button>
              ))}
              <button type="button" className="pk-pill pk-pill-add pk-press" aria-label="New goal" onClick={onNewGoal}>
                <Icon id="plus" className="pk-ico-s" />
              </button>
            </div>

            <div className="pk-home-grid" style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {selected && <GoalArc goal={selected} info={goalInfo(selected, dv)} onClick={() => onOpenGoal(selected.id)} />}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
                <div className="pk-stats">
                  <div><span className="pk-t3">Total savings</span><span className="pk-amt" style={{ fontSize: 17 }}>{eur2(dv.total)}</span></div>
                  <i />
                  <div><span className="pk-t3">Available</span><span className="pk-amt" style={{ fontSize: 17, color: availableColor }}>{eur2(dv.available)}</span></div>
                </div>
                <section aria-label="Recent activity">
                  <div className="pk-secthead">
                    <h2>Recent activity</h2>
                    {recent.length > 0 && <button type="button" className="pk-link" style={{ minHeight: 44, padding: '0 2px' }} onClick={onSeeAllActivity}>See all</button>}
                  </div>
                  {recent.length > 0 ? (
                    <div className="pk-list">
                      {recent.map((r) => <ActivityRow key={r.id} row={r} onClick={() => onEditEntry(r.id)} />)}
                    </div>
                  ) : (
                    <div className="pk-empty" style={{ padding: '22px 16px 8px' }}>
                      <Icon id="list" className="pk-ico" />
                      <p>Entries you record with + appear here.</p>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
