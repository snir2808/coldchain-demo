import type { Reading } from './types.js';

export const PAYLOAD_LEN = 24;

export function crc8(data: Uint8Array): number {
  let crc = 0x00;
  for (const byte of data) {
    crc ^= byte;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x80 ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
    }
  }
  return crc;
}

export function decodePayload(hex: string, receivedAt = Date.now()): Reading {
  const clean = hex.replace(/\s+/g, '');
  const buf = Buffer.from(clean, 'hex');

  if (buf.length !== PAYLOAD_LEN) {
    throw new Error(`bad payload length: ${buf.length}, expected ${PAYLOAD_LEN}`);
  }
  if (crc8(buf.subarray(0, PAYLOAD_LEN - 1)) !== buf[PAYLOAD_LEN - 1]) {
    throw new Error('bad crc, payload dropped');
  }

  const flagsByte = buf[5];

  return {
    deviceId: buf.readUInt32BE(0).toString(16).toUpperCase().padStart(8, '0'),
    tempC: buf.readInt8(4),
    flags: {
      motion: (flagsByte & 0x01) !== 0,
      doorOpen: (flagsByte & 0x02) !== 0,
      tamper: (flagsByte & 0x04) !== 0,
      externalPower: (flagsByte & 0x08) !== 0,
      batteryOk: (flagsByte & 0x10) !== 0,
    },
    batteryMv: buf.readUInt16LE(6) * 4,
    seq: buf.readUInt32LE(8),
    receivedAt,
  };
}
