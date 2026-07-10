# ArrowTrack payload spec, version 3

Fixed-length binary message: 24 bytes. Transmitted on every reporting
interval (default: every 5 minutes, or immediately on a door or motion
event).

## Fields

### Bytes 0-3: device id
uint32 big-endian. Fixed vendor id burned in at manufacturing.
Displayed in logs and UIs as an 8-character hex string.

### Byte 4: temperature
Signed int8, whole degrees Celsius, range -128 to +127.
Typical values: frozen cargo -25 to -15, chilled cargo +2 to +8.
The value 0x80 (minus 128) is reserved to mean "sensor disconnected".

Note: this is the most bug-prone field in the protocol. Reading it
as uint8 turns every freezer temperature into a large positive value
(minus 18 becomes 238), and the alert logic will miss exactly the
most valuable cargo.

### Byte 5: flags
Bitfield, a set bit means the state is active:

| Bit | Mask | Meaning |
|---|---|---|
| 0 | 0x01 | Motion detected since the previous transmission |
| 1 | 0x02 | Door currently open |
| 2 | 0x04 | Suspected tamper |
| 3 | 0x08 | Connected to external power |
| 4 | 0x10 | Battery OK (above 20 percent) |
| 5-7 | | Reserved, always 0 |

### Bytes 6-7: battery
uint16 little-endian. Raw ADC value in the range 0-4095.
Server-side conversion to millivolts: mv = adc * 4.

### Bytes 8-11: sequence counter
uint32 little-endian. Increments by 1 on every transmission, resets
on device reboot. Used to detect lost and duplicate transmissions.

### Bytes 12-22: reserved
Zeros in version 3. Do not rely on the content; older devices may
send garbage there.

### Byte 23: CRC-8
Polynomial 0x07, initial value 0x00, no reflection, over bytes 0-22.
A message with a bad CRC is dropped and logged as a reception error.
Never fix, never guess.

## Reference CRC-8 implementations

```c
uint8_t crc8(const uint8_t *data, size_t len) {
    uint8_t crc = 0x00;
    for (size_t i = 0; i < len; i++) {
        crc ^= data[i];
        for (int b = 0; b < 8; b++)
            crc = (crc & 0x80) ? (uint8_t)((crc << 1) ^ 0x07)
                               : (uint8_t)(crc << 1);
    }
    return crc;
}
```

```typescript
function crc8(data: Uint8Array): number {
  let crc = 0x00;
  for (const byte of data) {
    crc ^= byte;
    for (let b = 0; b < 8; b++)
      crc = crc & 0x80 ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
  }
  return crc;
}
```
