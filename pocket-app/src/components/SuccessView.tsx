export interface SuccessInfo {
  title: string;
  sub: string;
  line: string;
  special?: string;
}

export function SuccessView({ success, onDone }: { success: SuccessInfo; onDone: () => void }) {
  return (
    <div style={{ flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 4px calc(var(--sb) + 12px)', boxSizing: 'border-box' }}>
      <div style={{ flex: '1 1 auto', minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, paddingBottom: 36 }} role="status" aria-live="polite">
        <div className="pk-check-wrap" style={{ display: 'flex' }}>
          <svg width="84" height="84" viewBox="0 0 80 80" aria-hidden="true">
            <circle cx="40" cy="40" r="34" fill="var(--accent-soft)" />
            <circle className="pk-check-ring" cx="40" cy="40" r="34" fill="none" stroke="var(--accent-ink)" strokeWidth={3} strokeLinecap="round" strokeDasharray="213.63" strokeDashoffset="213.63" transform="rotate(-90 40 40)" />
            <path className="pk-check-path" d="M24 41 L35 52 L57 28" fill="none" stroke="var(--accent-ink)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="49" strokeDashoffset="49" />
          </svg>
        </div>
        <div className="pk-success-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center', maxWidth: 300 }}>
          <span className="pk-num" style={{ fontSize: 25, fontWeight: 700, letterSpacing: '-0.02em' }}>{success.title}</span>
          <span className="pk-ell" style={{ fontSize: 14.5, color: 'var(--ink2)', fontWeight: 600, maxWidth: 280 }}>{success.sub}</span>
          <span className="pk-num" style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 500, marginTop: 4 }}>{success.line}</span>
          {success.special && <span style={{ fontSize: 13, color: 'var(--accent-ink)', fontWeight: 700, marginTop: 6 }}>{success.special}</span>}
        </div>
      </div>
      <button type="button" className="pk-btn pk-btn-primary pk-press pk-success-done" style={{ width: '100%', maxWidth: 400 }} onClick={onDone} autoFocus>
        Done
      </button>
    </div>
  );
}
