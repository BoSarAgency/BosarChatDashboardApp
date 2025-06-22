#!/bin/bash

# BoSar Dashboard - Environment Setup Script
# This script helps set up the local development environment

echo "🚀 Setting up BoSar Dashboard development environment..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✅ .env.local created. Please update it with your actual values."
else
    echo "ℹ️  .env.local already exists."
fi

# Check Node.js version
echo "🔍 Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "Node.js version: $NODE_VERSION"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed."
else
    echo "ℹ️  Dependencies already installed."
fi

# Check if Next.js is working
echo "🧪 Testing Next.js build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Next.js build successful."
else
    echo "❌ Next.js build failed. Please check your configuration."
    exit 1
fi

echo ""
echo "🎉 Setup complete! You can now run:"
echo "   npm run dev    - Start development server"
echo "   npm run build  - Build for production"
echo "   npm run start  - Start production server"
echo ""
echo "📖 Next steps:"
echo "   1. Update .env.local with your backend API URLs"
echo "   2. Ensure your backend server is running"
echo "   3. Run 'npm run dev' to start development"
echo ""
echo "📚 Documentation:"
echo "   - README.md      - Project overview and features"
echo "   - SETUP.md       - Quick setup guide"
echo "   - DEPLOYMENT.md  - Production deployment guide"
