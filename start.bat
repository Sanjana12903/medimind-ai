@echo off
echo Starting MediMind AI with concurrently...

cd medimind-ai

concurrently ^
  "cd backend && venv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000" ^
  "cd frontend && npm run dev"

pause