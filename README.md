# Department of Mischief 🫏

> A Pakistani-desi psychological prank site disguised as a "completely normal website," powered by a synthesized Web Audio sound engine, reactive minigames, and a zero-PII Django analytics pipeline.

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Tone.js](https://img.shields.io/badge/Audio-Tone.js%20Synthesizer-orange)](https://tonejs.github.io/)
[![Django](https://img.shields.io/badge/Backend-Django%205%20%2B%20DRF-092e20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20SQLite-4169e1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🎭 What is this?

The **Department of Mischief** is an interactive, multi-stage comedic web experience. It lures the user in under the guise of an administrative portal, subjects them to a series of escalating gags (diagnostic scans, programming skill tests, wrestling match interruptions, bureaucratic investigations, and psychological gaslighting), and logs every click, answer, and rage-burst anonymously to a real-time analytics backend.

At the end of the gauntlet, users are presented with a detailed report card, a shareable summary of their poor choices, and access to a simulated **Chaos Control Center** terminal.

---

## 🏛️ Architecture Overview

```
                           ┌────────────────────────────────────────────────────────┐
                           │                   CLIENT (BROWSER)                     │
                           │                                                        │
                           │  ┌──────────────────────────────────────────────────┐  │
                           │  │         ChaosControlCenter.jsx (React 18)        │  │
                           │  │  • 11 Stage State Machine (STAGES)               │  │
                           │  │  • Tone.js Procedural Synthesizer Engine         │  │
                           │  │  • Rage-Click & Mouse Tracking Commentator       │  │
                           │  │  • SafeImage Fallback System (Donkey Resiliency) │  │
                           │  │  • Achievement & Badge Engine                    │  │
                           │  └──────────────────────────────────────────────────┘  │
                           │                           │                            │
                           │                api.js (Fail-Silent fetch)              │
                           │              [UUID stored in localStorage]             │
                           └───────────────────────────┬────────────────────────────┘
                                                       │
                                            HTTP / JSON (REST API)
                                                       │
                           ┌───────────────────────────▼────────────────────────────┐
                           │               BACKEND (Django 5 + DRF)                 │
                           │                                                        │
                           │  ┌───────────────────────┐  ┌───────────────────────┐  │
                           │  │     API Endpoints     │  │      Data Models      │  │
                           │  │ • /api/session/start/ │  │ • Visitor (UUID)      │  │
                           │  │ • /api/events/        │  │ • Session (Device)    │  │
                           │  │ • /api/dashboard/     │  │ • Event (JSON Logs)   │  │
                           │  └───────────────────────┘  └───────────────────────┘  │
                           │                           │                            │
                           │               PostgreSQL (Prod) / SQLite (Dev)         │
                           └────────────────────────────────────────────────────────┘
```

---

## 🎬 The Prank Gauntlet (Stage Breakdown)

The interactive experience runs on a state machine (`STAGES`) inside [ChaosControlCenter.jsx](file:///frontend/src/components/ChaosControlCenter.jsx):

| # | Stage Key | Title / Theme | Interactive Mechanics & Gags |
|---|---|---|---|
| **1** | `welcome` | **The Deceptive Welcome** | Displays Case Number & randomized status. The *"I understand"* button physically dodges mouse hover/touch twice before giving up, accompanied by live cricket commentary. Includes an interactive procedural music selector. |
| **2** | `diagnostics` | **`user_scan.exe`** | Simulates an animated diagnostic scan evaluating *Common Sense* (27%), *Confidence* (94%), *Patience* (11%), *Curiosity* (99%), and *Impulse Control* (3%). Concludes with **"USER IS COOKED"** and triggers the first **Donkey Herd popup** (*"WE ARE WATCHING YOU"*). |
| **3** | `codingTest` | **Skill Verification & GitHub Roast** | Presents a classic C++ trick question (`int x = 10; cout << x++;`). Regardless of answer, analyzes user confidence and scans their hypothetical GitHub repository, discovering *47 bugs*, *12 unfinished projects*, *0 documentation*, and `"final_final_REAL.cpp"`. |
| **4** | `wwe` | **Live Wrestling Interruption** | Screen shakes violently accompanied by an entrance fanfare or custom audio. Features full health bars (*YOU* vs *THE WEBSITE*), a live commentator that reacts to mouse hesitation, and three futile choices (🥊 *Fight* [-25 IQ], 🏃 *Run* [escape.exe failed], 📞 *Call someone smarter* [0 contacts]). Followed by the **Lipstick Donkey** update popup. |
| **5** | `colorTest` | **Choose Your Destiny & Investigation** | Prompts user to choose between ⬛ *BLACK*, ⬜ *WHITE*, or 🌈 *MULTICOLOR*. <br>• **Black:** Triggers a 47-page *Federal Curiosity Investigation Unit* inquiry (Appeal rejected).<br>• **White:** Enrolls user in a support group for beige personalities.<br>• **Multicolor:** Triggers `Personality.exe` Error 404 (Too many vibes).<br>Displays **Heart Donkey** popup and checks for badge unlocks. |
| **6** | `gaslight` | **The Subtle Reality Shift** | The site quietly begins questioning the user's memory. Behind the scenes, the persistent global top marquee is silently rewritten from `★ WELCOME ★` to `★ WELCOME BACK ★`. |
| **7** | `finalAnalysis` | **Final User Assessment** | Secondary stat breakdown revealing *Rage* (100%), *Curiosity* (100%), *Common Sense* (19%), and *Ability to Leave* (0%). Reminds the user they should have closed the tab 2 minutes ago. |
| **8** | `finalDonkey` | **The All-Seeing Donkey** | High-resolution portrait of Donkey #3. Image renders first, followed by a dramatic pause: *"He knows. We all know."* |
| **9** | `finalBoss` | **Phase 2 Rematch & Segfault** | DING DING DING bell rings with screen tremor. The Website initiates its finishing move; clicking *"FINISH HIM"* triggers `💀 SEGMENTATION FAULT: Your dignity has been accessed illegally` and awards the *Went the Distance* achievement. |
| **10** | `finalReport` | **Performance Report Card** | Complete performance transcript (Intelligence 31%, Programming 42%, Rage 100%, Donkey approval: ❌). Clicking *"Close website"* yields an **ERROR 403: Permission Denied** (*"You came back voluntarily"*). |
| **11** | `ending` | **The Eternal Loop & Chaos Center** | Real-time elapsed timer displaying wasted seconds. Allows replaying (*"Yes"* / *"Obviously"*), generating a personalized clipboard share summary, and opening the **Chaos Control Center** terminal dashboard. |

---

## 🎵 Procedural Tone.js Sound Engine

The audio system synthesizes dynamic soundtracks and sound effects entirely in the browser using [Tone.js](https://tonejs.github.io/)—requiring zero external audio files.

### Synthesizer Units
- **`pad`** (`Tone.PolySynth`): Atmospheric background pads and orchestral chords (Volume: `-8dB`).
- **`pluck`** (`Tone.PluckSynth`): Rapid string stabs and rising melodic tension (Volume: `-6dB`).
- **`blip`** (`Tone.Synth`): High-frequency UI feedback and click ticks (Volume: `-10dB`).
- **`bass`** (`Tone.MembraneSynth`): Deep sub-bass drops for critical hits and entrance fanfares (Volume: `-4dB`).

### Soundtracks & Sound Effects
- **8 Selectable Themes:**
  - 🎻 `drama` — Overdramatic orchestral minor chords (`C3-Eb3-G3` → `Bb2-D3-F3`).
  - 🎉 `shaadi` — Upbeat ceremonial pentatonic entrance fanfare.
  - 🚨 `fia` — Dissonant tritone siren sequence (`C3` + `F#3`).
  - 😔 `existential` — Minimalist low-register `A2` sustained drone.
  - 🕺 `dj` — Arpeggiated upbeat electronic club synth.
  - ☕ `chai` — Warm minor jazz chords.
  - 📚 `exam` — Fast 16th-note staccato panic pulses.
  - 👻 `blackout` — Descending chord that dynamically ramps destination master volume to `-40dB` (*"bijli chali gayi"*).
- **Dynamic SFX & Fallbacks:**
  - `playClick`: Micro 32nd-note `C5` blip on interactive buttons.
  - `playBell`: Triple `A5` boxing bell rings on WWE transitions.
  - `playFanfare`: Rising 4-note pluck arpeggio into sub-bass drop and pad chord landing.
  - **Custom Entrance Support:** Checks for optional `/audio/entrance.mp3` in `frontend/public/` and automatically falls back to synthesized bell + fanfare if absent.

---

## 🛡️ Resilient Asset System (`SafeImage` & Donkeys)

All images—including the wrestling ring and donkey surveillance photos (`lipstick-donkey.jpeg`, `donkey-community.jpeg`, `donkey-1.jpg`, `donkey-3.jpg`)—are wrapped in the custom `<SafeImage />` component.

```jsx
// Guaranteed fallback: If an image fails or 404s, renders a styled paper emoji container
<SafeImage 
  src="/donkeys/donkey-community.jpeg" 
  fallbackEmoji="🫏" 
  fallbackSize={96} 
/>
```

- **Zero-Breakage Guarantee:** If an image is blocked or missing, the site gracefully degrades to an emoji placeholder with matched paper background colors.
- **Surveillance Tracker:** The app tracks viewed donkeys across stages (`herd` → `lipstick` → `heart`) to award the secret `under_surveillance` achievement.

---

## ⚡ Rage-Click Engine & Achievement System

### Rage-Click Detection
- Listens to global click timestamps (`clickTimesRef`).
- **Threshold:** 4+ clicks anywhere on the viewport within `1.2 seconds` constitutes a "rage burst."
- **Behavior:** Fires urgent live cricket commentary (e.g., *"OUT! Given for excessive appeal to the umpire"*), logs a `rage_click` event with burst size to the API, and increments progress toward badges.

### Badges & Achievements
| Badge | Emoji | Title | Unlock Condition |
|---|:---:|---|---|
| `duck` | 🏏 | **Out for a Duck** | Triggered 1st rage-click burst |
| `rage_legend` | ⚡ | **Certified Rage Legend** | Triggered 3+ rage-click bursts |
| `chaos_regular` | 🔥 | **Chaos Regular** | Completed 3+ replays in a single session |
| `case_closed` | 📁 | **Case Closed** | Reached the final ending stage |
| `went_the_distance` | 🥊 | **Went the Distance** | Survived the Phase 2 WWE finisher |
| `under_surveillance` | 🫏 | **Under Surveillance** | Encountered all three donkey surveillance popups |

---

## 📊 Privacy-First Analytics Pipeline

The analytics system is designed with **zero PII collection**—no names, emails, passwords, cookies, or IP addresses are stored.

```
Client (localStorage UUID) ──► POST /api/session/start/ ──► Visitor + Session
                           ──► POST /api/events/        ──► Event (Append-Only)
                           ──► GET  /api/dashboard/    ──► Aggregated Summary
```

### Data Schema (`backend/chaos/models.py`)
- **`Visitor`**: Identified solely by a random client-generated UUID stored in `localStorage` (`dom_visitor_id`). Tracks `visit_count` and `first_seen`.
- **`Session`**: Tracks session duration (`started_at`, `ended_at`) and coarse device category (`mobile` vs `desktop`).
- **`Event`**: High-performance append-only interaction stream indexing `event_type`, `experience_key`, `music_choice`, and arbitrary JSON `metadata` (e.g., badge IDs, burst counts, quiz answers).

### API Endpoints
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/session/start/` | Creates or resumes an anonymous visitor and registers a new session. |
| `POST` | `/api/events/` | Logs an interaction event (fails silently if offline). |
| `GET` | `/api/dashboard/summary/` | Aggregated site statistics (visitors, color choices, music popularity). |
| `—` | `/admin/` | Django Admin portal for raw inspection. |

---

## 📁 Repository Structure

```
mischief-project/
├── frontend/                     # React + Vite + Tailwind Frontend
│   ├── public/
│   │   ├── donkeys/              # Donkey surveillance photos (lipstick, community, 1, 3)
│   │   └── wrestling/            # Ring banner assets
│   ├── src/
│   │   ├── components/
│   │   │   └── ChaosControlCenter.jsx  # Main state machine, Tone.js engine & UI
│   │   ├── api.js                # Fail-silent analytics client
│   │   ├── App.jsx, main.jsx     # Application entrypoints
│   │   └── index.css             # Base styles & typography
│   ├── package.json
│   └── vite.config.js
├── backend/                      # Django + DRF Analytics Service
│   ├── mischief/                 # Project settings, wsgi, urls
│   ├── chaos/                    # Analytics app
│   │   ├── models.py             # Visitor, Session, Event models
│   │   ├── views.py              # session_start, log_event, dashboard_summary
│   │   ├── serializers.py        # DRF serializers
│   │   └── admin.py              # Django admin registrations
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml            # Local PostgreSQL + Backend orchestration
├── netlify.toml                  # Single-step Netlify build configuration
└── README.md
```

---

## 🚀 Quick Start Guide

### Option 1: Local Development (Zero Docker, SQLite)

#### 1. Backend
```bash
cd backend
python3 -m venv .venv

# Activate virtualenv (Linux/macOS)
source .venv/bin/activate
# Windows PowerShell:
# .venv\Scripts\Activate.ps1

pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser  # Optional, for /admin/
python manage.py runserver
```
*API runs at `http://localhost:8000/api/` on SQLite.*

#### 2. Frontend (in a separate terminal)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
*Open `http://localhost:5173`. If the backend is not running, the site still works normally with analytics failing silently.*

---

### Option 2: Docker Compose (PostgreSQL Included)

```bash
docker compose up --build
```
Runs Django on Gunicorn connected to a PostgreSQL database with automatic migrations on `http://localhost:8000`.

---

## 🌐 Deployment

### Frontend on Netlify
The repository includes a root `netlify.toml` configured for automatic builds:
```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"
```
1. Connect repository in Netlify.
2. Under **Site Settings > Environment Variables**, set:
   - `VITE_API_BASE` = `https://your-backend-service.onrender.com`
3. Deploy site.

### Backend Hosting (Render / Railway / Fly.io / Cloud Run)
1. Deploy `backend/` using the included [Dockerfile](file:///backend/Dockerfile).
2. Configure production environment variables:
   - `DJANGO_SECRET_KEY`: Long, random secret string.
   - `DJANGO_DEBUG`: `False`
   - `DJANGO_ALLOWED_HOSTS`: Your backend domain (e.g. `your-api.onrender.com`).
   - `CORS_ALLOWED_ORIGINS`: Your Netlify URL (e.g. `https://your-site.netlify.app`).
   - `DATABASE_URL` or `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`.
