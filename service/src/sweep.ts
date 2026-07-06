import { raiseAlerts } from './alerts.js';
import type { Notifier } from './notify.js';
import type { Store } from './store.js';

const SWEEP_INTERVAL_MS = 60_000;
const STALE_READING_MS = 10 * 60_000;

// Safety net: re-checks the latest reading of every container, in case an
// ingest-time check was missed while the service was busy or restarting.
export function startSweep(store: Store, notify: Notifier, intervalMs = SWEEP_INTERVAL_MS): NodeJS.Timeout {
  return setInterval(() => {
    for (const profile of store.listContainers()) {
      const latest = store.latestReading(profile.deviceId);
      if (!latest) continue;
      if (Date.now() - latest.receivedAt > STALE_READING_MS) continue;
      raiseAlerts(store, notify, profile, latest);
    }
  }, intervalMs);
}
