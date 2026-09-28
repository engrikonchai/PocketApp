import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../lib/store';
import { derive, activeGoals, eligibleSaveGoalId } from '../lib/calc';
import { eur, eur2, todayIso, nowTime } from '../lib/format';
import { EXP_CATS, INC_CATS, tintOf } from '../lib/icons';
import { Icon } from './Icon';
import { Sheet } from './Sheet';
import { SwipeToConfirm } from './SwipeToConfirm';
import { SuccessView, type SuccessInfo } from './SuccessView';
import { useIsDark } from '../lib/hooks';
import type { EntryType, ExpenseCategoryId, IncomeCategoryId } from '../lib/types';
import { NumPad } from './NumPad';

const TYPE_META: Record<EntryType, { label: string; icon: string; swipe: string; verb: string }> = {
  save: { label: 'Save', icon: 'save', swipe: 'Swipe to save', verb: 'saved' },
  withdraw: { label: 'Withdraw', icon: 'withdraw', swipe: 'Swipe to withdraw', verb: 'withdrawn' },
  expense: { label: 'Expense', icon: 'expense', swipe: 'Swipe to add expense', verb: 'spent' },
  income: { label: 'Income', icon: 'income', swipe: 'Swipe to add income', verb: 'added' },
};

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

type Phase = 'idle' | 'completing' | 'success';

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
  const [phase, setPhase] = useState<Phase>('idle');
  const [success, setSuccess] = useState<SuccessInfo | null>(null);

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

  function handleConfirm() {
    if (!canSubmit || phase !== 'idle') return;
    setPhase('completing');
    setTimeout(() => commit(), 200);
  }

  function commit() {
    if (type === 'save' || type === 'withdraw') {
      const g = goal!;
      addEntry({ type, amount, date: todayIso(), time: nowTime(), note: note || null, goalId: g.id, source, category: null });
      setSelectedGoal(g.id);

      const before = dv.saved[g.id] || 0;
      const afterSaved = r2(before + (type === 'save' ? amount : -amount));
      let title: string, sub: string, line: string, special = '';
      if (type === 'save') {
        title = `${eur(amount)} saved`;
        sub = 'to ' + g.name;
        line = `${eur(afterSaved)} of ${eur(g.target)}`;
        if (afterSaved >= g.target - 0.004 && before < g.target - 0.004) special = g.name + ' is fully funded';
        if (source === 'outside') line += ' · from outside Pocket';
      } else {
        title = `${eur(amount)} withdrawn`;
        sub = 'from ' + g.name;
        line = `${eur(afterSaved)} left in goal` + (source === 'outside' ? ' · used outside Pocket' : ' · back in Available');
      }
      setSuccess({ title, sub, line, special });
    } else {
      addEntry({ type, amount, date: todayIso(), time: nowTime(), note: note || null, goalId: null, source: null, category });
      const afterAvail = r2(available + (type === 'income' ? amount : -amount));
      const cat = type === 'income' ? INC_CATS.find((c) => c.id === category) : EXP_CATS.find((c) => c.id === category);
      setSuccess({
        title: eur(amount) + (type === 'expense' ? ' spent' : ' added'),
        sub: cat?.label ?? 'Other',
        line: 'Available ' + eur(afterAvail),
      });
    }
    setPhase('success');
  }

  const cats = type === 'income' ? INC_CATS : EXP_CATS;
  const t = goal ? tintOf(goal.tint, dark) : null;

  const glowState = phase === 'completing' ? { opacity: 1, y: 70, scale: 0.85 } : phase === 'success' ? { opacity: 0.5, y: -30, scale: 1.2 } : { opacity: 0, y: 110, scale: 0.5 };

  return (
    <Sheet
      onClose={onClose}
      headerLeft={
        phase === 'idle' ? (
          <div style={{ position: 'relative' }}>
            <button type="button" className="pk-typebtn pk-glass pk-press" onClick={() => setTypeMenuOpen((v) => !v)} aria-haspopup="menu" aria-expanded={typeMenuOpen}>
              <Icon id={TYPE_META[type].icon} className="pk-ico-s" />
              {TYPE_META[type].label}
              <Icon id="down" className="pk-ico-xs" style={{ color: 'var(--ink2)' }} />
            </button>
            <AnimatePresence>
              {typeMenuOpen && (
                <motion.div
                  className="pk-menu pk-glass"
                  role="menu"
                  style={{ top: 48, left: 0 }}
                  initial={{ opacity: 0, scale: 0.94, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: -4 }}
                  transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : undefined
      }
    >
      <motion.div
        style={{
          position: 'absolute', left: '50%', top: 180, width: 320, height: 320, borderRadius: '50%', marginTop: -160,
          background: 'radial-gradient(circle, rgba(63,112,87,0.42) 0%, rgba(126,148,132,0.22) 42%, rgba(126,148,132,0) 72%)',
          pointerEvents: 'none', zIndex: 0, x: '-50%',
        }}
        animate={{ opacity: glowState.opacity, y: glowState.y, scale: glowState.scale }}
        transition={{ duration: phase === 'completing' ? 0.19 : 0.56, ease: 'easeOut' }}
      />

      {phase === 'success' && success ? (
        <SuccessView success={success} onDone={onClose} />
      ) : (
        <div style={{ position: 'relative', zIndex: 1, opacity: phase === 'completing' ? 0 : 1, transition: 'opacity 190ms ease-out' }}>
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
              <AnimatePresence>
                {goalPickerOpen && (
                  <motion.div
                    className="pk-menu pk-glass"
                    role="menu"
                    style={{ top: 52, left: 0 }}
                    initial={{ opacity: 0, scale: 0.94, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: -4 }}
                    transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                  >
                    {active.map((g) => (
                      <button key={g.id} type="button" onClick={() => { setGoalId(g.id); setGoalPickerOpen(false); }}>
                        <Icon id={g.icon} className="pk-ico-s" />
                        <span>{g.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
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

          <div style={{ marginBottom: 10 }}>
            <SwipeToConfirm label={TYPE_META[type].swipe} disabled={!canSubmit} onConfirm={handleConfirm} />
          </div>

          <NumPad onKey={pressKey} />
        </div>
      )}
    </Sheet>
  );
}
