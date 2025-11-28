#!/bin/bash
set -e

echo "Building React frontend..."
npm run build

echo "Copying frontend to C# wwwroot..."
rm -rf Backend/HuntSchedule.Api/wwwroot
mkdir -p Backend/HuntSchedule.Api/wwwroot
cp -r dist/public/* Backend/HuntSchedule.Api/wwwroot/

echo "Starting C# backend on port 5000..."
cd Backend/HuntSchedule.Api
ASPNETCORE_URLS="http://0.0.0.0:5000" dotnet run
