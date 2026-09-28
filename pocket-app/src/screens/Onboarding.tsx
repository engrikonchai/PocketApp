import { useState } from 'react';
import { useStore } from '../lib/store';
import { Icon } from '../components/Icon';
import { NumPad } from '../components/NumPad';
import { GOAL_ICONS, TINT_ORDER, tintOf } from '../lib/icons';
import type { IconId, TintId } from '../lib/types';
import { useIsDark } from '../lib/hooks';

type Step = 'intro' | 'balance' | 'goal';

export function Onboarding() {
  const { addGoal, setStartingBalance, completeOnboarding } = useStore();
  const dark = useIsDark();
  const [step, setStep] = useState<Step>('intro');
  const [balanceStr, setBalanceStr] = useState('');
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [icon, setIcon] = useState<IconId>('car');
  const [tint, setTint] = useState<TintId>('sage');
  const [touched, setTouched] = useState(false);

  const stepIndex = step === 'intro' ? 0 : step === 'balance' ? 1 : 2;

  function pressBalanceKey(k: string) {
    if (k === 'back') { setBalanceStr((s) => s.slice(0, -1)); return; }
    if (k === '.') { if (balanceStr.includes('.')) return; setBalanceStr((s) => (s === '' ? '0.' : s + '.')); return; }
    setBalanceStr((s) => { const dot = s.indexOf('.'); if (dot >= 0 && s.length - dot > 2) return s; if (s === '0') return k; return s + k; });
  }

  function finishWithGoal() {
    setTouched(true);
    const targetNum = parseFloat(target || '0') || 0;
    if (!name.trim() || targetNum <= 0) return;
    setStartingBalance(parseFloat(balanceStr || '0') || 0);
    addGoal({ name: name.trim(), target: targetNum, icon, tint, targetDate: null });
    completeOnboarding();
  }

  function skipGoal() {
    setStartingBalance(parseFloat(balanceStr || '0') || 0);
    completeOnboarding();
  }

  return (
    <div className="pk-onb">
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: i === stepIndex ? 24 : 6, height: 6, borderRadius: 3, background: i === stepIndex ? 'var(--ink)' : 'var(--line)', transition: 'width 200ms ease' }} />
        ))}
      </div>
      <div className="pk-onb-inner">
        {step === 'intro' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 14 }}>
            <div style={{ width: 76, height: 76, borderRadius: 24, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon id="pocket" className="pk-ico" style={{ width: 40, height: 40 }} />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Pocket</h1>
            <p className="pk-body" style={{ maxWidth: 320 }}>A calm place for your savings goals, and for what you spend and earn.</p>
            <p className="pk-note" style={{ maxWidth: 300 }}>Pocket records money by hand. It doesn't connect to your bank or move money.</p>
          </div>
        )}

        {step === 'balance' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <button type="button" className="pk-circle pk-plain pk-press" aria-label="Back" onClick={() => setStep('intro')} style={{ marginBottom: 12 }}><Icon id="back" className="pk-ico-s" /></button>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 8px' }}>What's in your pocket?</h1>
            <p className="pk-body" style={{ marginBottom: 14 }}>Enter how much money you have available right now. You can change this later.</p>
            <div className="pk-num" style={{ fontSize: 40, fontWeight: 800, padding: '4px 0 16px' }}>{'€' + (balanceStr || '0')}</div>
            <NumPad onKey={pressBalanceKey} />
          </div>
        )}

        {step === 'goal' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <button type="button" className="pk-circle pk-plain pk-press" aria-label="Back" onClick={() => setStep('balance')} style={{ marginBottom: 12 }}><Icon id="back" className="pk-ico-s" /></button>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 8px' }}>What are you saving for?</h1>
            <p className="pk-body" style={{ marginBottom: 10 }}>Start with one goal. You can add more later.</p>
            <div className="pk-field">
              <label htmlFor="onb-name">Name</label>
              <input id="onb-name" className="pk-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. First car" maxLength={40} />
              {touched && !name.trim() && <span className="pk-err"><Icon id="alert" className="pk-ico-xs" />Give your goal a name</span>}
            </div>
            <div className="pk-field">
              <label htmlFor="onb-target">Target</label>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 17, fontWeight: 700 }}>{'€'}</span>
                <input id="onb-target" className="pk-input" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="3,500" />
              </div>
              {touched && (parseFloat(target || '0') || 0) <= 0 && <span className="pk-err"><Icon id="alert" className="pk-ico-xs" />Enter a target above &euro;0</span>}
            </div>
            <div className="pk-fieldlabel" style={{ margin: '12px 0 8px' }}>Icon</div>
            <div className="pk-iconpick">
              {GOAL_ICONS.map((gi) => (
                <button key={gi.id} type="button" className="pk-press" aria-pressed={icon === gi.id} onClick={() => setIcon(gi.id)} aria-label={gi.label}><Icon id={gi.id} className="pk-ico-s" /></button>
              ))}
            </div>
            <div className="pk-fieldlabel" style={{ margin: '14px 0 4px' }}>Color</div>
            <div className="pk-tints">
              {TINT_ORDER.map((tid) => {
                const t = tintOf(tid, dark);
                return <button key={tid} type="button" style={{ background: t.fill, outline: tint === tid ? '2px solid var(--ink)' : 'none', outlineOffset: 3 }} aria-pressed={tint === tid} aria-label={tid} onClick={() => setTint(tid)} />;
              })}
            </div>
            <button type="button" className="pk-btn pk-btn-primary pk-press" style={{ width: '100%', marginTop: 20 }} onClick={finishWithGoal}>Create goal</button>
            <button type="button" className="pk-btn pk-press" style={{ width: '100%', background: 'none', color: 'var(--ink2)', height: 46 }} onClick={skipGoal}>Skip for now</button>
          </div>
        )}
      </div>

      <div style={{ width: '100%', maxWidth: 460, margin: '0 auto' }}>
        {step === 'intro' && (
          <button type="button" className="pk-btn pk-btn-primary pk-press" style={{ width: '100%' }} onClick={() => setStep('balance')}>Get started</button>
        )}
        {step === 'balance' && (
          <>
            <button type="button" className="pk-btn pk-btn-primary pk-press" style={{ width: '100%' }} onClick={() => setStep('goal')}>Continue</button>
            <button type="button" className="pk-btn pk-press" style={{ width: '100%', background: 'none', color: 'var(--ink2)', height: 46 }} onClick={() => { setBalanceStr('0'); setStep('goal'); }}>Skip for now</button>
          </>
        )}
      </div>
    </div>
  );
}
