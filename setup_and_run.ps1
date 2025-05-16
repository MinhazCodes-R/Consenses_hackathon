# Setup and run script for PowerShell
Write-Host "Setting up StellarSphere..." -ForegroundColor Cyan

Write-Host "Installing npm packages for backend..." -ForegroundColor Yellow
npm install

Write-Host "Installing npm packages for frontend..." -ForegroundColor Yellow
Push-Location -Path ".\client"
npm install
Pop-Location

Write-Host "Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Starting the application..." -ForegroundColor Cyan
Write-Host ""
Write-Host "This will start both the backend server and frontend development server." -ForegroundColor White
Write-Host "The backend will run on http://localhost:5000" -ForegroundColor White
Write-Host "The frontend will run on http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the servers" -ForegroundColor Yellow
Write-Host ""

npm run dev
