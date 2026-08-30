# Department of Mischief

A "you shouldn't have clicked this" prank site with a real, working analytics
pipeline underneath it. The bit is a Pakistani-desi-internet-chaos experience
(Ammi mode, chai interrogation, WiFi simulator, FIA investigation, WhatsApp
chat gag, and more); underneath, every screen view and choice is logged
anonymously to a Django backend so you get a genuinely real "Chaos Control
Center" dashboard.

## Folder structure

```
mischief-project/
├── frontend/            Vite + React + Tailwind app (the actual site)
│   ├── src/
│   │   ├── components/ChaosControlCenter.jsx   the whole experience
│   │   ├── api.js                              analytics helper
│   │   ├── App.jsx, main.jsx, index.css
│   └── package.json
├── backend/              Django + DRF app (the analytics API)
│   ├── mischief/          project settings/urls
│   ├── chaos/             app: models, views, serializers, admin
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml     Postgres + backend, for local parity with prod
└── .gitignore
```

## Quick start (no Docker)

**Backend**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser  # optional, for /admin/
python manage.py runserver
```

This runs on SQLite by default — zero extra setup. The API is now live at
`http://localhost:8000/api/`.

**Frontend** (separate terminal)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`). The site works
even if the backend isn't running — analytics calls fail silently — but
start the backend too if you want the Chaos Control Center dashboard to show
real numbers.

## Quick start (Docker, Postgres included)

```bash
docker compose up --build
```

This builds the backend image, boots Postgres, runs migrations
automatically, and serves the API on `http://localhost:8000`. Run the
frontend separately with `npm run dev` as above (`VITE_API_BASE` already
defaults to `http://localhost:8000`).

## API endpoints

| Method | Path                       | What it does                                  |
|--------|----------------------------|------------------------------------------------|
| POST   | `/api/session/start/`      | Creates/resumes an anonymous visitor + session |
| POST   | `/api/events/`             | Logs one anonymous event                       |
| GET    | `/api/dashboard/summary/`  | Aggregated stats (visitors, top music, etc.)   |
| —      | `/admin/`                  | Django admin, browse raw data                  |

No accounts, no emails, no names — visitors are identified only by a random
UUID stored in the browser's `localStorage`. See `backend/chaos/models.py`
for the full schema (`Visitor`, `Session`, `Event`).

## Deploying

### Frontend on Netlify

The root `netlify.toml` is what makes this work — without it, Netlify has no
way to know the actual app lives in `frontend/`, and it'll publish the raw
repository instead of a build (this is exactly what happened before this
file existed: `/index.html` 404'd while `/frontend/src/main.jsx` was
served as a plain text file).

```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"
```

With this in place, connect the repo in Netlify as normal — no extra
per-site configuration needed, it reads `netlify.toml` from the repo root
automatically. Verified locally: `npm install && npm run build` inside
`frontend/` produces `dist/index.html` at the root with every image asset
(`donkeys/`, `wrestling/`) carried through correctly.

**The backend won't work yet after this fix, and that's expected.** Netlify
only hosts the static frontend — it doesn't run a Django + Postgres app.
`VITE_API_BASE` defaults to `http://localhost:8000`, which doesn't exist in
production, so session tracking, event logging, and the dashboard will
silently no-op (by design — the prank itself still works perfectly, you
just won't get real analytics). To fix that:

1. Deploy `backend/` somewhere that runs a real Python process — Render,
   Railway, and Fly.io all support deploying straight from the included
   `backend/Dockerfile` with a couple clicks and a free tier; the AWS
   ECS/Cloud Run path from the section below works too.
2. In Netlify's site settings, add an environment variable
   `VITE_API_BASE` pointing at that backend's public HTTPS URL, and add
   Netlify's own site URL to `CORS_ALLOWED_ORIGINS` on the backend.
3. Redeploy the frontend so the new env var gets baked into the build.

Migrating the backend itself to Netlify Functions/Netlify DB is possible
but means rewriting the Django views as serverless functions and swapping
the ORM — a much bigger job than this project needs. Hosting Django
somewhere that just runs Django is the path of least resistance.

### Everything else

- **Frontend (non-Netlify)**: `npm run build` in `frontend/`, then serve
  the `dist/` folder from S3 + CloudFront, or Cloud Storage + Cloud CDN /
  Firebase Hosting.
- **Backend**: the included `Dockerfile` runs on Gunicorn — deploy it to
  ECS Fargate or Cloud Run. Point `POSTGRES_*` env vars at RDS or Cloud SQL
  instead of the local Postgres container.
- Set real values for `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, and
  `CORS_ALLOWED_ORIGINS` before this goes anywhere public — the `.env.example`
  files list every variable you need.
- Lock down `/api/dashboard/summary/` with auth (it's wide open right now,
  which is fine for local dev only).

## Extending the bit

The whole "story" lives in `frontend/src/components/ChaosControlCenter.jsx`
as a `STAGES` array — add a new stage name to the array and a matching
render branch to add another scene. Music styles are plain note sequences
in `STYLE_NOTES`, synthesized with Tone.js, so adding a new "soundtrack" is
just a new array of notes — no audio files needed.

### The second half of the experience

After the desi-chaos arc (`notice` through `difficulty`), the site tips
into a second saga: a fake `user_scan.exe` diagnostic, a coding "skill
verification" with a GitHub roast, a wrestling-style interruption (health
bars, a commentator that reacts to mouse movement, three possible outcomes),
a color-choice test, a "gaslight" beat where the top marquee quietly changes
behind the user's back, and a final report card before the real ending.

Three donkey photos escalate throughout (single donkey → the herd →
one more cameo during the color test), plus a final extreme close-up at
the very end. They live in `frontend/public/donkeys/` as:
`lipstick-donkey.jpeg`, `donkey-community.jpeg`, `donkey-1.jpeg`,
`donkey-3.jpeg`. If any of those files are ever missing, the site falls
back to a plain 🫏 emoji automatically — nothing breaks.

Two notes on what's deliberately *not* in here: the wrestling section uses
an original Tone.js fanfare instead of any real entrance music, and it
avoids naming any real wrestler or trademarked league — same reasoning as
the "FIA" bit staying obviously fictional. Swap `playFanfare` in the
component for your own Tone.js sequence if you want a different vibe.
