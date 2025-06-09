import React, { useState, useEffect } from 'react';
import { tradingAPI } from '../services/api';
import PriceDisplay from './PriceDisplay';
import AutoTradingControls from './AutoTradingControls';
import ManualTrading from './ManualTrading';
import AITrainingPanel from './AITrainingPanel';
import TradeHistory from './TradeHistory';
import SystemStatus from './SystemStatus';

const Dashboard = () => {
  const [systemHealth, setSystemHealth] = useState(null);
  const [autoTradingStatus, setAutoTradingStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch system data
  const fetchSystemData = async () => {
    try {
      const [healthResponse, statusResponse] = await Promise.all([
        tradingAPI.getHealth(),
        tradingAPI.getAutoTradingStatus()
      ]);
      
      setSystemHealth(healthResponse.data);
      setAutoTradingStatus(statusResponse.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching system data:', err);
      setError('Failed to connect to trading system');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
    
    // Refresh system data every 5 seconds
    const interval = setInterval(fetchSystemData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="trading-card text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crypto-blue mx-auto mb-4"></div>
          <p className="text-lg">Loading Bitcoin Trading Assistant...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="trading-card text-center">
          <div className="text-crypto-red text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-crypto-red mb-2">Connection Error</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button 
            onClick={fetchSystemData}
            className="trading-button-primary"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-crypto-blue to-crypto-gold bg-clip-text text-transparent mb-2">
            🚀 Bitcoin Trading Assistant
          </h1>
          <p className="text-slate-400">
            AI-Powered Bitcoin Trading with Real-Time Signal Generation
          </p>
        </div>

        {/* System Status Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <SystemStatus 
            health={systemHealth} 
            autoTradingStatus={autoTradingStatus}
          />
          <PriceDisplay />
          <AutoTradingControls 
            status={autoTradingStatus}
            onStatusChange={fetchSystemData}
          />
        </div>

        {/* Main Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ManualTrading onTradeGenerated={fetchSystemData} />
          <AITrainingPanel />
        </div>

        {/* Trade History */}
        <div className="mb-8">
          <TradeHistory />
        </div>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm">
          <p>
            🧠 AI Learning System • 📊 43+ Technical Indicators • 
            ⚡ Real-Time Signal Generation • 💾 MongoDB Integration
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 