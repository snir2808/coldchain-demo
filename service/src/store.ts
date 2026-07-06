import type { Alert, ContainerProfile, Reading } from './types.js';

const CONTAINERS: ContainerProfile[] = [
  { deviceId: 'A107C344', name: 'Freezer 12 (pharma)', kind: 'freezer', minC: -25, maxC: -15 },
  { deviceId: 'B211095C', name: 'Chill 07 (dairy)', kind: 'chill', minC: 2, maxC: 8 },
  { deviceId: 'C33A2101', name: 'Chill 09 (produce)', kind: 'chill', minC: 2, maxC: 8 },
];

export class Store {
  private readings = new Map<string, Reading[]>();
  private alerts: Alert[] = [];
  private nextAlertId = 1;

  listContainers(): ContainerProfile[] {
    return CONTAINERS;
  }

  getProfile(deviceId: string): ContainerProfile | undefined {
    return CONTAINERS.find((c) => c.deviceId === deviceId);
  }

  addReading(reading: Reading): void {
    const list = this.readings.get(reading.deviceId) ?? [];
    list.push(reading);
    this.readings.set(reading.deviceId, list);
  }

  latestReading(deviceId: string): Reading | undefined {
    const list = this.readings.get(deviceId);
    return list ? list[list.length - 1] : undefined;
  }

  addAlert(alert: Omit<Alert, 'id'>): Alert {
    const stored: Alert = { id: this.nextAlertId++, ...alert };
    this.alerts.push(stored);
    return stored;
  }

  listAlerts(): Alert[] {
    return this.alerts;
  }
}
