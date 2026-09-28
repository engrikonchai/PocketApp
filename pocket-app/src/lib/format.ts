const eurFmt0 = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const eurFmt2 = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function eur(n: number): string {
  return eurFmt0.format(Math.round(n));
}
export function eur2(n: number): string {
  return eurFmt2.format(n);
}

export function pad2(n: number): string {
  return (n < 10 ? '0' : '') + n;
}
export function isoOf(d: Date): string {
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}
export function todayIso(): string {
  return isoOf(new Date());
}
export function parseIso(iso: string): Date {
  const b = iso.split('-').map(Number);
  return new Date(b[0], b[1] - 1, b[2], 12);
}
export function dayShift(n: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return isoOf(d);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function fmtDate(iso: string): string {
  const d = parseIso(iso);
  return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
}

export function monthLabel(offset: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return MONTHS_LONG[d.getMonth()] + (d.getFullYear() !== now.getFullYear() ? ' ' + d.getFullYear() : '');
}

export function dayHeader(iso: string): string {
  const today = dayShift(0);
  const yesterday = dayShift(-1);
  if (iso === today) return 'Today';
  if (iso === yesterday) return 'Yesterday';
  const d = parseIso(iso);
  return WEEKDAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
}

export function whenLabel(iso: string): string {
  const today = dayShift(0);
  const yesterday = dayShift(-1);
  if (iso === today) return 'Today';
  if (iso === yesterday) return 'Yesterday';
  const d = parseIso(iso);
  return d.getDate() + ' ' + MONTHS[d.getMonth()];
}

export function nowTime(): string {
  const d = new Date();
  return pad2(d.getHours()) + ':' + pad2(d.getMinutes());
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function amountFont(text: string, base: number): number {
  if (text.length > 11) return base - 8;
  if (text.length > 8) return base - 4;
  return base;
}
