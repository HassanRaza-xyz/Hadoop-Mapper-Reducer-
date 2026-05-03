#!/usr/bin/env bash

# Exit on error
set -o errexit

echo "🔨 Compiling C++ Mapper..."
g++ -O3 Mapper.cpp -o mapper

echo "🔨 Compiling C++ Reducer..."
g++ -O3 Reducer.cpp -o reducer

echo "📦 Installing Python dependencies..."
pip install -r backend/requirements.txt

# Ensure executables have permission (just in case)
chmod +x mapper
chmod +x reducer

echo "✅ Build complete!"
