import { Icon } from './Icon';

export function NumPad({ onKey }: { onKey: (key: string) => void }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'];
  return (
    <div className="pk-keypad">
      {keys.map((k) => (
        <button
          key={k}
          type="button"
          className="pk-key pk-press"
          onClick={() => onKey(k)}
          aria-label={k === 'back' ? 'Delete' : k}
        >
          {k === 'back' ? <Icon id="backspace" className="pk-ico" /> : k}
        </button>
      ))}
    </div>
  );
}

export function useAmountInput(initial = '') {
  return initial;
}
