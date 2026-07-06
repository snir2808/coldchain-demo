export interface ContainerStatus {
  deviceId: string;
  name: string;
  kind: 'freezer' | 'chill';
  minC: number;
  maxC: number;
  latest: {
    tempC: number;
    flags: { doorOpen: boolean; batteryOk: boolean };
    receivedAt: number;
  } | null;
}

export interface AlertItem {
  id: number;
  deviceId: string;
  kind: string;
  message: string;
  at: number;
}

export async function fetchContainers(): Promise<ContainerStatus[]> {
  const res = await fetch('/containers');
  if (!res.ok) throw new Error(`containers request failed: ${res.status}`);
  return res.json();
}

export async function fetchAlerts(): Promise<AlertItem[]> {
  const res = await fetch('/alerts');
  if (!res.ok) throw new Error(`alerts request failed: ${res.status}`);
  return res.json();
}
