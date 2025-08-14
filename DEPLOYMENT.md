# WhatsApp Web Clone - Deployment Guide

## 🚀 Quick Deployment

### Backend Deployment (Render)

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service**
   - **Name**: `whatsapp-backend`
   - **Root Directory**: `whatsapp task/server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: `Node`

4. **Set Environment Variables**
   ```
   MONGODB_URI=mongodb+srv://njbansod:Y1WwUtrvRJsvypV6@cluster0.4iixck3.mongodb.net/whatsapp?retryWrites=true&w=majority&appName=Cluster0
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ENABLE_CHANGE_STREAMS=false
   PORT=3002
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy your backend URL (e.g., `https://your-app.onrender.com`)

### Frontend Deployment (Vercel)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Project**
   - **Framework Preset**: Next.js
   - **Root Directory**: `whatsapp task/client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

4. **Set Environment Variables**
   ```
   NEXT_PUBLIC_API_BASE=https://your-backend-url.onrender.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your frontend URL (e.g., `https://your-app.vercel.app`)

## 🔧 Local Development

### Prerequisites
- Node.js 16+
- MongoDB Atlas account

### Setup
1. **Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd whatsapp-task
   ```

2. **Backend Setup**
   ```bash
   cd "whatsapp task/server"
   npm install
   # Set environment variables
   $env:MONGODB_URI="your-mongodb-uri"
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd "whatsapp task/client"
   npm install
   npm run dev
   ```

4. **Seed Database**
   ```bash
   cd "whatsapp task/server"
   npm run ingest
   ```

## 🌐 Access Your App
- **Frontend**: http://localhost:3000 (local) / https://your-app.vercel.app (production)
- **Backend API**: http://localhost:3002 (local) / https://your-app.onrender.com (production)

## 📝 Features
- ✅ WhatsApp Web-like UI
- ✅ Real-time messaging via WebSocket
- ✅ Message status indicators
- ✅ Responsive design
- ✅ MongoDB integration
- ✅ Webhook payload processing

## 🔗 API Endpoints
- `GET /api/conversations` - List all conversations
- `GET /api/messages?wa_id=<number>` - Get messages for a conversation
- `POST /api/send` - Send a new message
- `GET /api/health` - Health check
