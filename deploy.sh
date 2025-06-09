#!/bin/bash

# 🚀 Bitcoin Trading AI Deployment Script
# Usage: ./deploy.sh [environment]
# Environment: staging | production | local

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
PROJECT_NAME="bitcoin-trading-ai"
DOCKER_IMAGE="ghcr.io/mohamedragab33/ai_assistant/bitcoin-trading-ai"

echo -e "${BLUE}🚀 Starting Bitcoin Trading AI deployment...${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    if [ ! -f ".env" ]; then
        log_warning ".env file not found, copying from env.example"
        cp env.example .env
        log_warning "Please edit .env file with your configuration"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Build Docker image
build_image() {
    log_info "Building Docker image..."
    
    docker build -t ${DOCKER_IMAGE}:latest .
    
    log_success "Docker image built successfully"
}

# Deploy based on environment
deploy_staging() {
    log_info "Deploying to staging..."
    
    docker-compose -f docker-compose.yml down
    docker-compose -f docker-compose.yml pull
    docker-compose -f docker-compose.yml up -d
    
    log_success "Staging deployment completed"
}

deploy_production() {
    log_info "Deploying to production..."
    
    # Create SSL directory if it doesn't exist
    mkdir -p ssl
    
    # Generate self-signed SSL certificate if not exists
    if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
        log_info "Generating self-signed SSL certificate..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    fi
    
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml pull
    docker-compose -f docker-compose.prod.yml up -d
    
    log_success "Production deployment completed"
}

deploy_local() {
    log_info "Deploying locally for development..."
    
    docker-compose down
    docker-compose build
    docker-compose up -d
    
    log_success "Local deployment completed"
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:8000/health &> /dev/null; then
            log_success "Health check passed"
            return 0
        fi
        
        log_info "Attempt $attempt/$max_attempts: Waiting for service to be ready..."
        sleep 10
        ((attempt++))
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# Show deployment info
show_deployment_info() {
    log_info "Deployment Information:"
    echo "=================================="
    echo "Environment: $ENVIRONMENT"
    echo "Frontend URL: http://localhost:3000"
    echo "API URL: http://localhost:8000"
    echo "Auth API URL: http://localhost:8001"
    echo "=================================="
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "Production URLs:"
        echo "Frontend: https://localhost (if SSL configured)"
        echo "API: https://localhost/api"
        echo "Auth: https://localhost/api/auth"
        echo "=================================="
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up old containers and images..."
    docker system prune -f
    log_success "Cleanup completed"
}

# Main deployment process
main() {
    check_prerequisites
    
    case $ENVIRONMENT in
        staging)
            build_image
            deploy_staging
            ;;
        production)
            build_image
            deploy_production
            ;;
        local)
            deploy_local
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT"
            echo "Usage: $0 [staging|production|local]"
            exit 1
            ;;
    esac
    
    health_check
    show_deployment_info
    cleanup
    
    log_success "🎉 Bitcoin Trading AI deployed successfully!"
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main 