import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { derive, goalInfo } from '../lib/calc';
import { eur } from '../lib/format';
import { rowOf } from '../lib/rows';
import { Icon } from '../components/Icon';
import { GoalArc } from '../components/GoalArc';
import { ActivityRow } from '../components/ActivityRow';
import { AlertDialog } from '../components/Sheet';
import { useIsDark } from '../lib/hooks';

export function GoalDetailScreen({
  goalId, onBack, onEdit, onAddMoney, onWithdraw, onDeleted,
}: {
  goalId: string;
  onBack: () => void;
  onEdit: () => void;
  onAddMoney: () => void;
  onWithdraw: () => void;
  onDeleted: () => void;
}) {
  const { state, archiveGoal, deleteGoal } = useStore();
  const dark = useIsDark();
  const dv = useMemo(() => derive(state), [state]);
  const goal = state.goals.find((g) => g.id === goalId);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);

  if (!goal) return null;
  const info = goalInfo(goal, dv);
  const rows = state.entries.filter((e) => e.goalId === goalId).map((e) => ({ e, row: rowOf(e, state, dark, true) }));

  const canWithdraw = info.saved > 0;

  return (
    <div className="pk-layer">
      <div className="pk-navbar">
        <button type="button" className="pk-circle pk-plain pk-press" aria-label="Back" onClick={onBack}><Icon id="back" className="pk-ico-s" /></button>
        <span className="pk-navtitle">Goal details</span>
        <button type="button" className="pk-textbtn pk-press" onClick={onEdit}>Edit</button>
      </div>
      <div className="pk-layer-body pk-scroll">
        <div className="pk-col">
          <GoalArc goal={goal} info={info} />

          {goal.targetDate && (
            <div className="pk-plan-row"><span>Target date</span><span>{goal.targetDate}</span></div>
          )}
          {info.pace != null && (
            <>
              <div className="pk-plan-row"><span>Suggested pace</span><span>{eur(info.pace)} / week</span></div>
              <p className="pk-note">Suggested pace for the {info.weeks} weeks left. Not an automatic payment — Pocket never moves money.</p>
            </>
          )}

          <div className="pk-secthead" style={{ marginTop: 20 }}><h2>Activity</h2></div>
          {rows.length === 0 ? (
            <div className="pk-empty" style={{ padding: '22px 16px 8px' }}>
              <Icon id="list" className="pk-ico" />
              <p>Money you add or withdraw from this goal appears here.</p>
            </div>
          ) : (
            <div className="pk-list">{rows.map(({ e, row }) => <ActivityRow key={e.id} row={row} />)}</div>
          )}

          <div className="pk-callout">
            <button type="button" className="pk-settingrow pk-press" style={{ color: 'var(--ink2)' }} onClick={() => setConfirmArchive(true)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Icon id="archive" className="pk-ico-s" />{goal.archived ? 'Unarchive goal' : 'Archive goal'}</span>
            </button>
          </div>
          <button type="button" className="pk-settingrow pk-press" style={{ color: 'var(--danger)' }} onClick={() => setConfirmDelete(true)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Icon id="trash" className="pk-ico-s" />Delete goal</span>
          </button>
        </div>
      </div>
      <div className="pk-bottombar">
        {canWithdraw && <button type="button" className="pk-btn pk-btn-secondary pk-press" style={{ flex: '1 1 0' }} onClick={onWithdraw}>Withdraw</button>}
        <button type="button" className="pk-btn pk-btn-primary pk-press" style={{ flex: '1.6 1 0' }} onClick={onAddMoney}>
          <Icon id="plus" className="pk-ico-s" />Add money
        </button>
      </div>

      {confirmArchive && (
        <AlertDialog
          title={goal.archived ? 'Unarchive this goal?' : 'Archive this goal?'}
          message={goal.archived ? 'It will move back to your active goals.' : 'It will move out of your active goals. You can unarchive it later.'}
          confirmLabel={goal.archived ? 'Unarchive' : 'Archive'}
          onConfirm={() => { archiveGoal(goal.id, !goal.archived); setConfirmArchive(false); onBack(); }}
          onCancel={() => setConfirmArchive(false)}
        />
      )}
      {confirmDelete && (
        <AlertDialog
          title="Delete this goal?"
          message={`"${goal.name}" and its ${rows.length} linked ${rows.length === 1 ? 'entry' : 'entries'} will be permanently removed.`}
          confirmLabel="Delete goal"
          danger
          onConfirm={() => { deleteGoal(goal.id); setConfirmDelete(false); onDeleted(); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
