import React, { useState, useEffect } from 'react';
import PriceDisplay from './PriceDisplay';
import AutoTradingControls from './AutoTradingControls';
import ManualTrading from './ManualTrading';
import AITrainingPanel from './AITrainingPanel';
import TradeHistory from './TradeHistory';
import SystemStatus from './SystemStatus';

const TradingDashboard = () => {
  const [systemHealth, setSystemHealth] = useState(null);
  const [autoTradingStatus, setAutoTradingStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch system data using the correct backend endpoints
  const fetchSystemData = async () => {
    try {
      const [healthResponse] = await Promise.all([
        fetch('http://localhost:8001/health')
      ]);
      
      const healthData = await healthResponse.json();
      setSystemHealth(healthData);
      setAutoTradingStatus({ active: false }); // Default trading status
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
        <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-700 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-lg text-gray-300">Loading Bitcoin Trading Assistant...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-gray-900/50 p-8 rounded-xl border border-red-600 text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-400 mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={fetchSystemData}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent mb-2">
          🚀 Bitcoin Trading Dashboard
        </h1>
        <p className="text-gray-400">
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
      <div className="text-center text-gray-500 text-sm">
        <p>
          🧠 AI Learning System • 📊 43+ Technical Indicators • 
          ⚡ Real-Time Signal Generation • 💾 MongoDB Integration
        </p>
      </div>
    </div>
  );
};

export default TradingDashboard; 