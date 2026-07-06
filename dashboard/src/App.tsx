import { useEffect, useState } from 'react';
import { fetchAlerts, fetchContainers, type AlertItem, type ContainerStatus } from './api';
import { AlertList } from './components/AlertList';
import { ContainerCard } from './components/ContainerCard';

const REFRESH_MS = 5000;

export function App() {
  const [containers, setContainers] = useState<ContainerStatus[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const [nextContainers, nextAlerts] = await Promise.all([fetchContainers(), fetchAlerts()]);
        if (!active) return;
        setContainers(nextContainers);
        setAlerts(nextAlerts);
        setUpdatedAt(new Date());
        setError(null);
      } catch (err) {
        if (active) setError((err as Error).message);
      }
    }

    refresh();
    const timer = setInterval(refresh, REFRESH_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>
          <span className="brand">coldchain</span> · חדר בקרה
        </h1>
        <div className="spacer" />
        <div className={`live${error ? ' down' : ''}`}>
          <span className="dot" />
          {error ? (
            <span>אין חיבור לשירות</span>
          ) : (
            <>
              <span>עודכן</span>
              <span className="time">{updatedAt ? updatedAt.toLocaleTimeString('he-IL') : '...'}</span>
            </>
          )}
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <b>השירות לא זמין.</b> ודאו שהוא רץ: <code>npm run dev</code> בתיקיית הפרויקט,
          ואז רעננו. ({error})
        </div>
      )}

      <section className="grid">
        {containers.map((container) => (
          <ContainerCard key={container.deviceId} container={container} />
        ))}
      </section>

      <AlertList alerts={alerts} />
    </div>
  );
}
