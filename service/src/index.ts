import http from 'node:http';
import { raiseAlerts } from './alerts.js';
import { decodePayload } from './decoder.js';
import { ConsoleNotifier } from './notify.js';
import { Store } from './store.js';
import { startSweep } from './sweep.js';

const PORT = Number(process.env.PORT ?? 3000);

const store = new Store();
const notify = new ConsoleNotifier();

function json(res: http.ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function readBody(req: http.IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString('utf8');
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);

  if (req.method === 'POST' && url.pathname === '/ingest') {
    try {
      const body = JSON.parse(await readBody(req));
      const reading = decodePayload(String(body.payload ?? ''));
      const profile = store.getProfile(reading.deviceId);
      if (!profile) {
        json(res, 404, { error: `unknown device ${reading.deviceId}` });
        return;
      }
      store.addReading(reading);
      const alerts = raiseAlerts(store, notify, profile, reading);
      json(res, 200, { ok: true, reading, alerts: alerts.length });
    } catch (err) {
      json(res, 400, { error: (err as Error).message });
    }
    return;
  }

  if (req.method === 'GET' && url.pathname === '/containers') {
    json(res, 200, store.listContainers().map((profile) => ({
      ...profile,
      latest: store.latestReading(profile.deviceId) ?? null,
    })));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/alerts') {
    json(res, 200, store.listAlerts());
    return;
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    json(res, 200, { ok: true });
    return;
  }

  json(res, 404, { error: 'not found' });
});

server.listen(PORT, () => {
  console.log(`coldchain service listening on :${PORT}`);
});

startSweep(store, notify);
