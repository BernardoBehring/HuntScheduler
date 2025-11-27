#!/bin/bash
set -e

echo "Building React frontend..."
npm run build

echo "Copying frontend to C# wwwroot..."
rm -rf Backend/HuntScheduleApi/wwwroot
mkdir -p Backend/HuntScheduleApi/wwwroot
cp -r dist/public/* Backend/HuntScheduleApi/wwwroot/

echo "Starting C# backend on port 5000..."
cd Backend/HuntScheduleApi
ASPNETCORE_URLS="http://0.0.0.0:5000" dotnet run
