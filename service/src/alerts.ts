import type { Notifier } from './notify.js';
import type { Store } from './store.js';
import type { Alert, AlertKind, ContainerProfile, Reading } from './types.js';

export interface AlertCandidate {
  kind: AlertKind;
  message: string;
}

export function evaluateReading(profile: ContainerProfile, reading: Reading): AlertCandidate[] {
  const candidates: AlertCandidate[] = [];

  if (reading.tempC < profile.minC || reading.tempC > profile.maxC) {
    candidates.push({
      kind: 'excursion',
      message: `${profile.name}: temperature ${reading.tempC}C outside range ${profile.minC}..${profile.maxC}C`,
    });
  }

  if (reading.flags.doorOpen && profile.kind === 'freezer') {
    candidates.push({
      kind: 'door',
      message: `${profile.name}: door open on a freezer container`,
    });
  }

  return candidates;
}

export function raiseAlerts(
  store: Store,
  notify: Notifier,
  profile: ContainerProfile,
  reading: Reading,
): Alert[] {
  const raised: Alert[] = [];
  for (const candidate of evaluateReading(profile, reading)) {
    const alert = store.addAlert({
      deviceId: profile.deviceId,
      kind: candidate.kind,
      message: candidate.message,
      at: reading.receivedAt,
    });
    notify.sendEmail(`[coldchain] ${candidate.kind}`, candidate.message);
    raised.push(alert);
  }
  return raised;
}
