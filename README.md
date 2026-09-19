# SafeAR — AR-Powered Emergency Navigation & Evacuation System

SafeAR is a controlled-environment emergency navigation platform for campuses and buildings. It combines a React web experience, Node/Express business logic, MongoDB, Socket.IO, a Flask/scikit-learn route-risk service, and a Unity/ARCore integration layer.

> **Safety boundary:** this repository is a portfolio-grade prototype for configured environments. It is not a certified life-safety system. Indoor AR positioning depends on device support, environmental tracking and configured waypoints. ML estimates risk; the backend remains authoritative.

## Current runnable scope
- JWT + bcrypt authentication and USER/ADMIN authorization.
- MongoDB models for buildings, floors, waypoints, route edges, facilities, hazards and navigation sessions.
- Hazard-aware shortest/safest route selection.
- Allow-listed AI intent extraction with deterministic mock mode when OpenAI is unavailable.
- ML risk service with synthetic training data and deterministic Node fallback.
- Socket.IO hazard broadcasts and route invalidation events.
- Responsive SafeAR web UI with loading/error states and a premium restrained visual system.
- Unity networking/AR support/fallback scripts ready to be wired into an AR Foundation scene.
- Development seed data.

## Run
### 1. Prerequisites
- Node.js 24 LTS (Node 24.21.0 is the current LTS release as of 2026-09-11).
- Python 3.12+
- Docker Desktop (recommended for MongoDB + ML) or a local MongoDB instance.
- Unity 6.3 LTS for the AR client.

### 2. Start infrastructure
`docker compose up -d mongodb ml`

### 3. Backend
`cd server`
`npm install`
`copy .env.example .env` (Windows) or `cp .env.example .env`
`npm run seed`
`npm run dev`

API: http://localhost:5000
Health: http://localhost:5000/api/health

Demo credentials:
- Admin: `admin@safear.local` / `Admin@12345`
- User: `user@safear.local` / `User@12345`

### 4. Frontend
`cd client`
`npm install`
`npm run dev`

Open the Vite URL, normally http://localhost:5173.

### 5. ML
The Docker service starts the Flask app on port 8000. Without Docker:
`cd ml-service`
`python -m venv .venv`
`pip install -r requirements.txt`
`python -m app.app`

### 6. Unity
Open `unity-app` in Unity 6.3 LTS. Add AR Foundation and Google ARCore XR Plug-in through Package Manager. Create an AR Session and AR Camera, then wire `ApiClient`, `ARSupportController`, `RouteRenderer` and `NavigationFallbackUI` into your scene. Set the API base URL to the machine reachable from the Android device (for an Android emulator, `10.0.2.2`; for a physical device, use the host LAN IP).

## API
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/buildings`
- `GET /api/locations`
- `GET /api/emergency-facilities`
- `GET /api/hazards`
- `POST /api/hazards` (ADMIN)
- `PATCH /api/hazards/:id` (ADMIN)
- `DELETE /api/hazards/:id` (ADMIN)
- `POST /api/routes/calculate`
- `POST /api/voice/intent`
- `POST /api/navigation/start`
- `GET /api/health`

## End-to-end demo
1. Log in as admin.
2. Create or activate a hazard on a configured corridor using the API.
3. Socket.IO emits `HAZARD_CREATED` / `HAZARD_UPDATED` and route invalidation events.
4. Log in as user.
5. Request an emergency exit.
6. Node validates the intent and computes a route against active hazards.
7. Flask estimates route risk; if unavailable, Node uses deterministic fallback risk.
8. Unity consumes the route and can render waypoint arrows. If AR is unsupported, the fallback UI is used.

## Limitations
- OpenAI/Vapi/Google Maps provider adapters are isolated behind controlled interfaces; local development works without their keys.
- The included voice implementation is a deterministic mock when no OpenAI key is configured; it must not be presented as a live Vapi connection.
- Outdoor Google Maps integration is intentionally not required for the controlled campus MVP.
- Indoor route quality depends entirely on configured building graph data.
- ARCore does not magically infer a building map; spatial alignment must be configured/tested for the target building.
- ML is a risk estimator, not a physical safety guarantee.
