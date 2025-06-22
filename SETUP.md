# Quick Setup Guide - BoSar Dashboard

Get the BoSar Dashboard running locally in minutes.

## 🚀 Quick Start

### 1. Prerequisites Check

Ensure you have:
- **Node.js 18+** (`node --version`)
- **npm** or **yarn** (`npm --version`)
- **Git** (`git --version`)

### 2. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd BosarChatDashboardApp

# Install dependencies
npm install

# Set up environment (creates .env.local from .env.example)
npm run setup
```

### 3. Configure Environment

Edit `.env.local` with your backend URLs:

```env
# For local development with backend running on port 3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001/chat

# For production backend
# NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
# NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com/chat
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🔧 Development Commands

```bash
# Development server with Turbopack (faster)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Linting
npm run lint

# Environment setup
npm run setup
```

## 🏗️ Backend Requirements

The dashboard requires a compatible backend API. Ensure your backend:

1. **Runs on the configured port** (default: 3001)
2. **Supports the required endpoints**:
   - Authentication: `/auth/login`, `/auth/forgot-password`
   - Users: `/users`, `/users/profile`
   - Conversations: `/conversations`
   - Knowledge Base: `/faq`, `/pdf-documents`
   - Bot Settings: `/bot-settings`

3. **WebSocket server** for real-time chat at `/chat` endpoint

4. **CORS configuration** allows requests from `http://localhost:3000`

## 🔐 Authentication Flow

1. **Sign In**: Navigate to `/auth/signin`
2. **Default Credentials**: Check with your backend team
3. **JWT Token**: Stored in localStorage
4. **Role-based Access**: Admin vs User permissions

## 📱 Testing the Application

### Core Features to Test

1. **Authentication**:
   - Sign in with valid credentials
   - Access protected routes
   - Sign out functionality

2. **Conversations**:
   - View conversation list
   - Open individual conversations
   - Real-time message updates
   - Human takeover functionality

3. **Knowledge Base**:
   - View/create/edit FAQs
   - Upload PDF documents
   - Search functionality

4. **User Management** (Admin only):
   - View users list
   - Create new users
   - Edit user details

5. **Agent Settings** (Admin only):
   - Configure bot settings
   - Update bot parameters

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

### API Connection Failed
- Check backend is running
- Verify `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- Check CORS settings on backend
- Test API endpoint: `curl http://localhost:3001/health`

### WebSocket Connection Issues
- Verify `NEXT_PUBLIC_WS_URL` in `.env.local`
- Check WebSocket server is running
- Ensure `/chat` endpoint is available

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

## 🔍 Development Tips

### Hot Reload
- Changes to components auto-reload
- Environment variable changes require restart
- API changes may need browser refresh

### Debugging
```javascript
// Check environment variables in browser console
console.log(process.env.NEXT_PUBLIC_API_BASE_URL);

// Check API client configuration
import { API_CONFIG } from '@/lib/api';
console.log(API_CONFIG);
```

### Code Quality
```bash
# Run before committing
npm run type-check
npm run lint
npm run build
```

## 📁 Key Files to Know

- `app/layout.tsx` - Root layout with AuthProvider
- `lib/api/` - API client and hooks
- `lib/websocket/` - WebSocket service
- `components/` - Reusable UI components
- `.env.local` - Environment configuration
- `amplify.yml` - Deployment configuration

## 🚀 Ready for Production?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- AWS Amplify deployment
- Environment variable setup
- Domain configuration
- SSL certificates

## 🆘 Need Help?

1. Check the [README.md](./README.md) for detailed documentation
2. Review API integration in `lib/api/`
3. Test backend connectivity
4. Check browser console for errors
5. Contact the development team

---

Happy coding! 🎉
