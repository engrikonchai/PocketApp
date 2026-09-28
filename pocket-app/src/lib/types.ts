export type IconId =
  | 'car' | 'home' | 'briefcase' | 'laptop' | 'shield' | 'gift' | 'plane' | 'heart'
  | 'book' | 'camera' | 'phone' | 'target';

export type TintId = 'sage' | 'slate' | 'clay' | 'amber' | 'plum';

export interface Goal {
  id: string;
  name: string;
  target: number;
  icon: IconId;
  tint: TintId;
  targetDate: string | null; // ISO date
  archived: boolean;
  createdAt: string;
}

export type EntryType = 'save' | 'withdraw' | 'expense' | 'income';

export type ExpenseCategoryId =
  | 'groceries' | 'bills' | 'transport' | 'food' | 'shopping' | 'health' | 'other';

export type IncomeCategoryId = 'salary' | 'freelance' | 'gift' | 'other';

export interface Entry {
  id: string;
  type: EntryType;
  amount: number; // always positive
  date: string; // ISO date, yyyy-mm-dd
  time: string; // HH:MM
  note: string | null;
  goalId: string | null; // for save/withdraw
  source: 'available' | 'outside' | null; // for save/withdraw
  category: ExpenseCategoryId | IncomeCategoryId | null; // for expense/income
  createdAt: string;
}

export interface AppState {
  onboarded: boolean;
  startingBalance: number;
  goals: Goal[];
  entries: Entry[];
  theme: 'system' | 'light' | 'dark';
  selectedGoalId: string | null;
}

export const DEFAULT_STATE: AppState = {
  onboarded: false,
  startingBalance: 0,
  goals: [],
  entries: [],
  theme: 'system',
  selectedGoalId: null,
};
