# WasteVision – AI for a Cleaner Future
### Smart Waste Collection, Garbage Reporting & Municipal Dispatch Platform

**WasteVision** is a full-stack, production-grade web application engineered to modernize municipal solid waste management. It connects citizens reporting localized waste issues with dispatch officers and collection teams through an **explainable AI-assisted priority scoring system**, interactive GIS map visualization, and real-time operational status tracking.

---

## 1. System Highlights

- **Explainable AI Priority Engine**: A weighted rule-based algorithmic scoring model (0–100) that evaluates reported severity, hazardous toxicity, public safety keywords (overflow, blockages, odor), school/hospital proximity, and waiting time. Every report provides a human-auditable breakdown of why it was assigned Low, Medium, High, or Critical priority.
- **Interactive GIS Collection Map**: OpenStreetMap Leaflet integration with color-coded custom markers, pin popups, coordinate inspection, and filterable spatial clustering.
- **Live Civic Reporting**: Responsive reporting form supporting category selection (Wet, Dry, Plastic, E-waste, Hazardous, Other), photo uploads with local storage, GPS auto-detection, and live score previews.
- **Operations & Dispatch Center**: Municipal workflow controls to filter, search, assign collection drivers, update ETAs, add internal notes, and log an immutable status audit timeline.
- **Real-Time Analytical Dashboard**: Recharts-powered telemetry tracking database reports by category, collection status, resolution rate, and priority breakdown.
- **Zero Cloud / External API Dependencies**: Built entirely with local SQLite, native FastAPI, and React/Tailwind. No paid keys or external AI service accounts required.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS 3, Lucide React, Recharts, React-Leaflet & Leaflet |
| **Backend** | Python 3.10–3.12, FastAPI, Uvicorn, SQLAlchemy, Pydantic v2 |
| **Database** | SQLite (`backend/wastevision.db`) |
| **Storage** | Local backend static file storage (`backend/uploads/`) |
| **Mapping** | Leaflet + OpenStreetMap Tile Layer |

---

## 3. Project Directory Structure

```
smart_waste_management/
├── README.md                           # Documentation & execution instructions
├── .gitignore                          # Git ignore configuration
├── backend/
│   ├── requirements.txt                # Python backend dependencies
│   ├── test_api.py                     # Automated 10-suite API verification script
│   ├── wastevision.db                  # Local SQLite database (auto-created)
│   ├── uploads/                        # Uploaded images & demo category SVGs
│   │   ├── demo-hazardous.svg
│   │   ├── demo-plastic.svg
│   │   ├── demo-ewaste.svg
│   │   ├── demo-wet.svg
│   │   ├── demo-dry.svg
│   │   └── demo-other.svg
│   └── app/
│       ├── __init__.py
│       ├── database.py                 # SQLAlchemy SQLite engine & session
│       ├── models.py                   # WasteReport & StatusTimelineEvent tables
│       ├── schemas.py                  # Pydantic request/response validation schemas
│       ├── priority_engine.py          # Explainable AI rule-based scoring engine
│       ├── seed.py                     # 9 realistic initial sample records
│       └── main.py                     # FastAPI application, CORS & REST routes
└── frontend/
    ├── package.json                    # Node dependencies & Vite scripts
    ├── vite.config.js                  # Vite configuration & backend proxy
    ├── tailwind.config.js              # Custom emerald & forest theme colors
    ├── postcss.config.js
    ├── index.html                      # HTML template with Leaflet & Inter font
    └── src/
        ├── main.jsx                    # React root entrypoint
        ├── App.jsx                     # Core application state & modal manager
        ├── index.css                   # Tailwind styles & custom scrollbars
        ├── api.js                      # Centralized API fetcher client
        ├── components/
        │   ├── Navbar.jsx              # Responsive header, admin toggle & demo reset
        │   ├── Badges.jsx              # Priority, Status & Category visual badges
        │   └── ReportDetailModal.jsx   # Full inspection, photo viewer & dispatch form
        └── pages/
            ├── LandingPage.jsx         # Public landing hero, live stats & category guide
            ├── DashboardPage.jsx       # KPI cards, Recharts visualizations & report table
            ├── ReportWastePage.jsx     # Citizen submission form with live AI preview
            ├── CollectionManagementPage.jsx # Operations dispatcher view with inline actions
            └── CollectionMapPage.jsx   # Leaflet OpenStreetMap with custom priority pins
```

---

## 4. Execution Instructions (macOS & VS Code)

Open the project folder `/Users/yashaswinis/Downloads/smart_waste_management` in **VS Code**.

### Step 1: Start the Backend (Terminal 1)

Open a new terminal in VS Code (`Ctrl + ~` or `Terminal -> New Terminal`):

```bash
cd /Users/yashaswinis/Downloads/smart_waste_management

# 1. Create Python virtual environment (Python 3.10, 3.11, or 3.12 recommended)
python3 -m venv backend/venv

# 2. Activate virtual environment
source backend/venv/bin/activate

# 3. Install backend dependencies
pip install -r backend/requirements.txt

# 4. Start the FastAPI server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

*The backend will automatically create tables and seed 9 realistic demo records on its first launch.*

- **Backend API URL**: `http://127.0.0.1:8000`
- **Interactive Swagger Documentation**: `http://127.0.0.1:8000/docs`

---

### Step 2: Start the Frontend (Terminal 2)

Open a second terminal split in VS Code:

```bash
cd /Users/yashaswinis/Downloads/smart_waste_management/frontend

# 1. Install frontend dependencies (if not already installed)
npm install

# 2. Launch Vite development server
npm run dev
```

- **Frontend Application URL**: `http://localhost:5173`

Open `http://localhost:5173` in any modern web browser (Google Chrome, Safari, Edge, Firefox).

---

### Step 3: Run the Automated Backend Test Suite

To verify all endpoints, database operations, and priority calculations in a single command:

```bash
cd /Users/yashaswinis/Downloads/smart_waste_management
backend/venv/bin/python3 backend/test_api.py
```

All 10 test suites will run and output verification results.

---

## 5. How the Explainable AI Priority Engine Works

Unlike opaque machine-learning black boxes, WasteVision utilizes a **transparent, rule-based algorithmic priority scoring engine** that is fully auditable. The score ranges from **0 to 100** and maps into four distinct action tiers:

- **Critical Priority (80–100 pts)**: Immediate dispatch required (hazmat, toxic leaks, blocked transit routes).
- **High Priority (55–79.9 pts)**: Urgent dispatch required within 12–24h (heavy overflow, market decay, e-waste).
- **Medium Priority (30–54.9 pts)**: Standard scheduled collection (full bins, commercial packaging).
- **Low Priority (0–29.9 pts)**: Non-urgent routine maintenance (isolated foliage, minor litter).

### Scoring Factors:

1. **Reported Severity**:
   - Critical: `+45 pts`
   - High: `+30 pts`
   - Medium: `+18 pts`
   - Low: `+8 pts`

2. **Waste Category Threat Weight**:
   - Hazardous: `+25 pts` (chemical, toxic, medical)
   - E-waste: `+15 pts` (batteries, heavy metals)
   - Wet Waste: `+12 pts` (rapid organic decomposition & pest breeding)
   - Plastic: `+8 pts` (storm-drain clogging & microplastic dispersal)
   - Dry / Other: `+5 pts` (inert recyclable material)

3. **Public Safety & Environmental Threat Keywords**:
   - **Overflow Indicator** (`+15 pts`): Matches `"overflow"`, `"spill"`, `"heaping"`, `"dumped"`, `"clogged"`.
   - **Sanitation & Biological Hazard** (`+12 pts`): Matches `"odor"`, `"smell"`, `"flies"`, `"rats"`, `"rotting"`, `"maggots"`.
   - **Physical Safety / Road Obstruction** (`+18 pts`): Matches `"block"`, `"road"`, `"traffic"`, `"drain"`, `"waterlogging"`, `"fire"`, `"chemical"`, `"sharp"`.
   - **Sensitive Zone Proximity** (`+12 pts`): Matches `"school"`, `"hospital"`, `"clinic"`, `"market"`, `"kindergarten"`, `"playground"`.

4. **Waiting Time / Aging SLA Escalation**:
   - `> 48 hours`: `+15 pts`
   - `> 24 hours`: `+10 pts`
   - `> 12 hours`: `+5 pts`

5. **Location Density & Clustering**:
   - If other unresolved open reports exist within `~500m` or share common street landmarks:
     - 1 existing report: `+8 pts`
     - 2+ reports: `+15 pts` (Chronic civic hotspot)

---

## 6. Demonstration Workflow & User Roles

### A. Citizen Experience:
1. Navigate to **Home** to view real city metrics.
2. Click **Report Waste** to file a complaint. Select category **Hazardous**, severity **Critical**, type *"Leaking chemical barrels near school gate blocking the road"*, upload a photo, and click **Use Current Location**.
3. Observe the **Live AI Priority Preview** react in real-time, calculating a score of 100/100 with a detailed reason breakdown.
4. Submit the report: Receive an official tracking ID (e.g. `WV-2026-XXXX`).

### B. Dispatcher / Admin Experience:
1. Open **Operations & Dispatch** or toggle **Admin Mode** in the navbar.
2. Filter by *Priority: Critical* or search by the newly created report ID.
3. Click **Inspect & Manage**:
   - Inspect the uploaded evidence photo and geolocation.
   - Change Status from `Pending` to `Assigned`.
   - Select a collector preset (e.g., `Ramesh Kumar (Hazmat Team)`).
   - Enter estimated collection time (`Today, 4:30 PM`).
   - Add internal notes and click **Save Operations Update**.
4. Check the **Status Timeline & Audit Trail** to observe each status update recorded with timestamps.
5. Open **Smart Dashboard** to watch the Live KPI counters and Recharts charts update automatically based on database changes.
6. Open **Collection Map** to inspect the geolocated pin with its custom priority marker on OpenStreetMap.
7. Click **Reset Demo** in the navbar at any time to return the database to the 9 default sample records.

---

## 7. API Reference Summary

- `GET /api/stats` – Aggregated KPI metrics, category & status distributions, and resolution rate.
- `GET /api/reports` – Query reports with status, category, priority, and text search filters.
- `POST /api/reports` – Create report with multipart image upload and automatic priority calculation.
- `GET /api/reports/{report_id}` – Retrieve full report data with audit event timeline.
- `PATCH /api/reports/{report_id}` – Update status, assign collector, edit notes, and log timeline.
- `POST /api/priority/calculate` – Calculate explainable AI priority preview on demand.
- `POST /api/demo/reset` – Reset SQLite database to the 9 default realistic demo records.

---

## 8. Deployment Guide (Railway + Vercel)

WasteVision is fully pre-configured for a split production deployment:
- **Backend**: Hosted on **Railway** (FastAPI + Uvicorn + SQLite / PostgreSQL)
- **Frontend**: Hosted on **Vercel** (React + Vite + Leaflet)

### Part 1: Deploy Backend to Railway

1. Push this repository to **GitHub**.
2. Go to [railway.app](https://railway.app/) and click **"New Project"** -> **"Deploy from GitHub repo"**.
3. Select your repository.
4. In Railway project settings:
   - If deploying from the repository root: Railway automatically detects the included `railway.json` and `Procfile`.
   - Alternatively, if setting a subdirectory: Set **Root Directory** to `backend`.
5. Under **Settings** -> **Networking**, click **"Generate Domain"** to get your public backend URL:
   `https://wastevision-production.up.railway.app`
6. Test your live backend health: Visit `https://your-domain.up.railway.app/health` in your browser.

### Part 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com/) and click **"Add New..."** -> **"Project"**.
2. Select your GitHub repository.
3. In the configuration dialog:
   - **Framework Preset**: Vite
   - **Root Directory**: Click edit and select `frontend` (or leave as root, as the included `vercel.json` supports both).
4. Expand **Environment Variables** and add:
   - **Name**: `VITE_API_URL`
   - **Value**: Your Railway backend domain (e.g., `https://wastevision-production.up.railway.app` without trailing slash).
5. Click **"Deploy"**.
6. Once deployed, open your Vercel URL (e.g., `https://wastevision.vercel.app`). Your live frontend will now communicate directly with your Railway backend with full CORS compatibility!

