# 🐳 MongoDB Docker Setup for Bitcoin Trading Assistant

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install MongoDB Python drivers
pip install -r btc_assistant/requirements_mongo.txt
```

### 2. Start MongoDB Services

```bash
# Start MongoDB and admin interface
docker-compose up -d

# View logs
docker-compose logs -f mongodb
```

### 3. Verify Setup

```bash
# Check if containers are running
docker ps

# Test MongoDB connection
docker exec -it btc_trading_db mongosh -u admin -p trading_password_2024 --authenticationDatabase admin
```

## 📊 Services Overview

| Service | Port | Description | Access |
|---------|------|-------------|--------|
| **MongoDB** | 27017 | Main database | `mongodb://admin:trading_password_2024@localhost:27017/btc_trading` |
| **Mongo Express** | 8081 | Web admin UI | http://localhost:8081 (admin/admin) |
| **Redis** | 6379 | Caching (optional) | `redis://localhost:6379` |

## 🗄️ Database Collections

### 1. **trading_signals** - All Trading Signals
```javascript
{
  "trade_id": "BTC_20240601_001",
  "timestamp": ISODate("2024-06-01T10:30:00Z"),
  "action": "Buy",
  "timeframe": "15m",
  "entry_price": 68250.50,
  "stop_loss": 67800.00,
  "take_profit": 69100.00,
  "confidence": 78.5,
  "prediction_method": "hybrid",
  "result": "Pending",
  "indicators": { /* full indicator data */ },
  "signals_breakdown": { /* signal analysis */ }
}
```

### 2. **ai_training_data** - ML Training Samples
```javascript
{
  "timestamp": ISODate("2024-06-01T10:30:00Z"),
  "indicators": { /* 30+ indicators */ },
  "features": [0.15, -0.23, 0.67, ...], // 15 ML features
  "outcome": "buy", // actual result
  "timeframe": "15m",
  "market_conditions": { /* volatility, volume etc */ }
}
```

### 3. **price_history** - Historical Price Data
```javascript
{
  "timestamp": ISODate("2024-06-01T10:30:00Z"),
  "symbol": "BTCUSDT",
  "timeframe": "15m",
  "open": 68200.00,
  "high": 68350.00,
  "low": 68150.00,
  "close": 68250.00,
  "volume": 125.45
}
```

### 4. **computed_indicators** - Feature Store
```javascript
{
  "timestamp": ISODate("2024-06-01T10:30:00Z"),
  "symbol": "BTCUSDT", 
  "timeframe": "15m",
  "indicators": {
    "rsi": 65.4,
    "macd": 0.23,
    "bollinger_upper": 69500.00,
    // ... all 30+ indicators
  },
  "computation_time": 0.156 // seconds
}
```

### 5. **model_performance** - AI Model Tracking
```javascript
{
  "timestamp": ISODate("2024-06-01T10:30:00Z"),
  "model_name": "random_forest",
  "model_version": "v1.0",
  "accuracy": 0.72,
  "precision": 0.68,
  "recall": 0.75,
  "f1_score": 0.71,
  "training_samples": 500,
  "feature_importance": {
    "rsi_norm": 0.15,
    "macd_divergence": 0.12,
    // ...
  }
}
```

## 🔧 Configuration

### Environment Variables

```bash
# .env file (optional)
MONGODB_URL=mongodb://admin:trading_password_2024@localhost:27017/btc_trading?authSource=admin
MONGODB_DB=btc_trading
REDIS_URL=redis://:cache_password_2024@localhost:6379/0
```

### Security Settings

**Default Credentials:**
- MongoDB: `admin / trading_password_2024`
- Mongo Express: `admin / admin`
- Redis: `cache_password_2024`

**🔒 For Production:**
1. Change all passwords in `docker-compose.yml`
2. Use environment variables
3. Enable SSL/TLS
4. Restrict network access

## 🚀 Integration with Trading Assistant

### 1. Update Your AI Models

```python
# Enhanced AI predictor with persistence
from database.repositories import ai_training_repo, model_performance_repo

# Save training sample automatically
await ai_training_repo.add_training_sample({
    "timestamp": datetime.utcnow(),
    "indicators": indicators,
    "outcome": "buy",  # actual result
    "timeframe": "15m",
    "features": extracted_features
})

# Track model performance
await model_performance_repo.save_performance({
    "timestamp": datetime.utcnow(),
    "model_name": "random_forest",
    "accuracy": 0.72,
    "precision": 0.68,
    "recall": 0.75,
    "training_samples": len(training_data)
})
```

### 2. Enhanced Signal Storage

```python
# Store every signal with full context
from database.repositories import trading_signal_repo

signal_id = await trading_signal_repo.create_signal({
    "trade_id": trade_id,
    "timestamp": datetime.utcnow(),
    "action": "Buy",
    "timeframe": "15m",
    "entry_price": 68250.50,
    "confidence": 78.5,
    "prediction_method": "hybrid",
    "indicators": full_indicators,
    "signals_breakdown": signal_analysis
})
```

### 3. Real-time Analytics

```python
# Get performance statistics
stats = await trading_signal_repo.get_performance_stats(days=30)
print(f"Win Rate: {stats['win_rate']:.1f}%")
print(f"Total Signals: {stats['total_signals']}")
print(f"Total P&L: ${stats['total_pnl']:.2f}")

# Get AI training data statistics
training_stats = await ai_training_repo.get_training_stats()
print(f"Training Samples: {training_stats['total']}")
print(f"Buy/Sell/Wait: {training_stats['buy']}/{training_stats['sell']}/{training_stats['wait']}")
```

## 📈 Benefits for AI System

### 1. **Persistent Learning**
- AI models remember all historical data
- Continuous improvement with every trade
- No data loss between restarts

### 2. **Advanced Analytics**  
- Track model performance over time
- Identify best-performing timeframes
- A/B test different strategies

### 3. **Feature Store**
- Cache computed indicators
- Faster signal generation
- Consistent feature engineering

### 4. **Backtesting Ready**
- Historical price data storage
- Replay signals with real data
- Validate strategy performance

## 🔄 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services  
docker-compose down

# View logs
docker-compose logs -f mongodb
docker-compose logs -f mongo-express

# Restart services
docker-compose restart

# Update services
docker-compose pull
docker-compose up -d

# Backup database
docker exec btc_trading_db mongodump --username admin --password trading_password_2024 --authenticationDatabase admin --out /backup

# Restore database
docker exec btc_trading_db mongorestore --username admin --password trading_password_2024 --authenticationDatabase admin /backup
```

## 🔍 Monitoring & Maintenance

### Database Health Check

```bash
# Check database status
curl -s http://127.0.0.1:8000/api/database-health
```

### Performance Monitoring

```bash
# MongoDB stats
docker exec -it btc_trading_db mongosh -u admin -p trading_password_2024 --authenticationDatabase admin --eval "db.stats()"

# Collection sizes
docker exec -it btc_trading_db mongosh -u admin -p trading_password_2024 --authenticationDatabase admin btc_trading --eval "db.trading_signals.stats()"
```

### Data Cleanup

```bash
# Remove old training data (keep last 1000 samples)
docker exec -it btc_trading_db mongosh -u admin -p trading_password_2024 --authenticationDatabase admin btc_trading --eval "
db.ai_training_data.deleteMany({
  timestamp: { \$lt: new Date(Date.now() - 30*24*60*60*1000) }
})"
```

## 🎯 Next Steps

1. **Start MongoDB**: `docker-compose up -d`
2. **Install dependencies**: `pip install -r btc_assistant/requirements_mongo.txt`  
3. **Test integration**: Generate a signal and check Mongo Express
4. **Monitor performance**: Check AI model improvements over time
5. **Optimize**: Use Redis caching for frequently accessed data

Your trading assistant now has **enterprise-grade data persistence** and **AI learning capabilities**! 🚀 