import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { StoreProvider, useStore } from './lib/store';
import { useIsDark, useIsWide } from './lib/hooks';
import { Icon } from './components/Icon';
import { HomeScreen } from './screens/HomeScreen';
import { GoalsScreen } from './screens/GoalsScreen';
import { ActivityScreen } from './screens/ActivityScreen';
import { InsightsScreen } from './screens/InsightsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { GoalDetailScreen } from './screens/GoalDetailScreen';
import { ArchivedGoalsScreen } from './screens/ArchivedGoalsScreen';
import { Onboarding } from './screens/Onboarding';
import { EntrySheet } from './components/EntrySheet';
import { GoalFormSheet } from './components/GoalFormSheet';
import { BalanceSheet } from './components/BalanceSheet';
import { EntryDetailSheet } from './components/EntryDetailSheet';
import type { EntryType } from './lib/types';

type Tab = 'home' | 'goals' | 'activity' | 'insights';
type Layer = { type: 'goalDetail'; id: string } | { type: 'settings' } | { type: 'archived' } | null;
type SheetState =
  | { type: 'entry'; entryType?: EntryType; goalId?: string | null }
  | { type: 'goalForm'; editId?: string }
  | { type: 'balance' }
  | { type: 'entryDetail'; id: string }
  | null;

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: 'tabHome' },
  { id: 'goals', label: 'Goals', icon: 'tabGoals' },
  { id: 'activity', label: 'Activity', icon: 'tabActivity' },
  { id: 'insights', label: 'Insights', icon: 'tabInsights' },
];

function AppShell() {
  const { state } = useStore();
  const dark = useIsDark();
  const wide = useIsWide();
  const [tab, setTab] = useState<Tab>('home');
  const [layer, setLayer] = useState<Layer>(null);
  const [sheet, setSheet] = useState<SheetState>(null);

  if (!state.onboarded) {
    return (
      <div className={'pk-app' + (dark ? ' pk-dark' : '') + (wide ? ' pk-wide' : '')}>
        <Onboarding />
      </div>
    );
  }

  function goTab(t: Tab) {
    setTab(t);
    setLayer(null);
  }

  const appClass = 'pk-app' + (dark ? ' pk-dark' : '') + (wide ? ' pk-wide' : '');

  return (
    <div className={appClass}>
      <nav className="pk-side" aria-label="Navigation">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px 20px' }}>
          <Icon id="shield" className="pk-ico" />
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>Pocket</span>
        </div>
        {TABS.map((t) => (
          <button key={t.id} type="button" className="pk-sidelink pk-press" aria-current={tab === t.id && !layer ? 'page' : undefined} onClick={() => goTab(t.id)}>
            <Icon id={t.icon} className="pk-ico-s" />{t.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button type="button" className="pk-sidelink pk-press" aria-current={layer?.type === 'settings' ? 'page' : undefined} onClick={() => setLayer({ type: 'settings' })}>
          <Icon id="gear" className="pk-ico-s" />Settings
        </button>
        <button type="button" className="pk-btn pk-btn-primary pk-press" style={{ margin: '12px 4px 0' }} onClick={() => setSheet({ type: 'entry' })}>
          <Icon id="plus" className="pk-ico-s" />New entry
        </button>
      </nav>

      <main className="pk-main">
        <div className="pk-roots">
          <AnimatePresence initial={false} mode="sync">
            {tab === 'home' && (
              <motion.div key="home" className="pk-tabpane" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}>
                <HomeScreen
                  onOpenGoal={(id) => setLayer({ type: 'goalDetail', id })}
                  onNewGoal={() => setSheet({ type: 'goalForm' })}
                  onSeeAllActivity={() => goTab('activity')}
                  onEditEntry={(id) => setSheet({ type: 'entryDetail', id })}
                />
              </motion.div>
            )}
            {tab === 'goals' && (
              <motion.div key="goals" className="pk-tabpane" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}>
                <GoalsScreen
                  onOpenGoal={(id) => setLayer({ type: 'goalDetail', id })}
                  onNewGoal={() => setSheet({ type: 'goalForm' })}
                  onArchived={() => setLayer({ type: 'archived' })}
                />
              </motion.div>
            )}
            {tab === 'activity' && (
              <motion.div key="activity" className="pk-tabpane" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}>
                <ActivityScreen onEditEntry={(id) => setSheet({ type: 'entryDetail', id })} />
              </motion.div>
            )}
            {tab === 'insights' && (
              <motion.div key="insights" className="pk-tabpane" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}>
                <InsightsScreen />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {layer?.type === 'goalDetail' && (
            <motion.div key={'goal-' + layer.id} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 380, damping: 38 }}>
              <GoalDetailScreen
                goalId={layer.id}
                onBack={() => setLayer(null)}
                onEdit={() => setSheet({ type: 'goalForm', editId: layer.id })}
                onAddMoney={() => setSheet({ type: 'entry', entryType: 'save', goalId: layer.id })}
                onWithdraw={() => setSheet({ type: 'entry', entryType: 'withdraw', goalId: layer.id })}
                onDeleted={() => setLayer(null)}
              />
            </motion.div>
          )}
          {layer?.type === 'settings' && (
            <motion.div key="settings" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 380, damping: 38 }}>
              <SettingsScreen
                onBack={() => setLayer(null)}
                onArchived={() => setLayer({ type: 'archived' })}
                onEditBalance={() => setSheet({ type: 'balance' })}
              />
            </motion.div>
          )}
          {layer?.type === 'archived' && (
            <motion.div key="archived" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 380, damping: 38 }}>
              <ArchivedGoalsScreen onBack={() => setLayer(null)} onOpenGoal={(id) => setLayer({ type: 'goalDetail', id })} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {!wide && !layer && (
        <div className="pk-tabwrap pk-narrow-only">
          <nav className="pk-tabbar pk-glass" aria-label="Tabs">
            {TABS.map((t) => (
              <button key={t.id} type="button" className="pk-tab" aria-current={tab === t.id ? 'page' : undefined} onClick={() => goTab(t.id)}>
                <Icon id={t.icon} className="pk-ico" />{t.label}
              </button>
            ))}
          </nav>
          <button type="button" className="pk-plus pk-press" aria-label="New entry" onClick={() => setSheet({ type: 'entry' })}>
            <Icon id="plus" className="pk-ico" style={{ width: 26, height: 26, strokeWidth: 2.1 }} />
          </button>
        </div>
      )}

      {sheet?.type === 'entry' && (
        <EntrySheet initialType={sheet.entryType} initialGoalId={sheet.goalId} onClose={() => setSheet(null)} />
      )}
      {sheet?.type === 'goalForm' && (
        <GoalFormSheet editGoal={sheet.editId ? state.goals.find((g) => g.id === sheet.editId) ?? null : null} onClose={() => setSheet(null)} />
      )}
      {sheet?.type === 'balance' && <BalanceSheet onClose={() => setSheet(null)} />}
      {sheet?.type === 'entryDetail' && <EntryDetailSheet entryId={sheet.id} onClose={() => setSheet(null)} />}

      {!wide && !layer && (
        <button
          type="button"
          className="pk-circle pk-plain pk-press"
          aria-label="Settings"
          onClick={() => setLayer({ type: 'settings' })}
          style={{ position: 'fixed', top: 'calc(var(--st) + 6px)', right: 16, zIndex: 10 }}
        >
          <Icon id="gear" className="pk-ico-s" />
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}
