import type { AlertItem } from '../api';

export function AlertList({ alerts }: { alerts: AlertItem[] }) {
  return (
    <section style={{ marginTop: 24 }}>
      <h2>התראות ({alerts.length})</h2>
      {alerts.length === 0 ? (
        <p>אין התראות. שקט תעשייתי.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {[...alerts].reverse().map((alert) => (
            <li
              key={alert.id}
              style={{ borderBottom: '1px solid #eee', padding: '8px 0', fontSize: 14 }}
            >
              <b>[{alert.kind}]</b> {alert.message}
              <span style={{ color: '#999', marginInlineStart: 8 }}>
                {new Date(alert.at).toLocaleTimeString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
