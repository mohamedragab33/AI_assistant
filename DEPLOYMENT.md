# 🚀 Bitcoin Trading AI - Deployment Guide

This guide covers multiple deployment options for your Bitcoin Trading AI platform.

## 📋 Table of Contents

1. [Quick Deployment](#quick-deployment)
2. [Platform Options](#platform-options)
3. [Prerequisites](#prerequisites)
4. [Local Development](#local-development)
5. [Production Deployment](#production-deployment)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

## 🚀 Quick Deployment

### Option 1: One-Click Deployment (Recommended)

```bash
# 1. Clone and setup
git clone https://github.com/mohamedragab33/AI_assistant.git
cd AI_assistant

# 2. Configure environment
cp env.example .env
# Edit .env with your settings

# 3. Deploy
chmod +x deploy.sh
./deploy.sh production
```

### Option 2: Docker Compose

```bash
# Local development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

## 🏭 Platform Options

### 1. DigitalOcean App Platform (Easiest)

**Cost**: ~$25-50/month | **Setup**: 10 minutes

1. Fork your repository
2. Connect to DigitalOcean App Platform
3. Configure environment variables
4. Deploy with one click

```yaml
# app.yaml for DigitalOcean
name: bitcoin-trading-ai
services:
- name: web
  source_dir: /
  dockerfile_path: Dockerfile
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 3000
  environment_slug: node-js
  envs:
  - key: NODE_ENV
    value: production
  - key: JWT_SECRET_KEY
    value: your-secret-key
databases:
- name: mongodb
  engine: MONGODB
  version: "5"
```

### 2. VPS Deployment (Most Control)

**Cost**: ~$10-20/month | **Setup**: 30 minutes

**Recommended VPS Providers:**
- **DigitalOcean Droplets**: $10/month (2GB RAM, 1 CPU)
- **Linode**: $10/month (2GB RAM, 1 CPU) 
- **Vultr**: $10/month (2GB RAM, 1 CPU)
- **AWS EC2**: t3.small ($15/month)

### 3. Railway/Render (Developer-Friendly)

**Cost**: ~$15-25/month | **Setup**: 15 minutes

### 4. Self-Hosted Server

**Cost**: Hardware only | **Setup**: 45 minutes

## 📋 Prerequisites

### Required Software
- Docker & Docker Compose
- Git
- SSL Certificate (Let's Encrypt recommended)

### Server Requirements
- **Minimum**: 2GB RAM, 1 CPU, 20GB SSD
- **Recommended**: 4GB RAM, 2 CPU, 40GB SSD
- **Operating System**: Ubuntu 20.04+ or CentOS 7+

## 🔧 Local Development

```bash
# 1. Install dependencies
cd btc_assistant/frontend
npm install

cd ../
pip install -r requirements.txt

# 2. Start services
./deploy.sh local

# 3. Access application
Frontend: http://localhost:3000
API: http://localhost:8000
Auth: http://localhost:8001
```

## 🌐 Production Deployment

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx (for SSL termination)
sudo apt install nginx certbot python3-certbot-nginx -y
```

### Step 2: Clone and Configure

```bash
# Clone repository
git clone https://github.com/mohamedragab33/AI_assistant.git
cd AI_assistant

# Setup environment
cp env.example .env
nano .env  # Configure your settings
```

### Step 3: SSL Certificate (Let's Encrypt)

```bash
# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Step 4: Deploy

```bash
# Deploy to production
./deploy.sh production

# Check status
docker-compose -f docker-compose.prod.yml ps
```

## 🔄 CI/CD Pipeline

### GitHub Actions Setup

1. **Add Repository Secrets** (Settings → Secrets and variables → Actions):

```bash
# Server Access
STAGING_HOST=your-staging-server-ip
STAGING_USER=your-username
STAGING_SSH_KEY=your-private-ssh-key

PRODUCTION_HOST=your-production-server-ip
PRODUCTION_USER=your-username
PRODUCTION_SSH_KEY=your-private-ssh-key
PRODUCTION_URL=https://yourdomain.com

# Environment Variables
JWT_SECRET_KEY=your-super-secret-key
MONGO_ROOT_PASSWORD=your-mongodb-password
```

2. **Enable GitHub Container Registry**:
   - Go to Settings → Developer settings → Personal access tokens
   - Create token with `write:packages` permission
   - Add as `GITHUB_TOKEN` secret

3. **Automatic Deployment**:
   - Push to `main` branch triggers automatic deployment
   - Tests run first, then builds Docker image
   - Deploys to staging, then production (with approval)

### Manual CI/CD Commands

```bash
# Build and push image
docker build -t ghcr.io/mohamedragab33/ai_assistant/bitcoin-trading-ai:latest .
docker push ghcr.io/mohamedragab33/ai_assistant/bitcoin-trading-ai:latest

# Deploy on server
ssh user@server 'cd /opt/bitcoin-trading-ai && git pull && docker-compose -f docker-compose.prod.yml up -d'
```

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Check service status
curl http://localhost:8000/health

# View logs
docker-compose logs -f bitcoin-trading-ai

# Monitor resources
docker stats
```

### Backup Strategy

```bash
# Database backup
docker exec btc-mongodb-prod mongodump --out /backup/$(date +%Y%m%d_%H%M%S)

# Automated backups (crontab)
0 2 * * * /opt/bitcoin-trading-ai/backup.sh
```

### Update Process

```bash
# Zero-downtime updates
git pull origin main
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## 🛠️ Environment Configuration

### Required Environment Variables

```bash
# Security (REQUIRED)
JWT_SECRET_KEY=minimum-32-character-secret-key
MONGO_ROOT_PASSWORD=secure-mongodb-password

# URLs (REQUIRED for production)
API_BASE_URL=https://yourdomain.com
AUTH_API_BASE_URL=https://yourdomain.com

# Optional
BINANCE_API_KEY=your-binance-api-key
BINANCE_SECRET_KEY=your-binance-secret
```

### Production Checklist

- [ ] SSL certificate configured
- [ ] Environment variables set
- [ ] Database secured
- [ ] Firewall configured
- [ ] Backups scheduled
- [ ] Monitoring enabled
- [ ] Domain configured
- [ ] DNS records set

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
```bash
sudo lsof -i :8000
sudo kill -9 <PID>
```

2. **Docker Permission Denied**
```bash
sudo usermod -aG docker $USER
newgrp docker
```

3. **MongoDB Connection Failed**
```bash
# Check MongoDB logs
docker logs btc-mongodb-prod

# Verify connection string
docker exec -it btc-mongodb-prod mongo --eval "db.adminCommand('ping')"
```

4. **SSL Certificate Issues**
```bash
# Check certificate
sudo certbot certificates

# Renew if needed
sudo certbot renew
```

### Performance Optimization

```bash
# Increase MongoDB memory
# Add to docker-compose.prod.yml:
command: --wiredTigerCacheSizeGB 1

# Optimize Node.js
NODE_OPTIONS="--max-old-space-size=2048"

# Enable Nginx compression
gzip on;
gzip_types text/plain application/json;
```

## 📞 Support

If you encounter issues:

1. Check the logs: `docker-compose logs`
2. Verify environment variables
3. Check firewall settings
4. Ensure ports are not blocked
5. Review the troubleshooting section

## 🎯 Next Steps

After successful deployment:

1. **Security**: Configure firewall, enable fail2ban
2. **Monitoring**: Set up Grafana, Prometheus
3. **Scaling**: Consider load balancing for high traffic
4. **Backups**: Implement automated backup strategy
5. **Updates**: Set up automated security updates

---

**🎉 Congratulations!** Your Bitcoin Trading AI is now live and secure! 