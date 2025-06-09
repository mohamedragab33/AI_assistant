import React, { useState } from 'react';
import { tradingAPI } from '../services/api';

const AutoTradingControls = ({ status, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [intervalSeconds, setIntervalSeconds] = useState(status?.interval_seconds || 30);

  const handleToggleAutoTrading = async () => {
    setLoading(true);
    try {
      if (status?.auto_trading_enabled) {
        await tradingAPI.stopAutoTrading();
      } else {
        await tradingAPI.startAutoTrading();
      }
      onStatusChange();
    } catch (error) {
      console.error('Error toggling auto-trading:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureInterval = async () => {
    setLoading(true);
    try {
      await tradingAPI.configureAutoTrading({
        interval_seconds: intervalSeconds,
        enabled: status?.auto_trading_enabled
      });
      setConfiguring(false);
      onStatusChange();
    } catch (error) {
      console.error('Error configuring auto-trading:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeToNext = () => {
    if (!status?.time_to_next_signal) return null;
    const minutes = Math.floor(status.time_to_next_signal / 60);
    const seconds = status.time_to_next_signal % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getAccelerationFactor = () => {
    const factor = 300 / (status?.interval_seconds || 30);
    return factor > 1 ? `${factor.toFixed(1)}x` : '1x';
  };

  return (
    <div className="trading-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-300">Auto-Trading</h3>
        <div className={`status-indicator ${status?.auto_trading_enabled ? 'status-active' : 'status-inactive'}`}>
          {status?.auto_trading_enabled ? '🤖 Active' : '⏸️ Stopped'}
        </div>
      </div>

      {/* Status Overview */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-slate-400">Interval</div>
            <div className="text-white font-medium">
              {status?.interval_description || 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-slate-400">Timeframe</div>
            <div className="text-white font-medium">
              {status?.timeframe || 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-slate-400">Total Signals</div>
            <div className="text-crypto-blue font-medium">
              {status?.total_auto_signals || 0}
            </div>
          </div>
          <div>
            <div className="text-slate-400">Acceleration</div>
            <div className="text-crypto-gold font-medium">
              {getAccelerationFactor()}
            </div>
          </div>
        </div>

        {/* Next Signal Timer */}
        {status?.auto_trading_enabled && (
          <div className="p-3 bg-slate-700 bg-opacity-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Next Signal In:</span>
              <span className="text-crypto-blue font-mono text-lg">
                {getTimeToNext() || 'Calculating...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {/* Start/Stop Button */}
        <button
          onClick={handleToggleAutoTrading}
          disabled={loading}
          className={`w-full ${
            status?.auto_trading_enabled 
              ? 'trading-button-danger' 
              : 'trading-button-success'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </div>
          ) : status?.auto_trading_enabled ? (
            '🛑 Stop Auto-Trading'
          ) : (
            '▶️ Start Auto-Trading'
          )}
        </button>

        {/* Configure Button */}
        <button
          onClick={() => setConfiguring(!configuring)}
          className="w-full trading-button-primary"
          disabled={loading}
        >
          ⚙️ Configure Interval
        </button>

        {/* Configuration Panel */}
        {configuring && (
          <div className="p-4 bg-slate-700 bg-opacity-50 rounded-lg space-y-3">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Interval (seconds): {intervalSeconds}s
              </label>
              <input
                type="range"
                min="30"
                max="300"
                value={intervalSeconds}
                onChange={(e) => setIntervalSeconds(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>30s (10x speed)</span>
                <span>300s (1x speed)</span>
              </div>
            </div>
            
            <div className="text-center text-sm text-slate-400">
              Learning Acceleration: <span className="text-crypto-gold">
                {(300 / intervalSeconds).toFixed(1)}x
              </span>
            </div>

            <button
              onClick={handleConfigureInterval}
              disabled={loading}
              className="w-full trading-button-success"
            >
              Apply Configuration
            </button>
          </div>
        )}
      </div>

      {/* AI Learning Info */}
      <div className="mt-6 p-3 bg-crypto-blue bg-opacity-10 border border-crypto-blue border-opacity-30 rounded-lg">
        <div className="text-center text-sm text-crypto-blue">
          🧠 AI Learning: {status?.ai_training_samples || 0} samples collected
        </div>
      </div>
    </div>
  );
};

export default AutoTradingControls; 