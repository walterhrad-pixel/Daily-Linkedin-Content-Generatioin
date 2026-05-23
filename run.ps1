# Daily Content Generator — one-shot setup, build, and run
# Usage:
#   .\run.ps1        # production: npm build + next start
#   .\run.ps1 -Dev   # development: next dev (hot reload)

param([switch]$Dev)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$Backend = Join-Path $Root "backend"
$Frontend = Join-Path $Root "frontend"
$VenvDir = Join-Path $Backend ".venv"
$VenvPython = Join-Path $VenvDir "Scripts\python.exe"

function Write-Step([string]$Message) {
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

Write-Step "Backend: Python virtual environment"
if (-not (Test-Path $VenvPython)) {
    python -m venv $VenvDir
    if (-not (Test-Path $VenvPython)) {
        throw "Failed to create venv. Is Python installed and on PATH?"
    }
}

Write-Step "Backend: install dependencies"
& $VenvPython -m pip install --upgrade pip -q
& $VenvPython -m pip install -r (Join-Path $Backend "requirements.txt")

$envFile = Join-Path $Backend ".env"
$envExample = Join-Path $Backend ".env.example"
if (-not (Test-Path $envFile)) {
    if (Test-Path $envExample) {
        Copy-Item $envExample $envFile
        Write-Warning "Created backend/.env — add your OPENAI_API_KEY before generating."
    } else {
        Write-Warning "backend/.env not found. Set OPENAI_API_KEY before generating."
    }
}

$env:PYTHONUTF8 = "1"
$env:PYTHON_PATH = $VenvPython

Write-Step "Frontend: install dependencies"
Push-Location $Frontend
try {
    if (-not (Test-Path "node_modules")) {
        npm install
    }

    if ($Dev) {
        Write-Step "Frontend: starting dev server (http://localhost:3000)"
        npm run dev
    } else {
        Write-Step "Frontend: production build"
        npm run build
        Write-Step "Frontend: starting server (http://localhost:3000)"
        npm run start
    }
} finally {
    Pop-Location
}
