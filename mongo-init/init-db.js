// MongoDB Initialization Script for Bitcoin Trading Assistant
// This script creates collections and indexes for optimal performance

db = db.getSiblingDB('btc_trading');

// Create collections with schema validation
print('🚀 Initializing Bitcoin Trading Assistant Database...');

// 1. Trading Signals Collection
db.createCollection('trading_signals', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["trade_id", "timestamp", "action", "timeframe", "entry_price", "confidence"],
      properties: {
        trade_id: { bsonType: "string" },
        timestamp: { bsonType: "date" },
        action: { enum: ["Buy", "Sell", "Wait"] },
        timeframe: { enum: ["15m", "1h", "4h", "1d"] },
        entry_price: { bsonType: "double" },
        stop_loss: { bsonType: "double" },
        take_profit: { bsonType: "double" },
        confidence: { bsonType: "double", minimum: 0, maximum: 100 },
        prediction_method: { enum: ["rule_based", "ai_based", "hybrid"] },
        result: { enum: ["Win", "Loss", "Pending", "Expired"] },
        profit_loss_usd: { bsonType: "double" }
      }
    }
  }
});

// 2. AI Training Data Collection
db.createCollection('ai_training_data', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["timestamp", "indicators", "outcome", "timeframe"],
      properties: {
        timestamp: { bsonType: "date" },
        indicators: { bsonType: "object" },
        outcome: { enum: ["buy", "sell", "wait"] },
        timeframe: { bsonType: "string" },
        market_conditions: { bsonType: "object" },
        features: { bsonType: "array" }
      }
    }
  }
});

// 3. Price History Collection
db.createCollection('price_history', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["timestamp", "symbol", "timeframe", "open", "high", "low", "close", "volume"],
      properties: {
        timestamp: { bsonType: "date" },
        symbol: { bsonType: "string" },
        timeframe: { bsonType: "string" },
        open: { bsonType: "double" },
        high: { bsonType: "double" },
        low: { bsonType: "double" },
        close: { bsonType: "double" },
        volume: { bsonType: "double" }
      }
    }
  }
});

// 4. Computed Indicators Collection (Feature Store)
db.createCollection('computed_indicators', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["timestamp", "symbol", "timeframe", "indicators"],
      properties: {
        timestamp: { bsonType: "date" },
        symbol: { bsonType: "string" },
        timeframe: { bsonType: "string" },
        indicators: { bsonType: "object" },
        computation_time: { bsonType: "double" }
      }
    }
  }
});

// 5. AI Model Performance Collection
db.createCollection('model_performance', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["timestamp", "model_name", "accuracy", "precision", "recall"],
      properties: {
        timestamp: { bsonType: "date" },
        model_name: { bsonType: "string" },
        model_version: { bsonType: "string" },
        accuracy: { bsonType: "double", minimum: 0, maximum: 1 },
        precision: { bsonType: "double", minimum: 0, maximum: 1 },
        recall: { bsonType: "double", minimum: 0, maximum: 1 },
        f1_score: { bsonType: "double", minimum: 0, maximum: 1 },
        training_samples: { bsonType: "int" },
        feature_importance: { bsonType: "object" }
      }
    }
  }
});

// 6. System Configuration Collection
db.createCollection('system_config', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["config_key", "config_value", "updated_at"],
      properties: {
        config_key: { bsonType: "string" },
        config_value: {},
        updated_at: { bsonType: "date" },
        description: { bsonType: "string" }
      }
    }
  }
});

print('📊 Creating optimized indexes...');

// Create indexes for optimal query performance
// Trading Signals indexes
db.trading_signals.createIndex({ "timestamp": -1 });
db.trading_signals.createIndex({ "trade_id": 1 }, { unique: true });
db.trading_signals.createIndex({ "action": 1, "timestamp": -1 });
db.trading_signals.createIndex({ "result": 1, "timestamp": -1 });
db.trading_signals.createIndex({ "prediction_method": 1, "timestamp": -1 });

// AI Training Data indexes
db.ai_training_data.createIndex({ "timestamp": -1 });
db.ai_training_data.createIndex({ "outcome": 1, "timestamp": -1 });
db.ai_training_data.createIndex({ "timeframe": 1, "timestamp": -1 });

// Price History indexes
db.price_history.createIndex({ "timestamp": -1, "symbol": 1, "timeframe": 1 });
db.price_history.createIndex({ "symbol": 1, "timeframe": 1, "timestamp": -1 });

// Computed Indicators indexes
db.computed_indicators.createIndex({ "timestamp": -1, "symbol": 1, "timeframe": 1 });
db.computed_indicators.createIndex({ "symbol": 1, "timeframe": 1, "timestamp": -1 });

// Model Performance indexes
db.model_performance.createIndex({ "timestamp": -1 });
db.model_performance.createIndex({ "model_name": 1, "timestamp": -1 });

// System Config indexes
db.system_config.createIndex({ "config_key": 1 }, { unique: true });

print('⚙️ Inserting default configuration...');

// Insert default system configuration
db.system_config.insertMany([
  {
    config_key: "ai_model_weights",
    config_value: {
      "random_forest": 0.35,
      "gradient_boost": 0.35,
      "neural_network": 0.30
    },
    updated_at: new Date(),
    description: "AI ensemble model weights"
  },
  {
    config_key: "hybrid_weights",
    config_value: {
      "rule_based": 0.60,
      "ai_based": 0.40
    },
    updated_at: new Date(),
    description: "Hybrid predictor weights"
  },
  {
    config_key: "risk_reward_ratios",
    config_value: {
      "15m": { "high_confidence": 1.5, "medium_confidence": 1.2, "low_confidence": 1.0 },
      "1h": { "high_confidence": 2.5, "medium_confidence": 2.0, "low_confidence": 1.5 },
      "4h": { "high_confidence": 4.0, "medium_confidence": 3.0, "low_confidence": 2.5 },
      "1d": { "high_confidence": 5.0, "medium_confidence": 4.0, "low_confidence": 3.0 }
    },
    updated_at: new Date(),
    description: "Risk/reward ratios by timeframe and confidence"
  },
  {
    config_key: "feature_names",
    config_value: [
      "price_sma_ratio", "price_ema_ratio", "sma_ema_divergence",
      "rsi_norm", "stoch_norm", "williams_norm", "cci_norm", "mfi_norm",
      "macd_divergence", "adx_norm", "bb_position", "volatility_ratio",
      "cmf", "volume_osc_norm", "price_range_position"
    ],
    updated_at: new Date(),
    description: "AI feature names for ML models"
  }
]);

print('✅ Bitcoin Trading Assistant Database initialized successfully!');
print('📋 Collections created:');
print('   - trading_signals: Store all trading signals and outcomes');
print('   - ai_training_data: Historical data for AI model training');
print('   - price_history: Historical price and volume data');
print('   - computed_indicators: Cached indicator calculations');
print('   - model_performance: AI model accuracy tracking');
print('   - system_config: Application configuration');
print('🚀 Database is ready for the trading assistant!'); 