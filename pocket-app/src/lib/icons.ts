import type { IconId, TintId, ExpenseCategoryId, IncomeCategoryId } from './types';

export const ICON_PATHS: Record<string, string> = {
  car: 'M5.6 16H4.2a1 1 0 0 1-1-1v-2.2a1.6 1.6 0 0 1 1.1-1.5l2-.7 2.2-3.2A2 2 0 0 1 10.1 6.5h4.3a2 2 0 0 1 1.6.8l2.5 3.3 1.6.5a1.6 1.6 0 0 1 1.1 1.5V15a1 1 0 0 1-1 1h-1.4 M9.4 16h5.2 M7.5 14.2a1.8 1.8 0 1 0 0 3.6a1.8 1.8 0 1 0 0-3.6 M16.5 14.2a1.8 1.8 0 1 0 0 3.6a1.8 1.8 0 1 0 0-3.6 M6.3 10.9h12.2 M12.2 6.6v4.2',
  home: 'M4 11L12 4.5 20 11 M6 9.5v10h4.5v-5h3v5H18v-10',
  trip: 'M4.5 8.5h15a1 1 0 0 1 1 1v9a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5v-9a1 1 0 0 1 1-1z M9 8.5V6.2A1.2 1.2 0 0 1 10.2 5h3.6A1.2 1.2 0 0 1 15 6.2v2.3 M8 8.5V20 M16 8.5V20',
  laptop: 'M4.5 15V6.5A1.5 1.5 0 0 1 6 5h12a1.5 1.5 0 0 1 1.5 1.5V15 M2.5 18.5h19 M3 18.5L4.5 15h15l1.5 3.5',
  shield: 'M12 3.5l6.5 2.4v5.3c0 4.2-2.7 7.6-6.5 9.3-3.8-1.7-6.5-5.1-6.5-9.3V5.9z M9.3 12.2l1.9 1.9 3.6-3.8',
  gift: 'M4 9.5h16v3.5H4z M5.5 13h13v7h-13z M12 9.5V20 M12 9.5C10.3 9.5 7.8 9 7.8 7.2c0-1.4 1.6-2.2 2.8-1.2 1 .8 1.4 2.4 1.4 3.5z M12 9.5c1.7 0 4.2-.5 4.2-2.3 0-1.4-1.6-2.2-2.8-1.2-1 .8-1.4 2.4-1.4 3.5z',
  study: 'M2.5 9.5L12 5l9.5 4.5L12 14z M6.5 11.5v4c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-4 M20.5 10v5',
  ticket: 'M4.5 6.5h15a1 1 0 0 1 1 1V10a2 2 0 0 0 0 4v2.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V14a2 2 0 0 0 0-4V7.5a1 1 0 0 1 1-1z M14.5 7v2 M14.5 11v2 M14.5 15v2',
  bag: 'M6 8h12l-1 12H7z M9 8V6.5a3 3 0 0 1 6 0V8',
  cup: 'M5 9h11v5.5a4.5 4.5 0 0 1-4.5 4.5h-2A4.5 4.5 0 0 1 5 14.5z M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16 M8.5 4.5v2 M12 4.5v2',
  bus: 'M6.5 4.5h11A1.5 1.5 0 0 1 19 6v10.5H5V6a1.5 1.5 0 0 1 1.5-1.5z M5 11.5h14 M7.5 16.5v2.5 M16.5 16.5v2.5 M8 14h.01 M16 14h.01',
  tag: 'M12.6 4.5h6.9v6.9l-8.3 8.3a1.5 1.5 0 0 1-2.1 0l-4.8-4.8a1.5 1.5 0 0 1 0-2.1z M16 8h.01',
  receipt: 'M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z M9 8h6 M9 11.5h6 M9 15h3.5',
  heart: 'M12 19.5s-7-4.3-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.3c0 4.9-7 9.2-7 9.2z',
  dots: 'M3.5 12a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0-17 0 M8.5 12h.01 M12 12h.01 M15.5 12h.01',
  briefcase: 'M5 8.5h14a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 19 20H5a1.5 1.5 0 0 1-1.5-1.5V10A1.5 1.5 0 0 1 5 8.5z M9 8.5V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5v2 M3.5 13.5h17',
  refund: 'M9 6.5L5 10.5l4 4 M5 10.5h9.5a4.5 4.5 0 0 1 0 9H11',
  plus: 'M12 5v14 M5 12h14',
  close: 'M6.5 6.5l11 11 M17.5 6.5l-11 11',
  back: 'M15 5l-7 7 7 7',
  next: 'M9 6l6 6-6 6',
  down: 'M6.5 9.5L12 15l5.5-5.5',
  gear: 'M18.61 9.41 L20.99 10.03 L20.99 13.97 L18.61 14.59 L18.50 14.85 L19.75 16.96 L16.96 19.75 L14.85 18.50 L14.59 18.61 L13.97 20.99 L10.03 20.99 L9.41 18.61 L9.15 18.50 L7.04 19.75 L4.25 16.96 L5.50 14.85 L5.39 14.59 L3.01 13.97 L3.01 10.03 L5.39 9.41 L5.50 9.15 L4.25 7.04 L7.04 4.25 L9.15 5.50 L9.41 5.39 L10.03 3.01 L13.97 3.01 L14.59 5.39 L14.85 5.50 L16.96 4.25 L19.75 7.04 L18.50 9.15z M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6',
  tabHome: 'M4 11.5L12 4l8 7.5 M6 10v9h5v-5h2v5h5v-9',
  tabGoals: 'M6 4v16 M6 5h9l-2 3 2 3H6',
  tabActivity: 'M3 12h4l2-6 4 12 2-6h6',
  tabInsights: 'M5 19v-8 M12 19V5 M19 19v-5',
  filter: 'M4 7h16 M7 12h10 M10 17h4',
  calendar: 'M5.5 5h13A2.5 2.5 0 0 1 21 7.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-11A2.5 2.5 0 0 1 5.5 5z M8 3v4 M16 3v4 M3 10h18',
  trash: 'M4.5 7h15 M9.5 7V5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7 M6.5 7l.8 11.6A1.5 1.5 0 0 0 8.8 20h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7',
  archive: 'M3.5 5h17v4h-17z M5 9v9.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V9 M10 13h4',
  upload: 'M12 15V4 M7.5 8.5L12 4l4.5 4.5 M5 14v4.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V14',
  download: 'M12 4v11 M7.5 10.5L12 15l4.5-4.5 M5 14v4.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V14',
  file: 'M7 3.5h7l4.5 4.5v11a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 7 3.5z M14 3.5V8h4.5',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  clock: 'M12 3.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 1 0 0-17 M12 7.5V12l3 2',
  alert: 'M12 3.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 1 0 0-17 M12 8v5 M12 16h.01',
  pencil: 'M4 20l1-4L16 5l3 3L8 19z',
  wallet: 'M4 7.5A1.5 1.5 0 0 1 5.5 6h12A1.5 1.5 0 0 1 19 7.5V9 M4 7.5v10A1.5 1.5 0 0 0 5.5 19h13a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 18.5 9h-13A1.5 1.5 0 0 1 4 7.5z M16 14h.01',
  outside: 'M13 4.5h6.5V11 M19.5 4.5L11 13 M17 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 4 18.5v-10A1.5 1.5 0 0 1 5.5 7H10',
  target: 'M12 3.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 1 0 0-17 M12 7.5a4.5 4.5 0 1 0 0 9a4.5 4.5 0 1 0 0-9 M12 11.9h.01',
  list: 'M9 6.5h10.5 M9 12h10.5 M9 17.5h10.5 M4.5 6.5h.01 M4.5 12h.01 M4.5 17.5h.01',
  pocket: 'M5 4.5h14v7.5a7 7 0 0 1-14 0z M8.5 4.5v3a3.5 3.5 0 0 0 7 0v-3',
  backspace: 'M9 5h11a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 20 19H9l-6.5-7z M12.5 9.5l5 5 M17.5 9.5l-5 5',
  arrowR: 'M9 6l6 6-6 6',
  save: 'M12 4v10.5 M7.5 10L12 14.5 16.5 10 M5 19.5h14',
  withdraw: 'M12 20V9.5 M7.5 14L12 9.5l4.5 4.5 M5 4.5h14',
  expense: 'M7 17L17 7 M9 7h8v8',
  income: 'M17 7L7 17 M15 17H7V9',
  restore: 'M5 12a7 7 0 1 0 2.1-5 M5 4.5V9h4.5',
};

export function iconPath(id: string): string {
  return ICON_PATHS[id] || ICON_PATHS.dots;
}

export interface TintDef {
  l: string; li: string; ls: string; d: string; di: string; ds: string; label: string;
}

export const TINTS: Record<TintId, TintDef> = {
  sage: { l: '#7E9484', li: '#4E6656', ls: '#EEF2EE', d: '#8DAA96', di: '#A9C4B1', ds: '#1C251F', label: 'Sage' },
  slate: { l: '#7D8FA8', li: '#48607D', ls: '#EDF0F5', d: '#91A5C0', di: '#B0C2DA', ds: '#1B212B', label: 'Slate' },
  clay: { l: '#C38566', li: '#8A4B2E', ls: '#F8EEE8', d: '#D49D81', di: '#E6B8A0', ds: '#2A1E18', label: 'Clay' },
  amber: { l: '#B39B66', li: '#6F5C30', ls: '#F5F1E6', d: '#C7B07E', di: '#DCC9A0', ds: '#27231A', label: 'Sand' },
  plum: { l: '#9C8199', li: '#6B4F68', ls: '#F4EFF3', d: '#B39CB1', di: '#CDB6CB', ds: '#261E25', label: 'Plum' },
};

export const TINT_ORDER: TintId[] = ['sage', 'slate', 'clay', 'amber', 'plum'];

export function tintOf(id: TintId, dark: boolean) {
  const t = TINTS[id] || TINTS.sage;
  return dark
    ? { fill: t.d, ink: t.di, soft: t.ds }
    : { fill: t.l, ink: t.li, soft: t.ls };
}

export const GOAL_ICONS: { id: IconId; label: string }[] = [
  { id: 'car', label: 'Car' }, { id: 'home', label: 'Home' }, { id: 'plane', label: 'Travel' }, { id: 'laptop', label: 'Tech' },
  { id: 'shield', label: 'Safety net' }, { id: 'gift', label: 'Gift' }, { id: 'book', label: 'Study' }, { id: 'heart', label: 'Health' },
];

// map onboarding/simplified icon ids to actual path keys
export const ICON_ALIAS: Record<string, string> = {
  plane: 'trip', book: 'study', phone: 'laptop',
};

export function resolveIconPath(id: string): string {
  return iconPath(ICON_ALIAS[id] || id);
}

export const EXP_CATS: { id: ExpenseCategoryId; label: string; icon: string }[] = [
  { id: 'groceries', label: 'Groceries', icon: 'bag' },
  { id: 'food', label: 'Food & drink', icon: 'cup' },
  { id: 'transport', label: 'Transport', icon: 'bus' },
  { id: 'shopping', label: 'Shopping', icon: 'tag' },
  { id: 'bills', label: 'Bills & rent', icon: 'receipt' },
  { id: 'health', label: 'Health', icon: 'heart' },
  { id: 'other', label: 'Other', icon: 'dots' },
];

export const INC_CATS: { id: IncomeCategoryId; label: string; icon: string }[] = [
  { id: 'salary', label: 'Salary', icon: 'briefcase' },
  { id: 'freelance', label: 'Freelance', icon: 'laptop' },
  { id: 'gift', label: 'Gift', icon: 'gift' },
  { id: 'other', label: 'Other', icon: 'dots' },
];

export function catOf(_type: 'expense', id: string | null) {
  return EXP_CATS.find((c) => c.id === id) || EXP_CATS[EXP_CATS.length - 1];
}
export function incCatOf(id: string | null) {
  return INC_CATS.find((c) => c.id === id) || INC_CATS[INC_CATS.length - 1];
}
