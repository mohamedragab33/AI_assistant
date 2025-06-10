#!/bin/bash

# 🚀 Bitcoin Trading AI - VPS Setup Script (Fixed for Ubuntu 24.04)
# Run on Contabo VPS: Ubuntu 24.04 LTS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo -e "${BLUE}🚀 Starting Bitcoin Trading AI VPS Setup${NC}"
echo -e "${BLUE}VPS: Contabo Cloud VPS 10 NVMe${NC}"
echo -e "${BLUE}Location: Karlsruhe, EU${NC}"

# 1. System Update
print_info "Updating system packages..."
apt update && apt upgrade -y
print_status "System updated successfully"

# 2. Install essential packages (using default Python 3.12)
print_info "Installing essential packages..."
apt install -y curl wget git nginx certbot python3-certbot-nginx \
    python3 python3-venv python3-pip build-essential \
    software-properties-common ufw htop nano
print_status "Essential packages installed"

# Check Python version
python3 --version
print_status "Python installed: $(python3 --version)"

# 3. Install Node.js 18+
print_info "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
node --version
npm --version
print_status "Node.js installed successfully"

# 4. Create non-root user for security
print_info "Creating bitcoin-ai user..."
if ! id -u bitcoin-ai >/dev/null 2>&1; then
    adduser --disabled-password --gecos "" bitcoin-ai
    usermod -aG sudo bitcoin-ai
    print_status "User bitcoin-ai created"
else
    print_warning "User bitcoin-ai already exists"
fi

# 5. Setup firewall (basic security)
print_info "Configuring firewall..."
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 22
ufw allow 80
ufw allow 443
print_status "Firewall configured"

# 6. Clone Bitcoin Trading AI repository
print_info "Cloning Bitcoin Trading AI repository..."
cd /home/bitcoin-ai
if [ ! -d "AI_assistant" ]; then
    git clone https://github.com/mohamedragab33/AI_assistant.git
    chown -R bitcoin-ai:bitcoin-ai AI_assistant
    print_status "Repository cloned successfully"
else
    print_warning "Repository already exists, pulling latest changes..."
    cd AI_assistant
    sudo -u bitcoin-ai git pull
    cd ..
    chown -R bitcoin-ai:bitcoin-ai AI_assistant
fi

# 7. Setup Python environment (using default Python 3)
print_info "Setting up Python virtual environment..."
cd /home/bitcoin-ai/AI_assistant
sudo -u bitcoin-ai python3 -m venv .venv
sudo -u bitcoin-ai .venv/bin/pip install --upgrade pip
sudo -u bitcoin-ai .venv/bin/pip install -r requirements.txt
print_status "Python environment setup complete"

# 8. Install React dependencies and build
print_info "Setting up React frontend..."
cd /home/bitcoin-ai/AI_assistant/frontend
sudo -u bitcoin-ai npm install
sudo -u bitcoin-ai npm run build
print_status "React frontend built successfully"

# 9. Create environment file
print_info "Creating production environment file..."
cd /home/bitcoin-ai/AI_assistant
cat > .env << 'EOF'
NODE_ENV=production
MONGODB_URL=mongodb+srv://admin:SecureBitcoinAI2024!@cluster0.shv9yzq.mongodb.net/btc_trading?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB=btc_trading
JWT_SECRET_KEY=bitcoin_elite_trading_jwt_secret_key_2024_secure_32_chars
EOF
chown bitcoin-ai:bitcoin-ai .env
print_status "Environment file created"

# 10. Create systemd services
print_info "Creating systemd services..."

# Auth server service
cat > /etc/systemd/system/bitcoin-ai-auth.service << 'EOF'
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
EOF

# Main server service
cat > /etc/systemd/system/bitcoin-ai-main.service << 'EOF'
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
EOF

systemctl daemon-reload
systemctl enable bitcoin-ai-auth
systemctl enable bitcoin-ai-main
print_status "Systemd services created and enabled"

# 11. Configure Nginx
print_info "Configuring Nginx..."
cat > /etc/nginx/sites-available/bitcoin-ai << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Serve React frontend
    location / {
        root /home/bitcoin-ai/AI_assistant/frontend/build;
        try_files $uri $uri/ /index.html;
    }
    
    # API routes to main server
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
    
    # Auth API routes
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
}
EOF

ln -sf /etc/nginx/sites-available/bitcoin-ai /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
print_status "Nginx configured successfully"

echo
echo -e "${GREEN}🎉 Bitcoin Trading AI VPS Setup Complete!${NC}"
echo
echo -e "${BLUE}📊 Starting Services...${NC}"
systemctl start bitcoin-ai-auth
sleep 5
systemctl start bitcoin-ai-main
sleep 5

echo -e "${BLUE}📊 Service Status:${NC}"
systemctl status bitcoin-ai-auth --no-pager -l
systemctl status bitcoin-ai-main --no-pager -l

echo
echo -e "${GREEN}🚀 Your Bitcoin Trading AI is now LIVE!${NC}"
echo -e "${BLUE}🌐 Access your app at: http://45.136.18.93${NC}"
echo -e "${BLUE}📊 Login credentials: midoo_ragab / 07091998${NC}"
echo
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Configure your domain (if you have one)"
echo "2. Setup SSL certificate with Let's Encrypt"
echo "3. Monitor logs: journalctl -f -u bitcoin-ai-main"
echo
print_status "Setup completed successfully!" 