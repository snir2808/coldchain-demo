# Decoded transmission examples

## Example 1: freezer container, door open

```
A1 07 C3 44 EE 12 8C 03 5A F0 21 00 00 00 00 00 00 00 00 00 00 00 00 AE
```

| Field | Raw bytes | Value |
|---|---|---|
| Device id | A1 07 C3 44 | A107C344 |
| Temperature | EE | minus 18 Celsius (int8) |
| Flags | 12 | door open + battery OK |
| Battery | 8C 03 | ADC 908, i.e. 3632 millivolts |
| Sequence | 5A F0 21 00 | 2224218 |
| CRC-8 | AE | valid |

Interpretation: frozen cargo at a healthy temperature, but the door
is open. If it stays open, the temperature will start climbing.
Raising an alert is recommended.

## Example 2: chilled cargo, routine

```
B2 11 09 5C 04 10 20 03 07 00 00 00 00 00 00 00 00 00 00 00 00 00 00 09
```

| Field | Raw bytes | Value |
|---|---|---|
| Device id | B2 11 09 5C | B211095C |
| Temperature | 04 | 4 Celsius |
| Flags | 10 | battery OK only |
| Battery | 20 03 | ADC 800, i.e. 3200 millivolts |
| Sequence | 07 00 00 00 | 7 |
| CRC-8 | 09 | valid |

Interpretation: chilled cargo in range, no unusual flags. Routine.

## Example 3: the container from example 1, misread as uint8

Reading byte 4 as uint8 instead of int8 decodes example 1 as:
temperature 238 Celsius. A system expecting the range minus 25 to
minus 15 will flag it as a sensor error or ignore it, and meanwhile
the cargo thaws. This is why the spec stresses: byte 4 is signed.
