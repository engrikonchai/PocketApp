import { useState } from 'react';
import { useStore } from '../lib/store';
import { GOAL_ICONS, TINT_ORDER, tintOf } from '../lib/icons';
import type { Goal, IconId, TintId } from '../lib/types';
import { Icon } from './Icon';
import { Sheet } from './Sheet';
import { useIsDark } from '../lib/hooks';

export function GoalFormSheet({ editGoal, onClose }: { editGoal?: Goal | null; onClose: () => void }) {
  const { addGoal, updateGoal } = useStore();
  const dark = useIsDark();
  const [name, setName] = useState(editGoal?.name ?? '');
  const [target, setTarget] = useState(editGoal ? String(editGoal.target) : '');
  const [icon, setIcon] = useState<IconId>(editGoal?.icon ?? 'car');
  const [tint, setTint] = useState<TintId>(editGoal?.tint ?? 'sage');
  const [targetDate, setTargetDate] = useState(editGoal?.targetDate ?? '');
  const [touched, setTouched] = useState(false);

  const targetNum = parseFloat(target || '0') || 0;
  const nameErr = touched && !name.trim() ? 'Give your goal a name' : '';
  const targetErr = touched && targetNum <= 0 ? 'Enter a target above €0' : '';

  function submit() {
    setTouched(true);
    if (!name.trim() || targetNum <= 0) return;
    if (editGoal) {
      updateGoal(editGoal.id, { name: name.trim(), target: targetNum, icon, tint, targetDate: targetDate || null });
    } else {
      addGoal({ name: name.trim(), target: targetNum, icon, tint, targetDate: targetDate || null });
    }
    onClose();
  }

  return (
    <Sheet title={editGoal ? 'Edit goal' : 'New goal'} onClose={onClose}>
      <div className="pk-field">
        <label htmlFor="goal-name">Name</label>
        <input id="goal-name" className="pk-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. First car" maxLength={40} />
        {nameErr && <span className="pk-err"><Icon id="alert" className="pk-ico-xs" />{nameErr}</span>}
      </div>
      <div className="pk-field">
        <label htmlFor="goal-target">Target</label>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 17, fontWeight: 700 }}>{'€'}</span>
          <input
            id="goal-target"
            className="pk-input"
            inputMode="decimal"
            value={target}
            onChange={(e) => setTarget(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="3,500"
          />
        </div>
        {targetErr && <span className="pk-err"><Icon id="alert" className="pk-ico-xs" />{targetErr}</span>}
      </div>
      <div className="pk-field" style={{ borderBottom: 'none' }}>
        <label htmlFor="goal-date">Target date (optional)</label>
        <input id="goal-date" className="pk-input" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} style={{ fontWeight: 600, fontSize: 15 }} />
      </div>

      <div className="pk-fieldlabel" style={{ marginTop: 12, marginBottom: 8 }}>Icon</div>
      <div className="pk-iconpick">
        {GOAL_ICONS.map((gi) => (
          <button key={gi.id} type="button" className="pk-press" aria-pressed={icon === gi.id} onClick={() => setIcon(gi.id)} aria-label={gi.label}>
            <Icon id={gi.id} className="pk-ico-s" />
          </button>
        ))}
      </div>

      <div className="pk-fieldlabel" style={{ marginTop: 14, marginBottom: 4 }}>Color</div>
      <div className="pk-tints">
        {TINT_ORDER.map((tid) => {
          const t = tintOf(tid, dark);
          return (
            <button key={tid} type="button" style={{ background: t.fill, outline: tint === tid ? '2px solid var(--ink)' : 'none', outlineOffset: 3 }} aria-pressed={tint === tid} aria-label={tid} onClick={() => setTint(tid)} />
          );
        })}
      </div>

      <button type="button" className="pk-btn pk-btn-primary pk-press" style={{ width: '100%', marginTop: 20 }} onClick={submit}>
        {editGoal ? 'Save changes' : 'Create goal'}
      </button>
    </Sheet>
  );
}
