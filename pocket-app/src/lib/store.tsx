import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AppState, Entry, Goal } from './types';
import { DEFAULT_STATE } from './types';
import { uid } from './format';

const STORAGE_KEY = 'pocket.state.v1';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

interface StoreApi {
  state: AppState;
  setState: (updater: (s: AppState) => AppState) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'archived'>) => string;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  archiveGoal: (id: string, archived: boolean) => void;
  deleteGoal: (id: string) => void;
  addEntry: (entry: Omit<Entry, 'id' | 'createdAt'>) => void;
  updateEntry: (id: string, patch: Partial<Entry>) => void;
  deleteEntry: (id: string) => void;
  setStartingBalance: (amount: number) => void;
  setTheme: (theme: AppState['theme']) => void;
  setSelectedGoal: (id: string | null) => void;
  completeOnboarding: () => void;
  eraseAll: () => void;
}

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<AppState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setState = useCallback((updater: (s: AppState) => AppState) => {
    setStateRaw((s) => updater(s));
  }, []);

  const api = useMemo<StoreApi>(() => ({
    state,
    setState,
    addGoal: (goal) => {
      const id = uid();
      setState((s) => ({
        ...s,
        goals: [...s.goals, { ...goal, id, archived: false, createdAt: new Date().toISOString() }],
        selectedGoalId: s.selectedGoalId || id,
      }));
      return id;
    },
    updateGoal: (id, patch) => {
      setState((s) => ({ ...s, goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) }));
    },
    archiveGoal: (id, archived) => {
      setState((s) => ({ ...s, goals: s.goals.map((g) => (g.id === id ? { ...g, archived } : g)) }));
    },
    deleteGoal: (id) => {
      setState((s) => ({
        ...s,
        goals: s.goals.filter((g) => g.id !== id),
        entries: s.entries.filter((e) => e.goalId !== id),
        selectedGoalId: s.selectedGoalId === id ? null : s.selectedGoalId,
      }));
    },
    addEntry: (entry) => {
      setState((s) => ({ ...s, entries: [{ ...entry, id: uid(), createdAt: new Date().toISOString() }, ...s.entries] }));
    },
    updateEntry: (id, patch) => {
      setState((s) => ({ ...s, entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
    },
    deleteEntry: (id) => {
      setState((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== id) }));
    },
    setStartingBalance: (amount) => {
      setState((s) => ({ ...s, startingBalance: amount }));
    },
    setTheme: (theme) => {
      setState((s) => ({ ...s, theme }));
    },
    setSelectedGoal: (id) => {
      setState((s) => ({ ...s, selectedGoalId: id }));
    },
    completeOnboarding: () => {
      setState((s) => ({ ...s, onboarded: true }));
    },
    eraseAll: () => {
      setState(() => ({ ...DEFAULT_STATE, onboarded: true }));
    },
  }), [state, setState]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
