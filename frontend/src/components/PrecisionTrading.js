import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, TrendingDown, Clock, DollarSign, Shield, AlertTriangle, RefreshCw } from 'lucide-react';

const PrecisionTrading = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [precisionSignal, setPrecisionSignal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [enhancedMode, setEnhancedMode] = useState(true);
  const [tradingAdvice, setTradingAdvice] = useState(null);

  const timeframes = [
    { id: '5m', label: '5 Minutes', description: 'Scalping', color: 'text-red-400' },
    { id: '15m', label: '15 Minutes', description: 'Swing Trading', color: 'text-amber-400' },
    { id: '1h', label: '1 Hour', description: 'Position Trading', color: 'text-green-400' }
  ];

  const fetchPrecisionSignal = async (timeframe) => {
    setLoading(true);
    try {
      const endpoint = enhancedMode 
        ? `http://localhost:8001/api/trading/enhanced-precision/${timeframe}`
        : `http://localhost:8001/api/trading/precision-signal/${timeframe}`;
        
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (enhancedMode && data.enhanced_precision) {
        setPrecisionSignal(data.enhanced_precision);
        setTradingAdvice(data.trading_advice);
        setLastUpdated(new Date());
      } else if (!enhancedMode && data.precision_signal) {
        setPrecisionSignal(data.precision_signal);
        setTradingAdvice(null);
        setLastUpdated(new Date());
      } else {
        console.error('No precision signal in response:', data);
      }
    } catch (error) {
      console.error('Error fetching precision signal:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrecisionSignal(selectedTimeframe);
  }, [selectedTimeframe, enhancedMode]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchPrecisionSignal(selectedTimeframe);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [selectedTimeframe, autoRefresh, enhancedMode]);

  const getActionColor = (action) => {
    switch (action) {
      case 'BUY': return 'text-green-400 bg-green-900/20 border-green-500';
      case 'SELL': return 'text-red-400 bg-red-900/20 border-red-500';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
              🎯 Precision Trading Engine
            </h1>
            <p className="text-gray-400">
              Exact entry, take profit, and stop loss levels for maximized profitability
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setEnhancedMode(!enhancedMode)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                enhancedMode 
                  ? 'bg-purple-900/20 border-purple-500 text-purple-400' 
                  : 'bg-gray-900/20 border-gray-500 text-gray-400'
              }`}
            >
              {enhancedMode ? '🚀 Enhanced Mode' : '📊 Basic Mode'}
            </button>
            
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                autoRefresh 
                  ? 'bg-green-900/20 border-green-500 text-green-400' 
                  : 'bg-gray-900/20 border-gray-500 text-gray-400'
              }`}
            >
              <RefreshCw className={`w-4 h-4 inline mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </button>
            
            <button
              onClick={() => fetchPrecisionSignal(selectedTimeframe)}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh Signal'}
            </button>
          </div>
        </div>

        {lastUpdated && (
          <div className="text-sm text-gray-500">
            Last updated: {formatTime(lastUpdated)}
          </div>
        )}
      </div>

      {/* Timeframe Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {timeframes.map((timeframe) => (
          <button
            key={timeframe.id}
            onClick={() => setSelectedTimeframe(timeframe.id)}
            className={`p-6 rounded-xl border-2 transition-all duration-200 ${
              selectedTimeframe === timeframe.id
                ? 'border-amber-500 bg-amber-900/20'
                : 'border-gray-700 bg-gray-900/20 hover:border-gray-600'
            }`}
          >
            <div className="text-center">
              <Clock className={`w-8 h-8 mx-auto mb-2 ${selectedTimeframe === timeframe.id ? 'text-amber-400' : 'text-gray-400'}`} />
              <div className="text-lg font-bold text-white">{timeframe.label}</div>
              <div className={`text-sm ${timeframe.color}`}>{timeframe.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Precision Signal Display */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
          <span className="ml-3 text-gray-400">Generating precision signal...</span>
        </div>
      ) : precisionSignal ? (
        <div className="space-y-6">
          {/* Main Action Card */}
          <div className={`p-6 rounded-xl border-2 ${getActionColor(precisionSignal.action)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {precisionSignal.action === 'BUY' ? (
                  <TrendingUp className="w-12 h-12 text-green-400" />
                ) : precisionSignal.action === 'SELL' ? (
                  <TrendingDown className="w-12 h-12 text-red-400" />
                ) : (
                  <Target className="w-12 h-12 text-gray-400" />
                )}
                <div>
                  <div className="text-2xl font-bold text-white">
                    {precisionSignal.action} @ ${precisionSignal.entry_price}
                  </div>
                  <div className="text-gray-400">
                    {selectedTimeframe} • Confidence: <span className={getConfidenceColor(precisionSignal.confidence)}>{precisionSignal.confidence}%</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-400">Position Size</div>
                <div className="text-lg font-bold text-amber-400">${precisionSignal.position_size}</div>
                <div className="text-sm text-gray-400">Risk/Reward: {precisionSignal.risk_reward}:1</div>
              </div>
            </div>
          </div>

          {/* Trading Levels Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Take Profit Levels */}
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
                <h3 className="text-lg font-bold text-green-400">Take Profit Targets</h3>
              </div>
              <div className="space-y-3">
                {precisionSignal.take_profit?.map((target, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg border border-green-800">
                    <div>
                      <div className="text-white font-medium">TP{index + 1}: ${target.level}</div>
                      <div className="text-green-400 text-sm">{(target.weight * 100)}% of position</div>
                    </div>
                    <div className="text-green-400 font-bold">
                      {target.weight > 0.4 ? '🎯' : target.weight > 0.25 ? '📈' : '💎'}
                    </div>
                  </div>
                )) || <div className="text-gray-500">No take profit levels available</div>}
              </div>
            </div>

            {/* Stop Loss */}
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
              <div className="flex items-center mb-4">
                <Shield className="w-5 h-5 text-red-400 mr-2" />
                <h3 className="text-lg font-bold text-red-400">Risk Management</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-red-900/20 rounded-lg border border-red-800">
                  <div className="text-white font-medium">Stop Loss</div>
                  <div className="text-red-400 text-xl font-bold">${precisionSignal.stop_loss}</div>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="text-gray-400 text-sm">Max Risk</div>
                  <div className="text-amber-400 font-bold">
                    ${Math.abs(precisionSignal.entry_price - precisionSignal.stop_loss).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Market Context */}
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-400 mr-2" />
                <h3 className="text-lg font-bold text-amber-400">Market Context</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-gray-400 text-sm">Regime</div>
                  <div className="text-white font-medium">{precisionSignal.market_context?.regime_description}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Volatility</div>
                  <div className="text-amber-400 font-medium">{precisionSignal.market_context?.volatility_level}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Signal Valid Until</div>
                  <div className="text-cyan-400 font-medium">{formatTime(precisionSignal.expiration)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Triggers & Levels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Triggers */}
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-bold text-cyan-400 mb-4">Key Triggers</h3>
              <div className="space-y-2">
                {precisionSignal.key_triggers?.map((trigger, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span className="text-gray-300">{trigger}</span>
                  </div>
                )) || <div className="text-gray-500">No triggers available</div>}
              </div>
            </div>

            {/* Key Levels */}
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-bold text-purple-400 mb-4">Key Price Levels</h3>
              <div className="grid grid-cols-2 gap-2">
                {precisionSignal.market_context?.key_levels?.map((level, index) => (
                  <div key={index} className="px-3 py-2 bg-purple-900/20 rounded-lg border border-purple-800 text-center">
                    <div className="text-purple-400 font-medium">${level}</div>
                  </div>
                )) || <div className="text-gray-500 col-span-2">No levels available</div>}
              </div>
            </div>
          </div>

          {/* Trading Instructions */}
          {precisionSignal.action !== 'HOLD' && (
            <div className="bg-amber-900/20 border border-amber-600 rounded-xl p-6">
              <h3 className="text-lg font-bold text-amber-400 mb-3">📋 Trading Instructions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-bold text-white">1. Entry</div>
                  <div className="text-gray-300">Place {precisionSignal.action} order at ${precisionSignal.entry_price}</div>
                </div>
                <div>
                  <div className="font-bold text-white">2. Stop Loss</div>
                  <div className="text-gray-300">Set stop loss at ${precisionSignal.stop_loss}</div>
                </div>
                <div>
                  <div className="font-bold text-white">3. Take Profits</div>
                  <div className="text-gray-300">Scale out at {precisionSignal.take_profit?.length || 0} levels</div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Trading Advice - Only shown in enhanced mode */}
          {enhancedMode && tradingAdvice && (
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500 rounded-xl p-6">
              <h3 className="text-lg font-bold text-purple-400 mb-4">🚀 Enhanced Trading Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-purple-800/20 rounded-lg p-4">
                  <div className="text-purple-300 text-sm font-medium">Position Size</div>
                  <div className="text-white text-lg font-bold">{tradingAdvice.position_size_percentage}%</div>
                  <div className="text-purple-400 text-xs">{tradingAdvice.max_risk_per_trade}</div>
                </div>
                <div className="bg-blue-800/20 rounded-lg p-4">
                  <div className="text-blue-300 text-sm font-medium">Exit Strategy</div>
                  <div className="text-white text-sm">{tradingAdvice.exit_strategy}</div>
                </div>
                <div className="bg-indigo-800/20 rounded-lg p-4">
                  <div className="text-indigo-300 text-sm font-medium">Stop Management</div>
                  <div className="text-white text-sm">{tradingAdvice.stop_loss_management}</div>
                </div>
                <div className="bg-cyan-800/20 rounded-lg p-4">
                  <div className="text-cyan-300 text-sm font-medium">Confidence Level</div>
                  <div className={`text-lg font-bold ${getConfidenceColor(precisionSignal.confidence)}`}>
                    {precisionSignal.confidence >= 80 ? '🔥 HIGH' : precisionSignal.confidence >= 60 ? '⚡ MEDIUM' : '⚠️ LOW'}
                  </div>
                </div>
              </div>
              
              {/* Market Context in Enhanced Mode */}
              {precisionSignal.market_context && (
                <div className="mt-4 pt-4 border-t border-purple-500/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-purple-300 font-medium">Market Regime</div>
                      <div className="text-white">{precisionSignal.market_context.regime}</div>
                    </div>
                    <div>
                      <div className="text-purple-300 font-medium">Volatility</div>
                      <div className="text-amber-400">{(precisionSignal.market_context.volatility * 100).toFixed(2)}%</div>
                    </div>
                    <div>
                      <div className="text-purple-300 font-medium">Current Price</div>
                      <div className="text-cyan-400">${precisionSignal.market_context.current_price}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No precision signal available</div>
          <button
            onClick={() => fetchPrecisionSignal(selectedTimeframe)}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
          >
            Generate Signal
          </button>
        </div>
      )}
    </div>
  );
};

export default PrecisionTrading; 