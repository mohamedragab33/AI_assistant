import React, { useState } from 'react';
import { tradingAPI } from '../services/api';

const ManualTrading = ({ onTradeGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('15m');
  const [lastSignal, setLastSignal] = useState(null);

  const handleGenerateSignal = async () => {
    setLoading(true);
    try {
      const response = await tradingAPI.generateManualSignal(timeframe);
      setLastSignal(response.data);
      onTradeGenerated();
    } catch (error) {
      console.error('Error generating signal:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getSignalIcon = (action) => {
    return action === 'Buy' ? '📈' : '📉';
  };

  const getSignalColor = (action) => {
    return action === 'Buy' ? 'text-crypto-green' : 'text-crypto-red';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 70) return 'text-crypto-green';
    if (confidence >= 50) return 'text-crypto-gold';
    return 'text-crypto-red';
  };

  return (
    <div className="trading-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-300">Manual Trading Signal</h3>
        <div className="text-2xl">🎯</div>
      </div>

      {/* Timeframe Selection */}
      <div className="mb-6">
        <label className="block text-sm text-slate-400 mb-2">Timeframe</label>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="trading-input"
          disabled={loading}
        >
          <option value="15m">15 Minutes</option>
          <option value="1h">1 Hour</option>
        </select>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerateSignal}
        disabled={loading}
        className={`w-full trading-button-primary mb-6 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Analyzing Market...</span>
          </div>
        ) : (
          '🚀 Generate Trading Signal'
        )}
      </button>

      {/* Last Signal Display */}
      {lastSignal && (
        <div className="space-y-4">
          <div className="border-t border-slate-700 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-300">Latest Signal</h4>
              <div className="text-xs text-slate-500">
                {lastSignal.trade_id}
              </div>
            </div>

            {/* Signal Action */}
            <div className="text-center mb-4 p-4 bg-slate-700 bg-opacity-50 rounded-lg">
              <div className="text-3xl mb-2">
                {getSignalIcon(lastSignal.action)}
              </div>
              <div className={`text-xl font-bold ${getSignalColor(lastSignal.action)} mb-1`}>
                {lastSignal.action.toUpperCase()}
              </div>
              <div className="text-2xl font-mono text-white">
                {formatPrice(lastSignal.entry_price)}
              </div>
            </div>

            {/* Signal Details */}
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div className="text-center">
                <div className="text-slate-400">Stop Loss</div>
                <div className="text-crypto-red font-medium">
                  {formatPrice(lastSignal.stop_loss)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">Take Profit</div>
                <div className="text-crypto-green font-medium">
                  {formatPrice(lastSignal.take_profit)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">Confidence</div>
                <div className={`font-bold ${getConfidenceColor(lastSignal.confidence)}`}>
                  {lastSignal.confidence}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">Timer</div>
                <div className="text-crypto-blue font-medium">
                  {lastSignal.timer_minutes}min
                </div>
              </div>
            </div>

            {/* Risk/Reward */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-slate-400">Expected Profit</div>
                <div className="text-crypto-green font-medium">
                  {formatPrice(lastSignal.expected_profit_usd)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">Expected Loss</div>
                <div className="text-crypto-red font-medium">
                  {formatPrice(lastSignal.expected_loss_usd)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-3 bg-crypto-blue bg-opacity-10 border border-crypto-blue border-opacity-30 rounded-lg">
        <div className="text-center text-sm text-crypto-blue">
          📊 Signal powered by 43+ technical indicators and AI learning
        </div>
      </div>
    </div>
  );
};

export default ManualTrading; 