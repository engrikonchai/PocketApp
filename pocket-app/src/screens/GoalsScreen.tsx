import { useMemo } from 'react';
import { useStore } from '../lib/store';
import { derive, goalInfo } from '../lib/calc';
import { eur, eur2 } from '../lib/format';
import { tintOf } from '../lib/icons';
import { Icon } from '../components/Icon';
import { useIsDark } from '../lib/hooks';
import type { Goal } from '../lib/types';

function GoalListRow({ goal, onOpen }: { goal: Goal; onOpen: () => void }) {
  const { state } = useStore();
  const dark = useIsDark();
  const dv = useMemo(() => derive(state), [state]);
  const info = goalInfo(goal, dv);
  const t = tintOf(goal.tint, dark);
  let right = Math.round(info.frac * 100) + '%';
  let rightColor = 'var(--ink2)';
  if (info.status === 'overdue') { right = 'Overdue'; rightColor = 'var(--warn)'; }
  if (info.status === 'completed') { right = 'Reached'; rightColor = t.ink; }

  return (
    <button type="button" className="pk-row pk-press" style={{ alignItems: 'flex-start', paddingTop: 12 }} onClick={onOpen}>
      <span className="pk-badge" style={{ background: t.soft, color: t.ink }}>
        <Icon id={goal.icon} className="pk-ico-s" />
      </span>
      <span style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span className="pk-t1 pk-ell">{goal.name}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: rightColor, flexShrink: 0 }}>
            {info.status === 'overdue' && <Icon id="clock" className="pk-ico-xs" />}
            {info.status === 'completed' && <Icon id="check" className="pk-ico-xs" />}
            {right}
          </span>
        </span>
        <div className="pk-bar"><span style={{ width: (info.frac * 100).toFixed(1) + '%', background: t.fill }} /></div>
        <span className="pk-t2">{eur(info.saved)} of {eur(goal.target)}</span>
      </span>
    </button>
  );
}

export function GoalsScreen({ onOpenGoal, onNewGoal, onArchived }: { onOpenGoal: (id: string) => void; onNewGoal: () => void; onArchived: () => void }) {
  const { state } = useStore();
  const dv = useMemo(() => derive(state), [state]);
  const visible = state.goals.filter((g) => !g.archived);
  const active = visible.filter((g) => goalInfo(g, dv).status !== 'completed');
  const done = visible.filter((g) => goalInfo(g, dv).status === 'completed');
  const archived = state.goals.filter((g) => g.archived);

  return (
    <section className="pk-screen pk-scroll" aria-label="Goals">
      <div className="pk-col pk-col-wide">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <h1 className="pk-large">Goals</h1>
          <button type="button" className="pk-circle pk-plain pk-press" aria-label="New goal" onClick={onNewGoal}>
            <Icon id="plus" className="pk-ico" />
          </button>
        </div>
        <p className="pk-body" style={{ marginBottom: 18 }}>{eur2(dv.total)} saved across {visible.length} goal{visible.length === 1 ? '' : 's'}</p>

        {visible.length === 0 ? (
          <div className="pk-empty">
            <Icon id="target" className="pk-ico" />
            <b>No goals yet</b>
            <p>Create your first savings goal to start tracking progress.</p>
            <button type="button" className="pk-btn pk-btn-secondary pk-press" style={{ marginTop: 8, height: 46 }} onClick={onNewGoal}>Create goal</button>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <>
                <div className="pk-sec" style={{ margin: '8px 0' }}>Active</div>
                <div className="pk-list">{active.map((g) => <GoalListRow key={g.id} goal={g} onOpen={() => onOpenGoal(g.id)} />)}</div>
              </>
            )}
            {done.length > 0 && (
              <>
                <div className="pk-sec" style={{ margin: '20px 0 8px' }}>Completed</div>
                <div className="pk-list">{done.map((g) => <GoalListRow key={g.id} goal={g} onOpen={() => onOpenGoal(g.id)} />)}</div>
              </>
            )}
          </>
        )}

        {archived.length > 0 && (
          <>
            <hr className="pk-hair" style={{ margin: '20px 0' }} />
            <button type="button" className="pk-settingrow pk-press" onClick={onArchived}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Icon id="archive" className="pk-ico-s" />Archived goals</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ink2)' }}>{archived.length}<Icon id="next" className="pk-ico-xs" /></span>
            </button>
          </>
        )}
      </div>
    </section>
  );
}
