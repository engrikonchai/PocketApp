import { useState } from 'react';
import { useStore } from '../lib/store';
import { Sheet } from './Sheet';
import { NumPad } from './NumPad';

export function BalanceSheet({ onClose }: { onClose: () => void }) {
  const { state, setStartingBalance } = useStore();
  const [amountStr, setAmountStr] = useState(state.startingBalance ? String(state.startingBalance) : '');

  function pressKey(k: string) {
    if (k === 'back') { setAmountStr((s) => s.slice(0, -1)); return; }
    if (k === '.') { if (amountStr.includes('.')) return; setAmountStr((s) => (s === '' ? '0.' : s + '.')); return; }
    setAmountStr((s) => {
      const dot = s.indexOf('.');
      if (dot >= 0 && s.length - dot > 2) return s;
      if (s === '0') return k;
      return s + k;
    });
  }

  function submit() {
    setStartingBalance(parseFloat(amountStr || '0') || 0);
    onClose();
  }

  return (
    <Sheet title="Starting balance" onClose={onClose}>
      <p className="pk-body" style={{ marginBottom: 10 }}>How much do you have available right now? Pocket uses this as the baseline for your Available total.</p>
      <div className="pk-num" style={{ fontSize: 44, fontWeight: 800, padding: '10px 0 16px', letterSpacing: '-0.02em' }}>
        {'€' + (amountStr || '0')}
      </div>
      <NumPad onKey={pressKey} />
      <button type="button" className="pk-btn pk-btn-primary pk-press" style={{ width: '100%', marginTop: 14 }} onClick={submit}>Save</button>
    </Sheet>
  );
}
