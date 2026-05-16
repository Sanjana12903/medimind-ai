# 🏥 MediMind AI — Medical Intelligence Platform

> Self-Evolving Multi-Agent Medical Inventory Decision Intelligence Platform  
> Stack: React + Vite + Tailwind CSS · FastAPI · SQLite + SQLAlchemy · LangChain + Groq (LLaMA 3 70B)

---

## 🗂️ Project Structure

```
medimind-ai/
├── backend/
│   ├── agents/               # 7 AI agents (LangChain + Groq)
│   │   ├── base_agent.py
│   │   ├── stock_monitor_agent.py
│   │   ├── specialized_agents.py   # Demand, Purchase, Expiry, Compliance
│   │   └── copilot_agent.py        # Chat + Council Orchestrator
│   ├── core/
│   │   ├── config.py         # Settings + Groq key rotation
│   │   └── auth.py           # JWT helpers
│   ├── models/               # SQLAlchemy models
│   ├── routes/               # FastAPI routers
│   ├── database.py           # DB setup
│   ├── main.py               # FastAPI app
│   ├── seed.py               # Demo data seeder
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/            # Login, Dashboard, Inventory, Alerts, Copilot, Agents
    │   ├── components/       # KpiCard, HealthGauge, Layout
    │   ├── api/              # Axios client + all API calls
    │   ├── store/            # Zustand (auth + theme)
    │   └── index.css         # Tailwind + CSS variables (dark/light)
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## ⚡ Quick Start — Step by Step

### Step 1 — Get a Free Groq API Key

1. Go to **https://console.groq.com**
2. Sign up (free) → Create API Key
3. Copy it — looks like `gsk_xxxxxxxxxxxxxxxx`
4. (Optional) Create 2-3 keys for higher rate limits

---

### Step 2 — Backend Setup

```bash
# Navigate to backend
cd medimind-ai/backend

# Create virtual environment
python -m venv venv

# Activate it
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

**Edit `.env` — add your Groq keys:**
```env
GROQ_API_KEY_1=gsk_your_actual_key_here
GROQ_API_KEY_2=gsk_optional_second_key
GROQ_API_KEY_3=gsk_optional_third_key

SECRET_KEY=your-super-secret-jwt-key-minimum-32-chars

LLM_MODEL=llama3-70b-8192
```

```bash
# Seed the database with demo data
python seed.py

# Start the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: **http://localhost:8000**  
API Docs (Swagger): **http://localhost:8000/api/docs**

---

### Step 3 — Frontend Setup

Open a **new terminal**:

```bash
# Navigate to frontend
cd medimind-ai/frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

### Step 4 — Login

Open **http://localhost:5173** in your browser.

| Role        | Email                        | Password    |
|-------------|------------------------------|-------------|
| Admin       | admin@medimind.ai            | Admin@123   |
| Pharmacist  | pharmacist@medimind.ai       | Pharma@123  |

---

## 🤖 Using the AI Agents

### Copilot (Chat)
Navigate to **AI Copilot** → Type any question:
- "What medicines are running low?"
- "What should I order this week?"
- "Which medicines expire in 30 days?"

### Agent Council
Navigate to **Agent Council** → Click **Run Full Council**  
All 6 agents run in parallel and produce a unified intelligence report.

Or run individual agents:
- **Stock Monitor** — inventory health analysis
- **Demand Forecast** — 30-day predictions for Indian seasons
- **Purchase Guide** — optimized buy list with quantities
- **Expiry Watch** — financial impact of near-expiry stock
- **Compliance Agent** — Schedule H/H1/X regulatory check

---

## 🔄 Groq Free Tier & Rate Limits

The app supports **multiple Groq API keys** for higher throughput:
- Set `GROQ_API_KEY_1`, `_2`, `_3` in `.env`
- Keys rotate automatically round-robin on each request
- Free tier: ~30 requests/minute per key
- With 3 keys: ~90 requests/minute effective

**Recommended model:** `llama3-70b-8192` (best quality, free tier)  
**Fallback model:** `llama3-8b-8192` (faster, lower quality)

---

## 🏗️ Production Build

### Backend (Production)
```bash
# Use gunicorn for production
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend (Production Build)
```bash
cd frontend
npm run build
# Serve the dist/ folder with nginx or any static host
```

---

## 🗃️ Database

- **SQLite** (`medimind.db`) — auto-created in `backend/`
- Tables: `users`, `medicines`, `alerts`, `purchase_orders`
- Re-seed: `python seed.py` (safe — won't duplicate existing SKUs)
- Reset DB: delete `medimind.db` and re-run `python seed.py`

---

## 🌙 Dark / Light Mode

Toggle via the **sidebar button** or top-right button on login page.  
Preference is saved to `localStorage` automatically.

---

## ❓ Troubleshooting

| Problem | Fix |
|---|---|
| `No GROQ_API_KEY found` | Add `GROQ_API_KEY_1=gsk_...` to `backend/.env` |
| `401 Unauthorized` | Token expired — log out and log in again |
| `CORS error` | Ensure backend is on port 8000, frontend on 5173 |
| Agent returns error | Check Groq rate limits — wait 60s or add more keys |
| Empty dashboard | Run `python seed.py` to add demo medicines |
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` with venv activated |
