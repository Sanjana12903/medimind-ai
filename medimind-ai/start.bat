@echo off
echo Starting MediMind AI...

echo Starting Backend Server...
start cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo Starting Frontend Server...
start cmd /k "cd frontend && npm run dev"

echo Both servers are starting up!
echo Frontend will be available at: http://localhost:5173
echo Backend will be available at: http://localhost:8000
