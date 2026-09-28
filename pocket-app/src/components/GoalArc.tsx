import { Icon } from './Icon';
import type { Goal } from '../lib/types';
import type { GoalInfo } from '../lib/calc';
import { eur } from '../lib/format';
import { amountFont } from '../lib/format';
import { tintOf } from '../lib/icons';
import { useIsDark } from '../lib/hooks';

const ARC_LEN = 314.16;

export function GoalArc({ goal, info, onClick }: { goal: Goal; info: GoalInfo; onClick?: () => void }) {
  const dark = useIsDark();
  const t = tintOf(goal.tint, dark);
  const offset = (ARC_LEN - ARC_LEN * info.frac).toFixed(2);
  const savedText = eur(info.saved);
  const statusText = info.completed ? 'Goal reached' : info.overdue ? `${info.daysLate}d overdue` : goal.targetDate ? `by ${goal.targetDate}` : 'No target date';
  const statusColor = info.completed ? t.ink : info.overdue ? 'var(--warn)' : 'var(--ink2)';

  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag type={onClick ? 'button' : undefined} className="pk-hero pk-press" onClick={onClick} aria-label={onClick ? `${goal.name}, ${savedText} saved of ${eur(goal.target)}` : undefined}>
      <div className="pk-arcwrap">
        <svg className="pk-arc" width="240" height="176" viewBox="0 0 240 176" aria-hidden="true">
          <path d="M20 104 A100 100 0 0 1 220 104" fill="none" stroke="var(--track)" strokeWidth={7} strokeLinecap="round" />
          <path
            className="pk-arcfill"
            d="M20 104 A100 100 0 0 1 220 104"
            fill="none"
            stroke={t.fill}
            strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray={ARC_LEN}
            style={{ strokeDashoffset: offset }}
          />
        </svg>
        <Icon id={goal.icon} className="pk-ico" style={{ position: 'absolute', top: 46, left: '50%', width: 30, height: 30, marginLeft: -15, strokeWidth: 1.5, color: t.ink }} />
        <div className="pk-arctext">
          <span className="pk-num" style={{ fontSize: amountFont(savedText, 38), fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.05 }}>{savedText}</span>
          <span style={{ fontSize: 13.5, color: 'var(--ink2)', fontWeight: 500 }}>of {eur(goal.target)}</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: statusColor, display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
            {info.completed && <Icon id="check" className="pk-ico-xs" />}
            {info.overdue && <Icon id="clock" className="pk-ico-xs" />}
            {statusText}
          </span>
        </div>
      </div>
    </Tag>
  );
}
