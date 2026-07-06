import type { ContainerStatus } from '../api';

export function ContainerCard({ container }: { container: ContainerStatus }) {
  const latest = container.latest;
  const inRange =
    latest !== null && latest.tempC >= container.minC && latest.tempC <= container.maxC;

  return (
    <article
      style={{
        border: '1px solid #ccc',
        borderRadius: 8,
        padding: 16,
        background: latest === null ? '#f5f5f5' : inRange ? '#eefaf0' : '#fdecea',
      }}
    >
      <h2 style={{ margin: 0, fontSize: 18 }}>{container.name}</h2>
      <p style={{ margin: '4px 0', color: '#666', fontSize: 13 }}>
        {container.deviceId} · טווח {container.minC} עד {container.maxC} צלזיוס
      </p>
      {latest === null ? (
        <p>אין קריאות עדיין</p>
      ) : (
        <>
          <p style={{ fontSize: 32, margin: '8px 0', fontWeight: 700 }}>{latest.tempC}°</p>
          {latest.flags.doorOpen && <p style={{ color: 'crimson', margin: 0 }}>דלת פתוחה</p>}
          {!latest.flags.batteryOk && <p style={{ color: 'darkorange', margin: 0 }}>סוללה חלשה</p>}
        </>
      )}
    </article>
  );
}
