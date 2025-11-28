#!/bin/bash
set -e

echo "Building React frontend..."
npm run build

echo "Copying frontend to C# wwwroot..."
rm -rf Backend/HuntSchedule.Api/wwwroot
mkdir -p Backend/HuntSchedule.Api/wwwroot
cp -r dist/public/* Backend/HuntSchedule.Api/wwwroot/

echo "Building C# backend..."
cd Backend
dotnet restore HuntSchedule.sln
dotnet build HuntSchedule.sln --no-restore

echo "Starting C# backend on port 5000..."
cd HuntSchedule.Api
dotnet run --no-build
