# CIVIS — Full Test & Verification Suite Runner
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "CIVIS — RUNNING COMPLETE VERIFICATION SUITE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Backend Pytest Suite
Write-Host "`n[1/3] Running Backend Domain Test Suites..." -ForegroundColor Yellow
cd apps/api
.venv\Scripts\python -m pytest --tb=short
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Backend tests encountered errors." -ForegroundColor Red
    cd ../..
    exit 1
}
Write-Host "[PASS] Backend test suites passed." -ForegroundColor Green

# 2. Standalone Verification Engine
Write-Host "`n[2/3] Running Standalone Multi-Agent Verification..." -ForegroundColor Yellow
.venv\Scripts\python tests/run_all_verifications.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Standalone verifications failed." -ForegroundColor Red
    cd ../..
    exit 1
}
cd ../..

# 3. Frontend Typecheck
Write-Host "`n[3/3] Running Frontend TypeScript Typecheck..." -ForegroundColor Yellow
cd apps/web
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Frontend typecheck failed." -ForegroundColor Red
    cd ../..
    exit 1
}
cd ../..

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "ALL BACKEND & FRONTEND VERIFICATIONS PASSED (100% GREEN)" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
