# Check if node_modules exists
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "Installing dependencies..."
    npm install three @types/three
}

# Start the development server
Write-Host "Starting development server..."
npm run dev 