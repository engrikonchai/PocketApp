import type { AppState, Entry, Goal } from './types';
import { dayShift, parseIso } from './format';

const DAY_MS = 86400000;
function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface Derived {
  saved: Record<string, number>;
  available: number;
  total: number;
}

export function derive(state: AppState): Derived {
  const saved: Record<string, number> = {};
  state.goals.forEach((g) => { saved[g.id] = 0; });
  let available = state.startingBalance;
  state.entries.forEach((e) => {
    if (e.type === 'save' && e.goalId) {
      saved[e.goalId] = (saved[e.goalId] || 0) + e.amount;
      if (e.source !== 'outside') available -= e.amount;
    } else if (e.type === 'withdraw' && e.goalId) {
      saved[e.goalId] = (saved[e.goalId] || 0) - e.amount;
      if (e.source !== 'outside') available += e.amount;
    } else if (e.type === 'expense') {
      available -= e.amount;
    } else if (e.type === 'income') {
      available += e.amount;
    }
  });
  Object.keys(saved).forEach((k) => { saved[k] = r2(saved[k]); });
  let total = 0;
  state.goals.forEach((g) => { total += saved[g.id] || 0; });
  return { saved, available: r2(available), total: r2(total) };
}

export type GoalStatus = 'archived' | 'completed' | 'overdue' | 'active';

export interface GoalInfo {
  saved: number;
  remaining: number;
  frac: number;
  completed: boolean;
  overdue: boolean;
  pace: number | null;
  weeks: number | null;
  daysLate: number;
  status: GoalStatus;
}

export function goalInfo(g: Goal, dv: Derived): GoalInfo {
  const saved = dv.saved[g.id] || 0;
  const remaining = Math.max(0, r2(g.target - saved));
  const completed = saved >= g.target - 0.004;
  const today = dayShift(0);
  const overdue = !completed && !!g.targetDate && g.targetDate < today;
  let pace: number | null = null;
  let weeks: number | null = null;
  let daysLate = 0;
  if (g.targetDate && !completed && !overdue) {
    const days = Math.max(1, Math.round((parseIso(g.targetDate).getTime() - parseIso(today).getTime()) / DAY_MS));
    weeks = Math.max(1, Math.ceil(days / 7));
    pace = remaining / weeks;
  }
  if (overdue && g.targetDate) daysLate = Math.round((parseIso(today).getTime() - parseIso(g.targetDate).getTime()) / DAY_MS);
  const status: GoalStatus = g.archived ? 'archived' : completed ? 'completed' : overdue ? 'overdue' : 'active';
  return { saved, remaining, frac: Math.min(1, Math.max(0, g.target > 0 ? saved / g.target : 0)), completed, overdue, pace, weeks, daysLate, status };
}

export function activeGoals(state: AppState, dv: Derived): Goal[] {
  return state.goals.filter((g) => !g.archived && goalInfo(g, dv).status !== 'completed');
}

export function eligibleSaveGoalId(state: AppState, dv: Derived): string | null {
  const act = activeGoals(state, dv);
  if (act.length === 0) return null;
  if (state.selectedGoalId && act.some((g) => g.id === state.selectedGoalId)) return state.selectedGoalId;
  return act[0].id;
}

export interface MonthInsights {
  putAside: number;
  income: number;
  spending: number;
  leftover: number;
  byCategory: { id: string; label: string; icon: string; amount: number; share: number; width: number }[];
  goalMoves: { goal: Goal; amount: number }[];
}

export function insightsForOffset(state: AppState, offset: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1, 0, 0, 0);
  return state.entries.filter((e) => {
    const d = parseIso(e.date);
    return d >= start && d < end;
  });
}

export function summarizeMonth(state: AppState, entries: Entry[]): MonthInsights {
  let income = 0;
  let spending = 0;
  let putAside = 0;
  const byCatMap: Record<string, number> = {};
  const goalMoveMap: Record<string, number> = {};

  entries.forEach((e) => {
    if (e.type === 'income') income += e.amount;
    else if (e.type === 'expense') {
      spending += e.amount;
      byCatMap[e.category || 'other'] = (byCatMap[e.category || 'other'] || 0) + e.amount;
    } else if (e.type === 'save' && e.goalId) {
      putAside += e.amount;
      goalMoveMap[e.goalId] = (goalMoveMap[e.goalId] || 0) + e.amount;
    } else if (e.type === 'withdraw' && e.goalId) {
      putAside -= e.amount;
      goalMoveMap[e.goalId] = (goalMoveMap[e.goalId] || 0) - e.amount;
    }
  });

  const maxCat = Math.max(1, ...Object.values(byCatMap));
  const byCategory = Object.entries(byCatMap)
    .sort((a, b) => b[1] - a[1])
    .map(([id, amount]) => ({
      id, label: id, icon: id,
      amount,
      share: spending > 0 ? Math.round((amount / spending) * 100) : 0,
      width: Math.max(2, (amount / maxCat) * 100),
    }));

  const goalMoves = Object.entries(goalMoveMap)
    .filter(([, amt]) => amt !== 0)
    .map(([goalId, amount]) => ({ goal: state.goals.find((g) => g.id === goalId), amount }))
    .filter((x): x is { goal: Goal; amount: number } => !!x.goal);

  return { putAside: r2(putAside), income: r2(income), spending: r2(spending), leftover: r2(income - spending), byCategory, goalMoves };
}
