import type { AlertItem } from '../api';

const MAX_VISIBLE = 20;

const KIND_META: Record<string, { label: string; icon: string; className: string }> = {
  excursion: { label: 'חריגת טמפרטורה', icon: '▲', className: 'excursion' },
  door: { label: 'דלת פתוחה', icon: '⚠', className: 'door' },
};

export function AlertList({ alerts }: { alerts: AlertItem[] }) {
  const newestFirst = [...alerts].reverse();
  const visible = newestFirst.slice(0, MAX_VISIBLE);
  const hidden = newestFirst.length - visible.length;

  return (
    <section className="alerts">
      <div className="alerts-head">
        <h2>התראות</h2>
        <span className="count">{alerts.length}</span>
      </div>

      {alerts.length === 0 ? (
        <p className="alerts-empty">אין התראות. כל המכולות בטווח.</p>
      ) : (
        <>
          <ul className="alert-list">
            {visible.map((alert) => {
              const meta = KIND_META[alert.kind] ?? {
                label: alert.kind,
                icon: '●',
                className: 'excursion',
              };
              return (
                <li key={alert.id} className="alert-item">
                  <span className={`alert-chip ${meta.className}`}>
                    {meta.icon} {meta.label}
                  </span>
                  <span className="alert-msg">{alert.message}</span>
                  <span className="alert-time">
                    {new Date(alert.at).toLocaleTimeString('he-IL')}
                  </span>
                </li>
              );
            })}
          </ul>
          {hidden > 0 && <p className="alerts-more">ועוד {hidden} התראות ישנות יותר</p>}
        </>
      )}
    </section>
  );
}
