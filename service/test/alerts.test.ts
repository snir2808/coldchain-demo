import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluateReading } from '../src/alerts.js';
import type { ContainerProfile, Reading } from '../src/types.js';

const freezer: ContainerProfile = {
  deviceId: 'A107C344',
  name: 'Freezer 12 (pharma)',
  kind: 'freezer',
  minC: -25,
  maxC: -15,
};

const chill: ContainerProfile = {
  deviceId: 'B211095C',
  name: 'Chill 07 (dairy)',
  kind: 'chill',
  minC: 2,
  maxC: 8,
};

function reading(tempC: number, doorOpen = false): Reading {
  return {
    deviceId: 'A107C344',
    tempC,
    flags: { motion: false, doorOpen, tamper: false, externalPower: false, batteryOk: true },
    batteryMv: 3600,
    seq: 1,
    receivedAt: 1000,
  };
}

test('freezer inside range raises nothing', () => {
  assert.deepEqual(evaluateReading(freezer, reading(-18)), []);
});

test('freezer above range raises an excursion', () => {
  const alerts = evaluateReading(freezer, reading(-12));
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].kind, 'excursion');
});

test('chill container above range raises an excursion', () => {
  const alerts = evaluateReading(chill, { ...reading(12), deviceId: 'B211095C' });
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].kind, 'excursion');
});

test('open door on a freezer raises a door alert', () => {
  const alerts = evaluateReading(freezer, reading(-18, true));
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].kind, 'door');
});

test('open door during an excursion raises both alerts', () => {
  const alerts = evaluateReading(freezer, reading(-10, true));
  assert.deepEqual(alerts.map((a) => a.kind).sort(), ['door', 'excursion']);
});
