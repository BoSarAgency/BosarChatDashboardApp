# BoSar Dashboard

A modern web application for managing customer chat conversations with AI-powered bot assistance. Built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Real-time Chat Management**: Monitor and manage customer conversations in real-time
- **AI Bot Integration**: Seamless integration with AI chatbots for automated responses
- **Human Takeover**: Agents can take over conversations when needed
- **Knowledge Base Management**: Manage FAQs and upload PDF documents for bot training
- **User Management**: Admin panel for managing users and permissions
- **Agent Settings**: Configure bot behavior and responses
- **WebSocket Support**: Real-time updates using Socket.IO
- **Responsive Design**: Modern, mobile-friendly interface

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Real-time**: Socket.IO Client
- **State Management**: React Hooks with custom API hooks
- **Authentication**: JWT-based authentication

### Backend Integration
- **API**: RESTful API with NestJS backend
- **WebSocket**: Socket.IO for real-time messaging
- **Authentication**: JWT tokens with role-based access control

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   │   ├── conversations/ # Chat management
│   │   ├── users/         # User management
│   │   ├── knowledge-base/# FAQ and document management
│   │   └── agent-settings/# Bot configuration
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable React components
├── lib/                   # Utility libraries
│   ├── api/              # API client and hooks
│   └── websocket/        # WebSocket service
├── scripts/              # Setup and utility scripts
├── amplify.yml           # AWS Amplify configuration
└── package.json          # Dependencies and scripts
```

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **React Markdown** - Markdown rendering
- **ESLint** - Code linting

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Access to the backend API

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BosarChatDashboardApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   npm run setup
   ```
   This will create a `.env.local` file. Update it with your configuration:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
   NEXT_PUBLIC_WS_URL=wss://your-websocket-domain.com/chat
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run setup` - Set up development environment

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables:

- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL (optional, auto-detected if not set)
- `NEXT_PUBLIC_WS_URL` - WebSocket server URL (optional, defaults to localhost:3001)

### API Configuration

The API client automatically detects the environment:
- **Development**: `http://localhost:3001`
- **Production**: Auto-detects based on hostname or uses `NEXT_PUBLIC_API_BASE_URL`

## 🎯 Key Features

### Dashboard Pages

1. **Conversations** (`/dashboard/conversations`)
   - View all customer conversations
   - Real-time message updates
   - Human takeover functionality
   - Conversation status management

2. **Users** (`/dashboard/users`) - Admin only
   - User management interface
   - Create, update, and delete users
   - Role-based access control

3. **Knowledge Base** (`/dashboard/knowledge-base`)
   - FAQ management
   - PDF document upload and management
   - Bot training content

4. **Agent Settings** (`/dashboard/agent-settings`) - Admin only
   - Configure bot behavior
   - Set response parameters
   - Manage bot personality

### Authentication

- JWT-based authentication
- Role-based access control (admin/user)
- Automatic token refresh
- Secure route protection

### Real-time Features

- Live chat updates via WebSocket
- Connection fallback mechanisms
- Heartbeat monitoring
- Automatic reconnection

## 🔒 Security Features

- JWT token authentication
- Role-based access control
- Secure HTTP headers
- XSS protection
- CSRF protection

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🧪 Testing

Run type checking:
```bash
npm run type-check
```

Run linting:
```bash
npm run lint
```

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions including:
- AWS Amplify setup
- Environment variable configuration
- Domain configuration
- SSL setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the API integration guide
- Contact the development team
