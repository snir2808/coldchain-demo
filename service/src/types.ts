export interface ReadingFlags {
  motion: boolean;
  doorOpen: boolean;
  tamper: boolean;
  externalPower: boolean;
  batteryOk: boolean;
}

export interface Reading {
  deviceId: string;
  tempC: number;
  flags: ReadingFlags;
  batteryMv: number;
  seq: number;
  receivedAt: number;
}

export type ContainerKind = 'freezer' | 'chill';

export interface ContainerProfile {
  deviceId: string;
  name: string;
  kind: ContainerKind;
  minC: number;
  maxC: number;
}

export type AlertKind = 'excursion' | 'door';

export interface Alert {
  id: number;
  deviceId: string;
  kind: AlertKind;
  message: string;
  at: number;
}
