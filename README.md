# Daily Content Generator

Universal marketing content pipeline: upload a document (README, changelog, notes), run a three-agent **Google ADK** flow (Miner → Ghostwriter → Humanizer), and get human-sounding copy powered by **OpenAI** (via LiteLLM).

## Setup

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# Edit .env and set OPENAI_API_KEY=sk-...
```

Optional: `$env:PYTHONUTF8 = "1"` on Windows (recommended with LiteLLM).

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:3000, upload a **source file**, fill in **product name** and **audience**, then click **Generate content**.

### CLI

```powershell
cd backend
python main.py --file "C:\path\to\README.md" --product-name "My Product" --audience "developers"
```

For a whole folder instead of one file:

```powershell
python main.py --path "C:\path\to\repo" --product-name "My Product" --audience "developers"
```

Optional: `--format linkedin|twitter|blog` and `--json` for machine-readable output.

## Architecture

| Agent       | Role |
|------------|------|
| **Miner**  | Reads injected source material; extracts PRODUCT, FEATURE_HIGHLIGHT, INSIGHT |
| **Ghostwriter** | PAS framework draft; picks LinkedIn / thread / blog format |
| **Humanizer** | Removes AI-isms; preserves product + feature context |

All agents use `OPENAI_MODEL` (default `openai/gpt-4o-mini`) through ADK's `LiteLlm` wrapper.
