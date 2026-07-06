#!/usr/bin/env python3
"""Daily summary: pulls container status and alerts from the service."""
import json
import sys
import urllib.request

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000"


def fetch(path: str):
    with urllib.request.urlopen(f"{BASE_URL}{path}", timeout=5) as response:
        return json.loads(response.read())


def main() -> int:
    try:
        containers = fetch("/containers")
        alerts = fetch("/alerts")
    except OSError as err:
        print(f"service not reachable at {BASE_URL}: {err}", file=sys.stderr)
        return 1

    print("=== coldchain daily report ===")
    for container in containers:
        latest = container.get("latest")
        if latest:
            status = f"{latest['tempC']}C (range {container['minC']}..{container['maxC']})"
        else:
            status = "no readings"
        print(f"{container['name']}: {status}")

    print(f"\nalerts today: {len(alerts)}")
    for alert in alerts:
        print(f"  [{alert['kind']}] {alert['message']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
