@echo off
echo Setting up StellarSphere...

echo Installing npm packages for backend...
npm install

echo Installing npm packages for frontend...
cd client
npm install
cd ..

echo Installation complete!

echo Starting the application...
echo.
echo This will start both the backend server and frontend development server.
echo The backend will run on http://localhost:5000
echo The frontend will run on http://localhost:3000
echo.
echo Press Ctrl+C to stop the servers
echo.

npm run dev
