#!/usr/bin/env python3
"""Device simulator: builds ArrowTrack payloads and feeds them to the service.

Usage:
    python3 scripts/simulate.py            # post a demo scenario to the service
    python3 scripts/simulate.py --dry      # print payload hex lines instead
    python3 scripts/simulate.py --url http://localhost:3000
"""
import argparse
import json
import sys
import time
import urllib.request

FLAG_MOTION = 0x01
FLAG_DOOR_OPEN = 0x02
FLAG_BATTERY_OK = 0x10


def crc8(data: bytes) -> int:
    crc = 0x00
    for byte in data:
        crc ^= byte
        for _ in range(8):
            crc = ((crc << 1) ^ 0x07) & 0xFF if crc & 0x80 else (crc << 1) & 0xFF
    return crc


def build_payload(device_id: int, temp_c: int, flags: int, battery_adc: int, seq: int) -> bytes:
    body = bytearray(23)
    body[0:4] = device_id.to_bytes(4, "big")
    body[4:5] = temp_c.to_bytes(1, "big", signed=True)
    body[5] = flags
    body[6:8] = battery_adc.to_bytes(2, "little")
    body[8:12] = seq.to_bytes(4, "little")
    return bytes(body) + bytes([crc8(bytes(body))])


def scenario():
    """Yields (description, payload) pairs for a short demo run."""
    freezer = 0xA107C344
    dairy = 0xB211095C
    produce = 0xC33A2101
    seq = 1000

    for temp in (-19, -18, -18):
        yield "freezer steady", build_payload(freezer, temp, FLAG_BATTERY_OK, 908, seq)
        seq += 1

    yield "freezer door opens", build_payload(
        freezer, -18, FLAG_DOOR_OPEN | FLAG_BATTERY_OK, 908, seq
    )
    seq += 1

    for temp in (4, 5, 4):
        yield "dairy steady", build_payload(dairy, temp, FLAG_BATTERY_OK, 800, seq)
        seq += 1

    for temp in (9, 11, 12):
        yield "dairy drifting out of range", build_payload(
            dairy, temp, FLAG_MOTION | FLAG_BATTERY_OK, 800, seq
        )
        seq += 1

    yield "produce steady", build_payload(produce, 3, FLAG_BATTERY_OK, 850, seq)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://localhost:3000")
    parser.add_argument("--dry", action="store_true", help="print hex lines, do not post")
    parser.add_argument("--delay", type=float, default=0.5)
    args = parser.parse_args()

    for description, payload in scenario():
        hex_line = payload.hex().upper()
        if args.dry:
            print(hex_line)
            continue
        request = urllib.request.Request(
            f"{args.url}/ingest",
            data=json.dumps({"payload": hex_line}).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=5) as response:
                result = json.loads(response.read())
                alerts = result.get("alerts", 0)
                print(f"{description}: sent, alerts raised: {alerts}")
        except OSError as err:
            print(f"failed to reach service at {args.url}: {err}", file=sys.stderr)
            return 1
        time.sleep(args.delay)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
