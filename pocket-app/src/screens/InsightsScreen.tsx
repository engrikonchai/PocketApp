import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { insightsForOffset, summarizeMonth } from '../lib/calc';
import { eur2, monthLabel } from '../lib/format';
import { catOf } from '../lib/icons';
import { Icon } from '../components/Icon';

export function InsightsScreen() {
  const { state } = useStore();
  const [offset, setOffset] = useState(0);

  const entries = useMemo(() => insightsForOffset(state, offset), [state, offset]);
  const summary = useMemo(() => summarizeMonth(state, entries), [state, entries]);
  const isEmpty = entries.length === 0;

  return (
    <section className="pk-screen pk-scroll" aria-label="Insights">
      <div className="pk-col pk-col-wide">
        <h1 className="pk-large" style={{ marginBottom: 14 }}>Insights</h1>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <button type="button" className="pk-circle pk-plain pk-press" aria-label="Previous month" onClick={() => setOffset((o) => o - 1)}>
            <Icon id="back" className="pk-ico-s" />
          </button>
          <span style={{ fontSize: 16, fontWeight: 700 }}>{monthLabel(offset)}</span>
          <button type="button" className="pk-circle pk-plain pk-press" aria-label="Next month" onClick={() => setOffset((o) => Math.min(0, o + 1))} disabled={offset >= 0}>
            <Icon id="next" className="pk-ico-s" />
          </button>
        </div>

        {isEmpty ? (
          <div className="pk-empty">
            <Icon id="tabInsights" className="pk-ico" />
            <b>Nothing to show</b>
            <p>Record income, expenses or savings to see insights for this month.</p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', padding: '10px 0 18px' }}>
              <div className="pk-t3">Put aside for goals</div>
              <div className="pk-num" style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', margin: '4px 0' }}>{eur2(summary.putAside)}</div>
              <span className="pk-note">Moving money to goals isn't counted as spending.</span>
            </div>

            <div className="pk-stats">
              <div><span className="pk-t3">Income</span><span className="pk-amt" style={{ fontSize: 15 }}>{eur2(summary.income)}</span></div>
              <i />
              <div><span className="pk-t3">Spending</span><span className="pk-amt" style={{ fontSize: 15 }}>{eur2(summary.spending)}</span></div>
              <i />
              <div><span className="pk-t3">Left over</span><span className="pk-amt" style={{ fontSize: 15 }}>{eur2(summary.leftover)}</span></div>
            </div>

            {summary.byCategory.length > 0 && (
              <>
                <div className="pk-secthead" style={{ marginTop: 20 }}><h2>Spending by category</h2></div>
                <div className="pk-list">
                  {summary.byCategory.map((c) => {
                    const cat = catOf('expense', c.id);
                    return (
                      <div key={c.id} className="pk-catbar">
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon id={cat.icon} className="pk-ico-s" />
                            <span className="pk-t1">{cat.label}</span>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span className="pk-amt">{eur2(c.amount)}</span>
                            <span className="pk-t3">{c.share}%</span>
                          </span>
                        </span>
                        <div className="pk-bar"><span style={{ width: c.width + '%', background: 'var(--accent)' }} /></div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {summary.goalMoves.length > 0 && (
              <>
                <div className="pk-secthead" style={{ marginTop: 20 }}><h2>Goals this month</h2></div>
                <div className="pk-list">
                  {summary.goalMoves.map(({ goal, amount }) => (
                    <div key={goal.id} className="pk-row">
                      <span className="pk-badge"><Icon id={goal.icon} className="pk-ico-s" /></span>
                      <span style={{ flex: '1 1 auto' }} className="pk-t1">{goal.name}</span>
                      <span className="pk-amt" style={{ color: amount >= 0 ? 'var(--accent-ink)' : 'var(--ink)' }}>
                        {(amount >= 0 ? '+' : '−') + eur2(Math.abs(amount))}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
