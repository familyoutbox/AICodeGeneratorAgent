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

- **Backend**: FastAPI (Python) with OpenAI API
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **AI**: GPT-4o for code generation

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- OpenAI API key

### Backend Setup

```bash
cd backend
echo "OPENAI_API_KEY=your-key-here" > .env
poetry install
poetry run fastapi dev app/main.py
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
