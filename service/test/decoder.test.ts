import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decodePayload } from '../src/decoder.js';

const FROZEN_DOOR_OPEN =
  'A1 07 C3 44 EE 12 8C 03 5A F0 21 00 00 00 00 00 00 00 00 00 00 00 00 AE';

test('decodes a frozen cargo payload with negative temperature', () => {
  const reading = decodePayload(FROZEN_DOOR_OPEN, 1000);
  assert.equal(reading.deviceId, 'A107C344');
  assert.equal(reading.tempC, -18);
  assert.equal(reading.flags.doorOpen, true);
  assert.equal(reading.flags.batteryOk, true);
  assert.equal(reading.flags.motion, false);
  assert.equal(reading.batteryMv, 3632);
  assert.equal(reading.seq, 2224218);
  assert.equal(reading.receivedAt, 1000);
});

test('rejects a payload with a bad crc', () => {
  const corrupted = FROZEN_DOOR_OPEN.replace(/AE$/, 'FF');
  assert.throws(() => decodePayload(corrupted), /bad crc/);
});

test('rejects a payload with a bad length', () => {
  assert.throws(() => decodePayload('A1 07 C3'), /bad payload length/);
});
