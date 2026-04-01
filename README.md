# AI Code Generator Agent

A fullstack web application that generates production-ready code for **any tech stack** using AI. Describe what you want to build, pick a tech stack, and get complete, runnable code instantly.

## Features

- **23+ Tech Stacks** — Frontend, Backend, Mobile, Scripts, Data/ML, DevOps, Fullstack
- **Natural Language Input** — Describe your project in plain English
- **Multi-File Output** — Generates complete project structures, not just single files
- **Syntax Highlighting** — Beautiful code preview with line numbers
- **Copy to Clipboard** — One-click copy for any generated file
- **Download as ZIP** — Download your entire generated project
- **Framework Selection** — Choose specific frameworks within each stack

## Supported Tech Stacks

| Category | Stacks |
|----------|--------|
| Frontend | React, Vue.js, Angular, Svelte, HTML/CSS/JS |
| Backend | Python (FastAPI, Django, Flask), Node.js (Express, NestJS), Go, Rust, Java Spring Boot |
| Mobile | React Native, Flutter |
| Scripts & CLI | Python, Bash |
| Data & ML | Python (PyTorch, TensorFlow, scikit-learn, pandas) |
| DevOps | Docker, Terraform, GitHub Actions |
| Fullstack | Next.js, T3 Stack |

## Tech Stack (This App)

- **Backend**: FastAPI (Python) with Ollama (local LLM)
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **AI**: CodeLlama via Ollama — runs locally, no API key needed

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- [Ollama](https://ollama.com/) installed and running

### Backend Setup

```bash
# Install and start Ollama, then pull the model
ollama pull codellama

cd backend
poetry install
poetry run fastapi dev app/main.py
```

You can configure the Ollama host and model via environment variables:
```bash
export OLLAMA_HOST=http://localhost:11434  # default
export OLLAMA_MODEL=codellama              # default
```

The backend runs at http://localhost:8000

### Frontend Setup

```bash
cd frontend
echo "VITE_API_URL=http://localhost:8000" > .env
npm install
npm run dev
```

The frontend runs at http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/healthz` | Health check |
| GET | `/api/stacks` | List all supported tech stacks |
| POST | `/api/generate` | Generate code from prompt + stack |
| POST | `/api/download` | Download generated code as ZIP |
