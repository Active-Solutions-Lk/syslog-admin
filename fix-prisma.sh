#!/bin/bash

# Script to fix common Prisma issues on Ubuntu Linux
# Run this script if you encounter WASM-related Prisma errors

echo "🔧 Fixing Prisma Issues..."
echo "========================="

# Set environment variable to use binary engine instead of WASM
export PRISMA_CLIENT_ENGINE_TYPE="binary"

echo "1. Setting Prisma engine type to binary..."

# Remove existing Prisma client
echo "2. Removing existing Prisma client..."
rm -rf node_modules/.prisma node_modules/@prisma/client

# Reinstall Prisma client with binary engine
echo "3. Reinstalling Prisma client with binary engine..."
npm install @prisma/client --save

# Generate Prisma Client
echo "4. Generating Prisma Client..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma Client generated successfully with binary engine!"
    echo ""
    echo "To verify the fix, run:"
    echo "node test-prisma-connection.js"
else
    echo "❌ Failed to generate Prisma Client"
    echo "Try manually running:"
    echo "export PRISMA_CLIENT_ENGINE_TYPE=\"binary\""
    echo "npx prisma generate"
fi