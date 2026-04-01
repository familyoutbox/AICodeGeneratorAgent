# Testing the AI Code Generator Agent

## Prerequisites
- Ollama installed with codellama model pulled
- Backend dependencies installed via `poetry install` in `backend/`
- Frontend dependencies installed via `npm install` in `frontend/`

## Starting the App

```bash
# 1. Start Ollama
sudo systemctl start ollama

# 2. Start backend (use nohup — codellama generation is slow on CPU and will timeout shell connections)
cd backend && nohup poetry run fastapi dev app/main.py --port 8000 > /tmp/backend.log 2>&1 &

# 3. Start frontend
cd frontend && nohup npm run dev > /tmp/frontend.log 2>&1 &
```

## Verifying Servers
```bash
curl -s http://localhost:8000/healthz   # Should return {"status":"ok"}
curl -s http://localhost:8000/api/stacks | python3 -c "import sys,json; print(len(json.load(sys.stdin)['stacks']), 'stacks')"  # Should print "23 stacks"
curl -s -o /dev/null -w '%{http_code}' http://localhost:5173  # Should return 200
```

## Testing via UI
1. Open http://localhost:5173
2. Select a category tab (e.g., "Scripts & CLI")
3. Click a stack card (e.g., "Python Script")
4. Type a prompt (e.g., "hello world script")
5. Click "Generate Code" and wait ~2 minutes (CPU)
6. Verify: summary text, file count, syntax-highlighted code, Download ZIP button

## Key Notes
- **codellama on CPU is very slow** (~2 min per generation). Use `nohup` for servers.
- Backend logs: `tail -f /tmp/backend.log`
- Frontend logs: `tail -f /tmp/frontend.log`
- If backend hangs after a failed generation, restart Ollama: `sudo systemctl restart ollama`
- Frontend env: `VITE_API_URL=http://localhost:8000` in `frontend/.env`
- Ollama config: `OLLAMA_HOST` and `OLLAMA_MODEL` env vars (defaults: localhost:11434, codellama)
