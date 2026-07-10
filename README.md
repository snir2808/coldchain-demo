# coldchain-demo

A small, end-to-end cold-chain monitoring system, built as a hands-on
playground for working with [Claude Code](https://claude.com/claude-code).
It models the kind of stack a real IoT team runs: firmware that decodes
sensor payloads, a service that ingests readings and raises alerts, a
dashboard, and some tooling around it.

It is intentionally realistic and intentionally imperfect. Breaking it,
refactoring it, and letting an agent loose on it is the whole point.

## The flow

A tracking device on a refrigerated container transmits a fixed-length
binary payload. It travels through the system like this:

```
device ──hex payload──▶ POST /ingest ──▶ decoder ──▶ store ──▶ alerts ──▶ notify
 (firmware/parser.c)      (service, Node + TypeScript)                    (email/SMS)
                                    │
                                    ▼
                            dashboard (React)
```

## Components

| Directory | What it is |
|---|---|
| `firmware/` | C code that runs on the tracking device: payload parsing and a test harness. `make parser && ./firmware/test_parser` |
| `service/` | Node + TypeScript service: ingest, excursion detection, alerts. No server framework, just `node:http` and `node:test`. |
| `dashboard/` | React + Vite dashboard showing containers and alerts (Hebrew RTL UI). |
| `scripts/` | Python: a device simulator and a daily report generator. |
| `data/` | Sample raw transmissions. |

## Run it

```bash
npm install                 # once, from the repo root (workspaces: service, dashboard)

npm run dev                 # the service on port 3000
python3 scripts/simulate.py # in another terminal: stream sample readings
npm test                    # service tests
make parser && ./firmware/test_parser   # compile and test the device code
npm run dev -w dashboard    # dashboard on port 5173 (needs the service running)
```

## API

| Endpoint | Description |
|---|---|
| `POST /ingest` | Ingest a transmission: `{"payload": "<hex>"}` |
| `GET /containers` | State of all containers |
| `GET /alerts` | Alert log |
| `GET /health` | Liveness check |

## What ships for Claude Code

The interesting part lives under `.claude/`:

- **`agents/c-reviewer.md`** and **`agents/test-writer.md`**: two focused
  subagents. The C reviewer has read-only tools, so it can flag issues but
  physically cannot edit your code.
- **`skills/sensor-protocol/`**: a knowledge pack describing the binary
  wire format. Claude loads it on demand when a task touches raw sensor data.
- **`hooks/check-secrets.sh`**: a `PreToolUse` gate that blocks any commit
  introducing a secret-looking value. It scans everything that could land in
  the commit, not just the staging area, so it is not fooled by how the
  commit is phrased.
- **`settings.json`**: denies reads of `.env*`, `secrets/**`, and `*.pem`,
  and wires up the secrets gate.

## Try it with Claude Code

A few starting points, roughly in order of the talk:

1. **Let it map the repo.** Ask Claude to explore the code and explain how a
   temperature reading flows from device to alert, without changing anything.
   Then have it draft a `CLAUDE.md` for the repo. (This repo ships without
   one on purpose, generating it is the first exercise.)
2. **Plan before touching.** In Plan Mode, ask for an escalation rule
   (email, then SMS if an excursion persists) and review the plan before it
   writes a line.
3. **Run the subagents.** Point `c-reviewer` and `test-writer` at the
   firmware in parallel and read what comes back.
4. **Watch the gate.** Try to commit a config file with a hardcoded key and
   see the secrets gate stop it.
5. **Decode a payload.** Hand Claude a raw hex transmission and let the
   `sensor-protocol` skill do the rest.

## License

MIT, see [LICENSE](LICENSE). Built for a Claude Code talk at ArrowSpot.
Use it, break it, learn from it.
