---
name: sensor-protocol
description: Decodes binary payloads from ArrowTrack tracking devices. Use for any task involving raw sensor data, hex transmissions, or code that reads and interprets device messages.
---
# Sensor protocol

Every tracking device transmits a fixed-length binary message of 24 bytes.

## Message layout

| Bytes | Field | Type | Notes |
|---|---|---|---|
| 0-3 | Device id | uint32, big-endian | Shown as a hex string, e.g. A107C344 |
| 4 | Temperature | int8, Celsius | Signed! Freezer cargo transmits negative values |
| 5 | Flags | bitfield | See below |
| 6-7 | Battery | uint16, little-endian | Raw ADC value; millivolts = value * 4 |
| 8-11 | Sequence | uint32, little-endian | Increments on every transmission |
| 12-22 | Reserved | | Zeros in the current version |
| 23 | CRC-8 | poly 0x07, init 0x00 | Over bytes 0-22 |

## Flags (byte 5)

| Bit | Meaning |
|---|---|
| 0 | Motion detected |
| 1 | Door open |
| 2 | Tamper |
| 3 | External power |
| 4 | Battery OK |
| 5-7 | Reserved |

## Known traps

- Temperature is a signed int8. Reading it as uint8 turns minus 18 into 238.
- Device id is big-endian; all other multi-byte fields are little-endian.
- A message with a bad CRC is dropped. Never fix, never guess.

Full spec: payload-spec.md · Decoded examples: examples.md
