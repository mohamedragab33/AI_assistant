# 🚀 Bitcoin Trading AI - Contabo VPS Deployment Guide

## 📋 Prerequisites
- Contabo VPS with Ubuntu 22.04 LTS
- Namecheap domain configured
- SSH access to your server

## 🔧 1. Initial Server Setup

### Connect to Your VPS
```bash
ssh root@YOUR_VPS_IP
```

### Update System
```bash
apt update && apt upgrade -y
apt install -y curl wget git nginx certbot python3-certbot-nginx
```

### Create Non-Root User
```bash
adduser bitcoin-ai
usermod -aG sudo bitcoin-ai
su - bitcoin-ai
```

## 🐍 2. Install Python & Node.js

### Install Python 3.9+
```bash
sudo apt install -y python3.9 python3.9-venv python3-pip
python3 --version  # Should be 3.9+
```

### Install Node.js 18+
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Should be 18+
npm --version
```

## 📦 3. Deploy Bitcoin Trading AI

### Clone Repository
```bash
cd /home/bitcoin-ai
git clone https://github.com/mohamedragab33/AI_assistant.git
cd AI_assistant
```

### Setup Python Environment
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Install Frontend Dependencies
```bash
cd btc_assistant/frontend
npm install
npm run build
cd ../..
```

## 🔐 4. Environment Configuration

### Create Production Environment File
```bash
nano .env.production
```

### Add Environment Variables
```bash
# Database
MONGODB_URL=mongodb+srv://admin:SecureBitcoinAI2024!@cluster0.shv9yzq.mongodb.net/btc_trading?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB=btc_trading

# Security
JWT_SECRET_KEY=bitcoin_elite_trading_jwt_secret_key_2024_secure_32_chars

# Server Configuration
NODE_ENV=production
PORT=8000
AUTH_PORT=8001

# Domain Configuration
DOMAIN=yourdomain.com
API_URL=https://yourdomain.com/api
FRONTEND_URL=https://yourdomain.com
```

## 🌐 5. Nginx Configuration

### Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/bitcoin-ai
```

### Add Configuration
```nginx
server {
    server_name yourdomain.com www.yourdomain.com;
    
    # Frontend (React Build)
    location / {
        root /home/bitcoin-ai/AI_assistant/btc_assistant/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # API Routes (Main Server)
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Auth Routes
    location /api/auth/ {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Health Check
    location /health {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/bitcoin-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 6. SSL Certificate (Free with Let's Encrypt)

### Install SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Auto-Renewal Setup
```bash
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🎯 7. Create Systemd Services

### Auth Server Service
```bash
sudo nano /etc/systemd/system/bitcoin-ai-auth.service
```

```ini
[Unit]
Description=Bitcoin AI Authentication Server
After=network.target

[Service]
Type=simple
User=bitcoin-ai
WorkingDirectory=/home/bitcoin-ai/AI_assistant
Environment=PATH=/home/bitcoin-ai/AI_assistant/.venv/bin
ExecStart=/home/bitcoin-ai/AI_assistant/.venv/bin/python btc_assistant/auth_server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Main Server Service
```bash
sudo nano /etc/systemd/system/bitcoin-ai-main.service
```

```ini
[Unit]
Description=Bitcoin AI Main Server
After=network.target bitcoin-ai-auth.service

[Service]
Type=simple
User=bitcoin-ai
WorkingDirectory=/home/bitcoin-ai/AI_assistant
Environment=PATH=/home/bitcoin-ai/AI_assistant/.venv/bin
ExecStart=/home/bitcoin-ai/AI_assistant/.venv/bin/python btc_assistant/start_simple.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Enable and Start Services
```bash
sudo systemctl daemon-reload
sudo systemctl enable bitcoin-ai-auth
sudo systemctl enable bitcoin-ai-main
sudo systemctl start bitcoin-ai-auth
sudo systemctl start bitcoin-ai-main
```

## 📊 8. Monitoring & Logs

### Check Service Status
```bash
sudo systemctl status bitcoin-ai-auth
sudo systemctl status bitcoin-ai-main
```

### View Logs
```bash
sudo journalctl -u bitcoin-ai-auth -f
sudo journalctl -u bitcoin-ai-main -f
```

### Monitor Resources
```bash
htop
df -h
free -h
```

## 🔄 9. Updates & Maintenance

### Update Application
```bash
cd /home/bitcoin-ai/AI_assistant
git pull origin main
source .venv/bin/activate
pip install -r requirements.txt
cd btc_assistant/frontend
npm install
npm run build
cd ../..
sudo systemctl restart bitcoin-ai-auth
sudo systemctl restart bitcoin-ai-main
```

### Backup Database (Optional - MongoDB Atlas handles this)
```bash
# Your MongoDB Atlas handles backups automatically
# No additional backup needed for database
```

## 🎉 10. Final Verification

### Test Endpoints
```bash
curl https://yourdomain.com/health
curl https://yourdomain.com/api/auth/health
```

### Monitor Performance
- **CPU Usage**: Should be < 50%
- **Memory Usage**: Should be < 6GB (on 8GB plan)
- **Response Time**: Should be < 500ms

## 💰 Cost Breakdown
- **Contabo VPS 10**: €4.50/month
- **Domain (Namecheap)**: ~$10/year
- **SSL Certificate**: FREE (Let's Encrypt)
- **Total Monthly**: ~€5.33/month ($5.80/month)

## 🆘 Troubleshooting

### Service Won't Start
```bash
sudo systemctl status bitcoin-ai-main
sudo journalctl -u bitcoin-ai-main --since "10 minutes ago"
```

### Nginx Issues
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Domain Not Resolving
- Check DNS propagation: https://dnschecker.org
- Verify A records point to correct IP
- Wait 24-48 hours for full propagation

### Performance Issues
```bash
# Check resource usage
htop
iostat 1 5
iotop

# Optimize if needed
sudo sysctl vm.swappiness=10
```

## 🎯 Success Indicators
✅ Services running: `systemctl status bitcoin-ai-*`
✅ Website accessible: `https://yourdomain.com`
✅ API working: `https://yourdomain.com/api/health`
✅ SSL active: Green lock in browser
✅ Trading signals generating: Check logs
✅ MongoDB connected: Check application logs

Your Bitcoin Trading AI is now live on Contabo! 🚀 