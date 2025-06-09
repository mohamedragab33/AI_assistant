#!/bin/bash

# 🚀 Bitcoin Trading AI - Contabo VPS Automated Deployment Script
# Usage: bash deploy_contabo.sh your-domain.com

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if domain provided
if [ $# -eq 0 ]; then
    echo -e "${RED}Error: Please provide your domain name${NC}"
    echo "Usage: bash deploy_contabo.sh your-domain.com"
    exit 1
fi

DOMAIN=$1
echo -e "${BLUE}🚀 Starting Bitcoin Trading AI deployment on Contabo VPS${NC}"
echo -e "${BLUE}Domain: ${DOMAIN}${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (or with sudo)"
    exit 1
fi

print_status "1. Updating system packages..."
apt update && apt upgrade -y
apt install -y curl wget git nginx certbot python3-certbot-nginx htop

print_status "2. Creating bitcoin-ai user..."
if ! id "bitcoin-ai" &>/dev/null; then
    adduser --disabled-password --gecos "" bitcoin-ai
    usermod -aG sudo bitcoin-ai
fi

print_status "3. Installing Python 3.9+..."
apt install -y python3.9 python3.9-venv python3-pip

print_status "4. Installing Node.js 18+..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

print_status "5. Switching to bitcoin-ai user and cloning repository..."
sudo -u bitcoin-ai bash << 'EOF'
cd /home/bitcoin-ai
if [ ! -d "AI_assistant" ]; then
    git clone https://github.com/mohamedragab33/AI_assistant.git
fi
cd AI_assistant

print_status "6. Setting up Python environment..."
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

print_status "7. Building frontend..."
cd btc_assistant/frontend
npm install
npm run build
cd ../..

print_status "8. Creating production environment file..."
cat > .env.production << 'ENVEOF'
# Database
MONGODB_URL=mongodb+srv://admin:SecureBitcoinAI2024!@cluster0.shv9yzq.mongodb.net/btc_trading?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB=btc_trading

# Security  
JWT_SECRET_KEY=bitcoin_elite_trading_jwt_secret_key_2024_secure_32_chars

# Server Configuration
NODE_ENV=production
PORT=8000
AUTH_PORT=8001
ENVEOF

EOF

print_status "9. Creating Nginx configuration..."
cat > /etc/nginx/sites-available/bitcoin-ai << NGINXEOF
server {
    server_name ${DOMAIN} www.${DOMAIN};
    
    # Frontend (React Build)
    location / {
        root /home/bitcoin-ai/AI_assistant/btc_assistant/frontend/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
    
    # API Routes (Main Server)
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Auth Routes
    location /api/auth/ {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Health Check
    location /health {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/bitcoin-ai /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

print_status "10. Creating systemd services..."

# Auth service
cat > /etc/systemd/system/bitcoin-ai-auth.service << 'AUTHEOF'
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
AUTHEOF

# Main service
cat > /etc/systemd/system/bitcoin-ai-main.service << 'MAINEOF'
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
MAINEOF

systemctl daemon-reload
systemctl enable bitcoin-ai-auth
systemctl enable bitcoin-ai-main
systemctl start bitcoin-ai-auth
sleep 5
systemctl start bitcoin-ai-main

print_status "11. Setting up SSL certificate..."
print_warning "Make sure your domain DNS points to this server IP before continuing!"
echo -e "${YELLOW}Your server IP: $(curl -s ifconfig.me)${NC}"
echo -e "${YELLOW}Press Enter when DNS is configured, or Ctrl+C to skip SSL for now${NC}"
read -r

if certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN}; then
    print_status "SSL certificate installed successfully!"
    
    # Setup auto-renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
else
    print_warning "SSL installation failed. You can run it manually later:"
    echo "sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
fi

print_status "12. Final verification..."
sleep 10

# Check services
if systemctl is-active --quiet bitcoin-ai-auth; then
    print_status "Auth server is running"
else
    print_error "Auth server failed to start"
    systemctl status bitcoin-ai-auth
fi

if systemctl is-active --quiet bitcoin-ai-main; then
    print_status "Main server is running"
else
    print_error "Main server failed to start"
    systemctl status bitcoin-ai-main
fi

echo -e "${GREEN}"
echo "🎉====================================🎉"
echo "   Bitcoin Trading AI Deployment Complete!"
echo "🎉====================================🎉"
echo -e "${NC}"

echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo -e "🌐 Website: https://${DOMAIN}"
echo -e "🔧 API Health: https://${DOMAIN}/health"
echo -e "🔐 Auth Health: https://${DOMAIN}/api/auth/health"
echo -e "💰 Total Cost: ~€5.33/month (Contabo VPS + Domain)"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Test your website: https://${DOMAIN}"
echo "2. Login with credentials: midoo_ragab / 07091998"
echo "3. Monitor logs: sudo journalctl -u bitcoin-ai-main -f"
echo "4. Check resources: htop"
echo ""
echo -e "${GREEN}🎯 Your Bitcoin Trading AI is now LIVE! 🚀${NC}" 