# Deployment Guide - BoSar Dashboard

This guide covers deploying the BoSar Dashboard to AWS Amplify and other platforms.

## 🚀 AWS Amplify Deployment

AWS Amplify is the recommended deployment platform for this Next.js application.

### Prerequisites

- AWS Account with appropriate permissions
- GitHub/GitLab repository access
- Backend API deployed and accessible
- Domain name (optional, for custom domains)

### Step 1: Prepare Your Repository

1. **Ensure your code is in a Git repository** (GitHub, GitLab, Bitbucket, or AWS CodeCommit)

2. **Verify the amplify.yml file** is in your repository root:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - echo "Installing dependencies..."
           - npm ci
           - echo "Dependencies installed successfully"
           - echo "Environment configuration"
           - echo "API Base URL is ${NEXT_PUBLIC_API_BASE_URL:-auto-detected}"
       build:
         commands:
           - echo "Building Next.js application..."
           - npm run build
           - echo "Build completed successfully"
     artifacts:
       baseDirectory: .next
       files:
         - "**/*"
     cache:
       paths:
         - node_modules/**/*
         - .next/cache/**/*
   ```

### Step 2: Create Amplify App

1. **Log in to AWS Console** and navigate to AWS Amplify

2. **Create a new app**:
   - Click "New app" → "Host web app"
   - Choose your Git provider (GitHub, GitLab, etc.)
   - Authorize AWS Amplify to access your repositories

3. **Select repository and branch**:
   - Choose your repository
   - Select the branch to deploy (usually `main` or `master`)
   - Click "Next"

4. **Configure build settings**:
   - App name: `bosar-dashboard` (or your preferred name)
   - Environment: `production`
   - The build specification should auto-detect from `amplify.yml`
   - Click "Next"

### Step 3: Configure Environment Variables

**Critical**: Set up environment variables before the first deployment.

1. **In the Amplify Console**, go to your app → "Environment variables"

2. **Add the following environment variables**:

   | Variable Name | Value | Description |
   |---------------|-------|-------------|
   | `NEXT_PUBLIC_API_BASE_URL` | `https://your-api-domain.com` | Backend API URL |
   | `NEXT_PUBLIC_WS_URL` | `wss://your-api-domain.com/chat` | WebSocket server URL |

   **Example values**:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://api.acgq.click
   NEXT_PUBLIC_WS_URL=wss://api.acgq.click/chat
   ```

3. **Important Notes**:
   - Replace `your-api-domain.com` with your actual backend domain
   - Use `https://` for API URL and `wss://` for WebSocket URL
   - If your backend uses a different port, include it: `https://api.example.com:3001`
   - Environment variables are available during build time and runtime

### Step 4: Deploy

1. **Review and deploy**:
   - Review all settings
   - Click "Save and deploy"

2. **Monitor the build**:
   - Watch the build logs in real-time
   - The build typically takes 3-5 minutes
   - Check for any errors in the build process

3. **Access your app**:
   - Once deployed, you'll get an Amplify URL like: `https://main.d1234567890.amplifyapp.com`
   - Test the application thoroughly

### Step 5: Custom Domain (Optional)

1. **Add custom domain**:
   - In Amplify Console → "Domain management"
   - Click "Add domain"
   - Enter your domain (e.g., `dashboard.yourdomain.com`)

2. **DNS Configuration**:
   - Add the provided CNAME record to your DNS provider
   - Wait for DNS propagation (can take up to 48 hours)

3. **SSL Certificate**:
   - Amplify automatically provisions SSL certificates
   - Your site will be available over HTTPS

## 🔧 Environment Configuration Details

### Required Environment Variables

#### `NEXT_PUBLIC_API_BASE_URL`
- **Purpose**: Backend API endpoint
- **Format**: `https://your-api-domain.com`
- **Example**: `https://api.acgq.click`
- **Note**: Must be accessible from the browser (public)

#### `NEXT_PUBLIC_WS_URL`
- **Purpose**: WebSocket server for real-time chat
- **Format**: `wss://your-websocket-domain.com/chat`
- **Example**: `wss://api.acgq.click/chat`
- **Note**: Usually the same domain as API with `/chat` path

### Auto-Detection Fallback

If environment variables are not set, the application will:
1. **Development**: Use `http://localhost:3001`
2. **Production**: Auto-detect based on hostname:
   - `*.acgq.click` → `https://api.acgq.click`
   - `*.amplifyapp.com` → `https://api.acgq.click`

## 🔒 Security Headers

The application includes security headers configured in `amplify.yml`:

- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Restricts camera, microphone, geolocation
- **Cache-Control**: Optimized caching for static assets

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**:
   - Check Node.js version (should be 18+)
   - Verify all dependencies are in `package.json`
   - Check build logs for specific errors

2. **API Connection Issues**:
   - Verify `NEXT_PUBLIC_API_BASE_URL` is correct
   - Ensure backend API is accessible from the internet
   - Check CORS configuration on backend

3. **WebSocket Connection Fails**:
   - Verify `NEXT_PUBLIC_WS_URL` is correct
   - Ensure WebSocket server supports WSS (secure WebSocket)
   - Check firewall/security group settings

4. **Authentication Issues**:
   - Verify JWT token configuration
   - Check backend authentication endpoints
   - Ensure CORS allows credentials

### Debug Steps

1. **Check Environment Variables**:
   ```bash
   # In browser console
   console.log(process.env.NEXT_PUBLIC_API_BASE_URL);
   console.log(process.env.NEXT_PUBLIC_WS_URL);
   ```

2. **Test API Connectivity**:
   ```bash
   curl https://your-api-domain.com/health
   ```

3. **Check Build Logs**:
   - Review Amplify build logs for errors
   - Look for missing dependencies or build failures

## 🔄 Continuous Deployment

Amplify automatically deploys when you push to the connected branch:

1. **Push changes** to your repository
2. **Amplify detects** the changes automatically
3. **Build starts** within minutes
4. **Deployment** happens automatically after successful build

### Branch-based Deployments

You can set up multiple environments:
- `main` branch → Production environment
- `develop` branch → Staging environment
- Feature branches → Preview deployments

## 📊 Monitoring and Analytics

1. **Amplify Console** provides:
   - Build history and logs
   - Performance metrics
   - Error tracking
   - Access logs

2. **CloudWatch Integration**:
   - Custom metrics
   - Alarms and notifications
   - Log aggregation

## 🔧 Advanced Configuration

### Custom Build Commands

Modify `amplify.yml` for custom build requirements:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - echo "Custom pre-build commands here"
    build:
      commands:
        - npm run build
        - echo "Custom build commands here"
    postBuild:
      commands:
        - echo "Custom post-build commands here"
```

### Performance Optimization

1. **Enable caching** (already configured in `amplify.yml`)
2. **Use CDN** (Amplify includes CloudFront)
3. **Optimize images** with Next.js Image component
4. **Enable compression** (automatic with Amplify)

## 🆘 Support

For deployment issues:
1. Check AWS Amplify documentation
2. Review build logs in Amplify Console
3. Test locally with `npm run build`
4. Contact AWS Support for platform issues

---

**Next Steps**: After successful deployment, test all features including authentication, real-time chat, and API connectivity.
