import { useEffect, useState } from 'react';
import { fetchAlerts, fetchContainers, type AlertItem, type ContainerStatus } from './api';
import { AlertList } from './components/AlertList';
import { ContainerCard } from './components/ContainerCard';

const REFRESH_MS = 5000;

export function App() {
  const [containers, setContainers] = useState<ContainerStatus[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const [nextContainers, nextAlerts] = await Promise.all([fetchContainers(), fetchAlerts()]);
        if (!active) return;
        setContainers(nextContainers);
        setAlerts(nextAlerts);
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
    <main style={{ fontFamily: 'system-ui', maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>coldchain dashboard</h1>
      {error && <p style={{ color: 'crimson' }}>השירות לא זמין: {error}</p>}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {containers.map((container) => (
          <ContainerCard key={container.deviceId} container={container} />
        ))}
      </section>
      <AlertList alerts={alerts} />
    </main>
  );
}
