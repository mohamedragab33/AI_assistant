import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Zap, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const SystemMonitoring = () => {
  const [systemHealth, setSystemHealth] = useState(null);
  const [services, setServices] = useState({});
  const [bitcoinPrice, setBitcoinPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchSystemData = async () => {
    try {
      const response = await fetch('http://localhost:8001/health');
      const data = await response.json();
      
      setSystemHealth(data);
      setServices(data.services || {});
      setBitcoinPrice(data.bitcoin_price);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching system health:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
    const interval = setInterval(fetchSystemData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getServiceStatus = (status) => {
    switch (status) {
      case 'active':
        return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-600' };
      case 'warning':
        return { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-900/20', border: 'border-amber-600' };
      case 'error':
        return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-600' };
      default:
        return { icon: XCircle, color: 'text-gray-400', bg: 'bg-gray-900/20', border: 'border-gray-600' };
    }
  };

  const serviceDescriptions = {
    'feature_engineering': 'Bitcoin Feature Engineering - 78+ indicators',
    'market_regime_detector': 'Market Regime Detection - Bull/Bear/Consolidation',
    'order_flow': 'Order Flow Analysis - Buy/Sell pressure',
    'whale_predictor': 'Whale Activity Prediction - Large wallet movements',
    'lightning_tracker': 'Lightning Network Health Monitoring',
    'miner_capitulation': 'Miner Capitulation Detection - Hash rate analysis',
    'hodl_wave': 'HODL Wave Analysis - Long-term holder behavior',
    'dominance_analyzer': 'Bitcoin Dominance Analysis - Market share',
    'compliance_engine': 'Regulatory Compliance Engine'
  };

  const formatUptime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const now = new Date();
    const start = new Date(timestamp);
    const diffMs = now - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m`;
    }
    return `${diffMins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-700 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto mb-4"></div>
          <p className="text-lg text-gray-300">Loading System Status...</p>
        </div>
      </div>
    );
  }

  const activeServices = Object.entries(services).filter(([_, status]) => status === 'active').length;
  const totalServices = Object.keys(services).length;
  const systemHealthPercent = totalServices > 0 ? Math.round((activeServices / totalServices) * 100) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent mb-2">
          🔍 System Monitoring
        </h1>
        <p className="text-gray-400">
          Real-time monitoring of all Bitcoin Elite Trading AI services
        </p>
        {lastUpdate && (
          <div className="text-sm text-gray-500 mt-2">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Overall System Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center mb-2">
            <Activity className="w-5 h-5 text-red-400 mr-2" />
            <h3 className="text-lg font-bold text-red-400">System Health</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{systemHealthPercent}%</div>
          <div className="text-sm text-gray-400">{activeServices}/{totalServices} services active</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
            <div 
              className={`h-2 rounded-full ${systemHealthPercent >= 80 ? 'bg-green-400' : systemHealthPercent >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
              style={{ width: `${systemHealthPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center mb-2">
            <Server className="w-5 h-5 text-blue-400 mr-2" />
            <h3 className="text-lg font-bold text-blue-400">Server Status</h3>
          </div>
          <div className="text-2xl font-bold text-green-400 mb-1">
            {systemHealth?.status === 'healthy' ? 'ONLINE' : 'OFFLINE'}
          </div>
          <div className="text-sm text-gray-400">Backend API</div>
        </div>

        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center mb-2">
            <Database className="w-5 h-5 text-purple-400 mr-2" />
            <h3 className="text-lg font-bold text-purple-400">Bitcoin Price</h3>
          </div>
          <div className="text-2xl font-bold text-amber-400 mb-1">
            ${bitcoinPrice?.toLocaleString() || 'N/A'}
          </div>
          <div className="text-sm text-gray-400">Real-time from Binance</div>
        </div>

        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center mb-2">
            <Zap className="w-5 h-5 text-yellow-400 mr-2" />
            <h3 className="text-lg font-bold text-yellow-400">Uptime</h3>
          </div>
          <div className="text-2xl font-bold text-cyan-400 mb-1">
            {formatUptime(systemHealth?.timestamp)}
          </div>
          <div className="text-sm text-gray-400">Since last restart</div>
        </div>
      </div>

      {/* Service Status Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Service Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(services).map(([serviceName, status]) => {
            const statusConfig = getServiceStatus(status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div 
                key={serviceName}
                className={`p-4 rounded-xl border ${statusConfig.bg} ${statusConfig.border}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white capitalize">
                    {serviceName.replace(/_/g, ' ')}
                  </h3>
                  <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                </div>
                <p className="text-sm text-gray-400 mb-2">
                  {serviceDescriptions[serviceName] || 'Bitcoin trading service'}
                </p>
                <div className={`text-sm font-medium ${statusConfig.color}`}>
                  {status.toUpperCase()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-bold text-cyan-400 mb-4">API Endpoints Status</h3>
          <div className="space-y-3">
            {[
              { endpoint: '/health', status: 'active', description: 'System health check' },
              { endpoint: '/api/bitcoin/price', status: 'active', description: 'Bitcoin price feed' },
              { endpoint: '/api/trading/precision-signal', status: 'active', description: 'Precision trading signals' },
              { endpoint: '/api/signals/multi-timeframe', status: 'active', description: 'Multi-timeframe analysis' },
              { endpoint: '/api/bitcoin/elite-analytics', status: 'active', description: 'Elite analytics data' }
            ].map((api, index) => {
              const statusConfig = getServiceStatus(api.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium text-white">{api.endpoint}</div>
                    <div className="text-sm text-gray-400">{api.description}</div>
                  </div>
                  <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-bold text-green-400 mb-4">System Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Environment:</span>
              <span className="text-white">Production</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Backend Port:</span>
              <span className="text-white">8001</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">API Version:</span>
              <span className="text-white">3.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Framework:</span>
              <span className="text-white">FastAPI</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Database:</span>
              <span className="text-white">MongoDB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Price Source:</span>
              <span className="text-white">Binance API</span>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center mt-8">
        <button
          onClick={fetchSystemData}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
        >
          Refresh System Status
        </button>
      </div>
    </div>
  );
};

export default SystemMonitoring; 