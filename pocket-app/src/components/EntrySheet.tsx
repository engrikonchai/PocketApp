import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { derive, activeGoals, eligibleSaveGoalId } from '../lib/calc';
import { eur, eur2, todayIso, nowTime } from '../lib/format';
import { EXP_CATS, INC_CATS, tintOf } from '../lib/icons';
import { Icon } from './Icon';
import { Sheet } from './Sheet';
import { useIsDark } from '../lib/hooks';
import type { EntryType, ExpenseCategoryId, IncomeCategoryId } from '../lib/types';
import { NumPad } from './NumPad';

const TYPE_META: Record<EntryType, { label: string; icon: string; swipe: string }> = {
  save: { label: 'Save', icon: 'save', swipe: 'Confirm save' },
  withdraw: { label: 'Withdraw', icon: 'withdraw', swipe: 'Confirm withdrawal' },
  expense: { label: 'Expense', icon: 'expense', swipe: 'Confirm expense' },
  income: { label: 'Income', icon: 'income', swipe: 'Confirm income' },
};

export function EntrySheet({ initialType, initialGoalId, onClose }: { initialType?: EntryType; initialGoalId?: string | null; onClose: () => void }) {
  const { state, addEntry, setSelectedGoal } = useStore();
  const dark = useIsDark();
  const dv = useMemo(() => derive(state), [state]);
  const active = useMemo(() => activeGoals(state, dv), [state, dv]);
  const defaultGoalId = initialGoalId ?? eligibleSaveGoalId(state, dv);

  const [type, setType] = useState<EntryType>(initialType ?? (active.length ? 'save' : 'expense'));
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [amountStr, setAmountStr] = useState('');
  const [goalId, setGoalId] = useState<string | null>(defaultGoalId);
  const [source, setSource] = useState<'available' | 'outside'>('available');
  const [category, setCategory] = useState<ExpenseCategoryId | IncomeCategoryId>('groceries');
  const [note, setNote] = useState('');
  const [goalPickerOpen, setGoalPickerOpen] = useState(false);

  const amount = parseFloat(amountStr || '0') || 0;
  const goal = goalId ? state.goals.find((g) => g.id === goalId) : null;
  const available = dv.available;

  const errors: string[] = [];
  if (amount <= 0) errors.push('Enter an amount');
  if ((type === 'save' || type === 'withdraw') && !goal) errors.push('Choose a goal');
  if (type === 'save' && source === 'available' && amount > available) errors.push(`More than the ${eur2(available)} available`);
  if (type === 'withdraw' && goal) {
    const saved = dv.saved[goal.id] || 0;
    if (amount > saved) errors.push(`More than the ${eur2(saved)} in ${goal.name}`);
  }
  if (type === 'expense' && amount > available) errors.push(`More than the ${eur2(available)} available`);

  const canSubmit = errors.length === 0;

  function pressKey(k: string) {
    if (k === 'back') { setAmountStr((s) => s.slice(0, -1)); return; }
    if (k === '.') {
      if (amountStr.includes('.')) return;
      setAmountStr((s) => (s === '' ? '0.' : s + '.'));
      return;
    }
    setAmountStr((s) => {
      const dot = s.indexOf('.');
      if (dot >= 0 && s.length - dot > 2) return s;
      if (s === '0') return k;
      return s + k;
    });
  }

  function submit() {
    if (!canSubmit) return;
    if (type === 'save' || type === 'withdraw') {
      addEntry({ type, amount, date: todayIso(), time: nowTime(), note: note || null, goalId: goal!.id, source, category: null });
      setSelectedGoal(goal!.id);
    } else {
      addEntry({ type, amount, date: todayIso(), time: nowTime(), note: note || null, goalId: null, source: null, category });
    }
    onClose();
  }

  const cats = type === 'income' ? INC_CATS : EXP_CATS;
  const t = goal ? tintOf(goal.tint, dark) : null;

  return (
    <Sheet
      onClose={onClose}
      headerLeft={
        <div style={{ position: 'relative' }}>
          <button type="button" className="pk-typebtn pk-glass pk-press" onClick={() => setTypeMenuOpen((v) => !v)} aria-haspopup="menu" aria-expanded={typeMenuOpen}>
            <Icon id={TYPE_META[type].icon} className="pk-ico-s" />
            {TYPE_META[type].label}
            <Icon id="down" className="pk-ico-xs" style={{ color: 'var(--ink2)' }} />
          </button>
          {typeMenuOpen && (
            <div className="pk-menu pk-glass" role="menu" style={{ top: 48, left: 0 }}>
              {(['save', 'withdraw', 'expense', 'income'] as EntryType[]).map((tp) => (
                <button
                  key={tp}
                  type="button"
                  role="menuitemradio"
                  aria-checked={type === tp}
                  disabled={(tp === 'save' || tp === 'withdraw') && active.length === 0}
                  onClick={() => { setType(tp); setTypeMenuOpen(false); }}
                >
                  <Icon id={TYPE_META[tp].icon} className="pk-ico-s" />
                  <span>{TYPE_META[tp].label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      }
    >
      {(type === 'save' || type === 'withdraw') && (
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <button type="button" className="pk-identity pk-press" onClick={() => setGoalPickerOpen((v) => !v)}>
            {goal && t ? (
              <span className="pk-badge" style={{ background: t.soft, color: t.ink }}>
                <Icon id={goal.icon} className="pk-ico-s" />
              </span>
            ) : (
              <span className="pk-badge"><Icon id="target" className="pk-ico-s" /></span>
            )}
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
              <span className="pk-t1 pk-ell">{goal ? goal.name : 'Choose a goal'}</span>
              {goal && <span className="pk-t3">{eur(dv.saved[goal.id] || 0)} of {eur(goal.target)}</span>}
            </span>
            <Icon id="down" className="pk-ico-xs" style={{ color: 'var(--ink2)' }} />
          </button>
          {goalPickerOpen && (
            <div className="pk-menu pk-glass" role="menu" style={{ top: 52, left: 0 }}>
              {active.map((g) => (
                <button key={g.id} type="button" onClick={() => { setGoalId(g.id); setGoalPickerOpen(false); }}>
                  <Icon id={g.icon} className="pk-ico-s" />
                  <span>{g.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="pk-num" style={{ fontSize: 44, fontWeight: 800, padding: '10px 0 6px', letterSpacing: '-0.02em' }}>
        {'€' + (amountStr || '0')}
      </div>
      {errors[0] && amountStr !== '' && (
        <div className="pk-err"><Icon id="alert" className="pk-ico-xs" />{errors[0]}</div>
      )}

      {(type === 'save' || type === 'withdraw') && (
        <button type="button" className="pk-srcpill pk-press" style={{ margin: '10px 0' }} onClick={() => setSource((s) => (s === 'available' ? 'outside' : 'available'))}>
          <Icon id={source === 'available' ? 'wallet' : 'outside'} className="pk-ico-s" />
          {type === 'save'
            ? (source === 'available' ? `From Available · ${eur2(available)}` : 'From outside Pocket')
            : (source === 'available' ? 'To Available' : 'Used outside Pocket')}
        </button>
      )}

      {(type === 'expense' || type === 'income') && (
        <div className="pk-catgrid" style={{ margin: '10px 0' }}>
          {cats.map((c) => (
            <button key={c.id} type="button" className="pk-cat pk-press" aria-pressed={category === c.id} onClick={() => setCategory(c.id as ExpenseCategoryId | IncomeCategoryId)}>
              <span className="pk-badge"><Icon id={c.icon} className="pk-ico-s" /></span>
              {c.label}
            </button>
          ))}
        </div>
      )}

      <div className="pk-field" style={{ marginTop: 8 }}>
        <label htmlFor="entry-note">Note (optional)</label>
        <input id="entry-note" className="pk-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note" style={{ fontSize: 15, fontWeight: 500 }} />
      </div>

      <NumPad onKey={pressKey} />

      <button type="button" className="pk-swipe pk-press" style={{ marginTop: 14 }} disabled={!canSubmit} onClick={submit}>
        <span className="pk-swipe-label">{canSubmit ? TYPE_META[type].swipe : (errors[0] || 'Enter an amount')}</span>
      </button>
    </Sheet>
  );
}
