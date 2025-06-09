import React, { useState, useEffect } from 'react';
import { tradingAPI } from '../services/api';

const TradeHistory = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTradeHistory = async () => {
    try {
      const response = await tradingAPI.getTradeHistory();
      setTrades(response.data || []);
    } catch (error) {
      console.error('Error fetching trade history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTradeHistory();
    
    // Refresh trade history every 15 seconds
    const interval = setInterval(fetchTradeHistory, 15000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getSignalColor = (action) => {
    return action === 'Buy' ? 'text-crypto-green' : 'text-crypto-red';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 70) return 'text-crypto-green';
    if (confidence >= 50) return 'text-crypto-gold';
    return 'text-crypto-red';
  };

  const getSignalIcon = (action) => {
    return action === 'Buy' ? '📈' : '📉';
  };

  if (loading) {
    return (
      <div className="trading-card">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trading-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-300">Trading Signal History</h3>
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-sm">Total: {trades.length}</span>
          <div className="text-2xl">📊</div>
        </div>
      </div>

      {trades.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📈</div>
          <p className="text-slate-400">No trading signals yet</p>
          <p className="text-slate-500 text-sm mt-2">Signals will appear here as they are generated</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {trades.slice().reverse().map((trade, index) => (
            <div key={trade.trade_id || index} className="p-4 bg-slate-700 bg-opacity-50 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getSignalIcon(trade.action)}</span>
                  <div>
                    <div className={`font-bold ${getSignalColor(trade.action)}`}>
                      {trade.action} Signal
                    </div>
                    <div className="text-xs text-slate-400">
                      {trade.trade_id} • {trade.timeframe}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-mono">
                    {formatPrice(trade.entry_price)}
                  </div>
                  <div className={`text-sm font-bold ${getConfidenceColor(trade.confidence)}`}>
                    {trade.confidence}% confidence
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-sm">
                <div className="text-center">
                  <div className="text-slate-400 text-xs">Stop Loss</div>
                  <div className="text-crypto-red font-medium">
                    {formatPrice(trade.stop_loss)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-slate-400 text-xs">Take Profit</div>
                  <div className="text-crypto-green font-medium">
                    {formatPrice(trade.take_profit)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-slate-400 text-xs">Expected P/L</div>
                  <div className="text-white font-medium">
                    {formatPrice(trade.expected_profit_usd || 0)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-slate-400 text-xs">Timer</div>
                  <div className="text-crypto-blue font-medium">
                    {trade.timer_minutes}min
                  </div>
                </div>
              </div>

              {trade.timestamp && (
                <div className="mt-3 pt-2 border-t border-slate-600">
                  <div className="text-xs text-slate-400 text-center">
                    Generated: {new Date(trade.timestamp).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {trades.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-slate-400">Buy Signals</div>
              <div className="text-crypto-green font-bold">
                {trades.filter(t => t.action === 'Buy').length}
              </div>
            </div>
            <div>
              <div className="text-slate-400">Sell Signals</div>
              <div className="text-crypto-red font-bold">
                {trades.filter(t => t.action === 'Sell').length}
              </div>
            </div>
            <div>
              <div className="text-slate-400">Avg. Confidence</div>
              <div className="text-crypto-blue font-bold">
                {trades.length > 0 
                  ? (trades.reduce((sum, t) => sum + t.confidence, 0) / trades.length).toFixed(1)
                  : 0
                }%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeHistory; 