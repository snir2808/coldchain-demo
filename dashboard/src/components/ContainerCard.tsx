import type { ContainerStatus } from '../api';

const KIND_LABEL: Record<ContainerStatus['kind'], string> = {
  freezer: 'הקפאה',
  chill: 'קירור',
};

const RANGE_PAD_C = 8;

function RangeBar({ container }: { container: ContainerStatus }) {
  const latest = container.latest;
  if (!latest) return null;

  const lo = container.minC - RANGE_PAD_C;
  const hi = container.maxC + RANGE_PAD_C;
  const pct = (value: number) => {
    const raw = ((value - lo) / (hi - lo)) * 100;
    return Math.min(98, Math.max(2, raw));
  };

  const inRange = latest.tempC >= container.minC && latest.tempC <= container.maxC;
  const bandStart = pct(container.minC);
  const bandEnd = pct(container.maxC);

  return (
    <div className="range">
      <div className="track">
        <div
          className="band"
          style={{ left: `${bandStart}%`, width: `${bandEnd - bandStart}%` }}
        />
        <div
          className={`marker ${inRange ? 'good' : 'serious'}`}
          style={{ left: `${pct(latest.tempC)}%` }}
        />
      </div>
      <div className="scale">
        <span>{lo}°</span>
        <span>{container.minC}°</span>
        <span>{container.maxC}°</span>
        <span>{hi}°</span>
      </div>
    </div>
  );
}

export function ContainerCard({ container }: { container: ContainerStatus }) {
  const latest = container.latest;

  if (!latest) {
    return (
      <article className="card">
        <div className="card-head">
          <h2>{container.name}</h2>
          <span className="kind">{KIND_LABEL[container.kind]}</span>
          <span className="device">{container.deviceId}</span>
        </div>
        <div className="empty-card">
          אין קריאות עדיין. הזרימו נתונים עם <code>python3 scripts/simulate.py</code>
        </div>
        <div className="status muted">◌ ממתין לשידור ראשון</div>
      </article>
    );
  }

  const inRange = latest.tempC >= container.minC && latest.tempC <= container.maxC;

  return (
    <article className={`card${inRange ? '' : ' serious'}`}>
      <div className="card-head">
        <h2>{container.name}</h2>
        <span className="kind">{KIND_LABEL[container.kind]}</span>
        <span className="device">{container.deviceId}</span>
      </div>

      <div className="reading-row">
        <div className="temp">
          {latest.tempC}
          <span className="unit">°C</span>
        </div>
        {inRange ? (
          <span className="status good">● בטווח</span>
        ) : (
          <span className="status serious">▲ חריגה</span>
        )}
      </div>

      <RangeBar container={container} />

      <div className="flags">
        {latest.flags.doorOpen && <span className="flag warn">⚠ דלת פתוחה</span>}
        {!latest.flags.batteryOk && <span className="flag warn">⚠ סוללה חלשה</span>}
        {latest.flags.doorOpen || !latest.flags.batteryOk ? null : (
          <span className="flag info">אין דגלים חריגים</span>
        )}
      </div>

      <div className="meta">
        <span>
          קריאה אחרונה:{' '}
          <span className="mono">{new Date(latest.receivedAt).toLocaleTimeString('he-IL')}</span>
        </span>
      </div>
    </article>
  );
}
