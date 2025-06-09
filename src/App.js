import React, { useState, useEffect } from 'react';
import { Bitcoin, TrendingUp, Shield, BarChart3, Settings, Activity } from 'lucide-react';
import Dashboard from './components/Dashboard';
import BitcoinElite from './components/BitcoinElite';
import RiskManagement from './components/RiskManagement';
import Analytics from './components/Analytics';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [systemStatus, setSystemStatus] = useState(null);
  const [btcPrice, setBtcPrice] = useState(null);

  useEffect(() => {
    fetchSystemStatus();
    fetchBtcPrice();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchSystemStatus();
      fetchBtcPrice();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/health');
      const data = await response.json();
      setSystemStatus(data);
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const fetchBtcPrice = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/current-price');
      const data = await response.json();
      setBtcPrice(data);
    } catch (error) {
      console.error('Error fetching BTC price:', error);
    }
  };

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'bitcoin-elite', name: '₿ Bitcoin Elite', icon: Bitcoin },
    { id: 'risk-management', name: 'Risk Management', icon: Shield },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'bitcoin-elite':
        return <BitcoinElite />;
      case 'risk-management':
        return <RiskManagement />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-bitcoin to-orange-500 rounded-lg bitcoin-glow">
                <Bitcoin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Bitcoin Elite Trading</h1>
                <p className="text-xs text-slate-400">Professional Trading Assistant</p>
              </div>
            </div>

            {/* System Status */}
            <div className="flex items-center space-x-6">
              {/* BTC Price */}
              {btcPrice && (
                <div className="flex items-center space-x-2">
                  <Bitcoin className="w-5 h-5 text-bitcoin" />
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      ${btcPrice.price?.toLocaleString()}
                    </div>
                    <div className={`text-xs ${btcPrice.change_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {btcPrice.change_24h >= 0 ? '+' : ''}{btcPrice.change_24h?.toFixed(2)}%
                    </div>
                  </div>
                </div>
              )}

              {/* System Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${systemStatus?.status === 'healthy' ? 'bg-green-500 pulse-green' : 'bg-red-500 pulse-red'}`}></div>
                <span className="text-sm text-slate-300">
                  {systemStatus?.status === 'healthy' ? 'System Online' : 'System Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-slate-800 border-r border-slate-700 min-h-screen">
          <div className="p-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                      currentView === item.id
                        ? 'bg-bitcoin text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="px-4 pb-4">
            <div className="bg-slate-700 rounded-lg p-4 mt-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">System Stats</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">AI Samples:</span>
                  <span className="text-white">{systemStatus?.ai_samples || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Timeframes:</span>
                  <span className="text-white">{systemStatus?.active_timeframes || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Uptime:</span>
                  <span className="text-green-500">{systemStatus?.uptime || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App; 