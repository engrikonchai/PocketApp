import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { rowOf } from '../lib/rows';
import { dayHeader } from '../lib/format';
import { Icon } from '../components/Icon';
import { ActivityRow } from '../components/ActivityRow';
import { Segmented } from '../components/Segmented';
import { useIsDark } from '../lib/hooks';

type TypeFilter = 'all' | 'savings' | 'expense' | 'income';

export function ActivityScreen({ onEditEntry }: { onEditEntry: (id: string) => void }) {
  const { state } = useStore();
  const dark = useIsDark();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const filtered = useMemo(() => state.entries.filter((e) => {
    if (typeFilter === 'savings') return e.type === 'save' || e.type === 'withdraw';
    if (typeFilter === 'expense') return e.type === 'expense';
    if (typeFilter === 'income') return e.type === 'income';
    return true;
  }), [state.entries, typeFilter]);

  const groups = useMemo(() => {
    const out: { key: string; label: string; rows: { id: string; row: ReturnType<typeof rowOf> }[] }[] = [];
    let cur: (typeof out)[number] | null = null;
    filtered.forEach((e) => {
      if (!cur || cur.key !== e.date) {
        cur = { key: e.date, label: dayHeader(e.date), rows: [] };
        out.push(cur);
      }
      cur.rows.push({ id: e.id, row: rowOf(e, state, dark, false) });
    });
    return out;
  }, [filtered, state, dark]);

  return (
    <section className="pk-screen pk-scroll" aria-label="Activity">
      <div className="pk-col pk-col-wide">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h1 className="pk-large">Activity</h1>
        </div>
        <div style={{ marginBottom: 8 }}>
          <Segmented
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { id: 'all', label: 'All' },
              { id: 'savings', label: 'Savings' },
              { id: 'expense', label: 'Expenses' },
              { id: 'income', label: 'Income' },
            ]}
          />
        </div>

        {groups.length === 0 ? (
          <div className="pk-empty">
            <Icon id="list" className="pk-ico" />
            <b>Nothing here yet</b>
            <p>Entries you record with + appear here.</p>
          </div>
        ) : (
          groups.map((g) => (
            <div key={g.key}>
              <div className="pk-daylabel">{g.label}</div>
              <div className="pk-list">{g.rows.map(({ id, row }) => <ActivityRow key={id} row={row} onClick={() => onEditEntry(id)} />)}</div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
