import type { AppState, Entry, Goal } from './types';
import { eur2, whenLabel } from './format';
import { catOf, incCatOf, tintOf } from './icons';

export interface EntryRow {
  id: string;
  title: string;
  sub: string;
  iconId: string;
  badgeBg: string;
  badgeColor: string;
  amt: string;
  amtColor: string;
  when: string;
  time: string;
}

export function rowOf(e: Entry, state: AppState, dark: boolean, ctxGoal: boolean): EntryRow {
  const goal: Goal | undefined = e.goalId ? state.goals.find((g) => g.id === e.goalId) : undefined;

  if (e.type === 'save' || e.type === 'withdraw') {
    const t = tintOf(goal ? goal.tint : 'sage', dark);
    const iconId = goal ? goal.icon : 'target';
    const gname = goal ? goal.name : 'Deleted goal';
    let title: string, sub: string, amt: string, amtColor: string;
    if (ctxGoal) {
      title = e.note || (e.type === 'save' ? 'Added' : 'Withdrawn');
      sub = e.type === 'save' ? (e.source === 'outside' ? 'From outside Pocket' : 'From Available') : (e.source === 'outside' ? 'Used outside Pocket' : 'To Available');
      amt = (e.type === 'save' ? '+' : '−') + eur2(e.amount);
      amtColor = e.type === 'save' ? t.ink : 'var(--ink)';
    } else {
      title = e.note || (e.type === 'save' ? 'Saved to ' + gname : 'Withdrawn from ' + gname);
      sub = e.note ? (e.type === 'save' ? 'To ' : 'From ') + gname : (e.type === 'save' ? (e.source === 'outside' ? 'From outside Pocket' : 'From Available') : (e.source === 'outside' ? 'Used outside Pocket' : 'To Available'));
      amt = (e.type === 'save' ? '+' : '−') + eur2(e.amount);
      amtColor = 'var(--ink2)';
    }
    return { id: e.id, title, sub, iconId, badgeBg: t.soft, badgeColor: t.ink, amt, amtColor, when: whenLabel(e.date), time: e.time };
  }

  const cat = e.type === 'income' ? incCatOf(e.category) : catOf('expense', e.category);
  const title = e.note || cat.label;
  const sub = e.note ? cat.label : (e.type === 'income' ? 'Income' : 'Expense');
  const amt = (e.type === 'income' ? '+' : '−') + eur2(e.amount);
  const amtColor = e.type === 'income' ? 'var(--accent-ink)' : 'var(--ink)';
  return { id: e.id, title, sub, iconId: cat.icon, badgeBg: 'var(--surface2)', badgeColor: 'var(--ink)', amt, amtColor, when: whenLabel(e.date), time: e.time };
}
