# coldchain-demo

A sample cold-chain monitoring system: ingesting binary transmissions
from tracking devices, decoding them, detecting temperature excursions
and raising alerts.

This repo was built as a practice environment for working with
Claude Code. Breaking it is allowed.

## Components

| Directory | Contents |
|---|---|
| `firmware/` | C code that runs on the tracking device: payload parsing and its tests |
| `service/` | Node + TypeScript service: ingest, excursion detection, alerts |
| `dashboard/` | React dashboard showing containers and alerts |
| `scripts/` | Python scripts: device simulator and daily report |
| `data/` | Sample data: raw transmissions |

## Running

```bash
# install dependencies (once)
npm install

# the service (port 3000)
npm run dev

# in another terminal: stream sample data from the device simulator
python3 scripts/simulate.py

# service tests
npm test

# compile and run the device-code tests
make parser
./firmware/test_parser

# dashboard (port 5173, requires the service running)
npm run dev -w dashboard
```

## API

| Endpoint | Description |
|---|---|
| `POST /ingest` | Ingest a transmission: `{"payload": "<hex>"}` |
| `GET /containers` | State of all containers |
| `GET /alerts` | Alert log |
| `GET /health` | Liveness check |

## Transmission protocol

Each transmission is a 24-byte message. The full spec lives in
`.claude/skills/sensor-protocol/payload-spec.md`.
