# shipit-board — Mission Control

The shared CI/CD orbit for the Ship It bootcamp prop: a Node process that ingests
pipeline events over HTTP and streams a live roster to a Three.js spectator over
WebSocket. Dual-role — the instructor runs the shared instance; each learner builds
and deploys their own copy to their EC2 in the S4 capstone.

## Run (local)

```bash
npm install
npm run dev        # builds the client, then serves it + the ws hub on :3000
# open http://localhost:3000
```

`npm run dev` runs in **open mode** (no `SHIPIT_TOKEN`) and prints a warning — any
POST is accepted, so you can drive it with curl:

```bash
curl -XPOST localhost:3000/api/event -H 'content-type: application/json' \
  -d '{"callsign":"octocat","stage":"liftoff","status":"shipped","color":"#22d3ee","siteUrl":"https://example.com"}'
```

## Auth

Set `SHIPIT_TOKEN` to enforce Bearer auth on `POST /api/event`:

```bash
SHIPIT_TOKEN=sooper-secret npm start
curl -XPOST localhost:3000/api/event -H 'authorization: Bearer sooper-secret' \
  -H 'content-type: application/json' -d '{"callsign":"octocat","stage":"pad","status":"running","color":"#22d3ee"}'
```

## Event contract

`POST /api/event` — `{ callsign, stage, status, color, version?, siteUrl? }`
· `stage ∈ {pad,build,test,clearance,liftoff}` · `status ∈ {running,passed,failed,aborted,shipped}`.

## Test

```bash
npm test           # node --test: room, server (the loop), placement, fallback
```

## Docker

```bash
docker build -t shipit-board .
docker run -p 3000:3000 -e SHIPIT_TOKEN=sooper-secret shipit-board
```

## Env

- `PORT` (default `3000`)
- `SHIPIT_TOKEN` (unset ⇒ open/dev mode)
