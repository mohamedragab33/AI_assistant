import React, { useState } from 'react';
import Navigation from './components/Navigation';
import TradingDashboard from './components/TradingDashboard';
import PrecisionTrading from './components/PrecisionTrading';
import ComprehensiveDashboard from './components/ComprehensiveDashboard';
import EnhancedOnChainDashboard from './components/EnhancedOnChainDashboard';
import MultiTimeframeTrading from './components/MultiTimeframeTrading';
import HalvingCycleDashboard from './components/HalvingCycleDashboard';
import EliteAnalyticsDashboard from './components/EliteAnalyticsDashboard';
import SystemMonitoring from './components/SystemMonitoring';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('precision');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'precision':
        return <PrecisionTrading />;
      case 'trading':
        return <TradingDashboard />;
      case 'comprehensive':
        return <ComprehensiveDashboard />;
      case 'onchain':
        return <EnhancedOnChainDashboard />;
      case 'multiframe':
        return <MultiTimeframeTrading />;
      case 'halving':
        return <HalvingCycleDashboard />;
      case 'elite':
        return <EliteAnalyticsDashboard />;
      case 'system':
        return <SystemMonitoring />;
      default:
        return <PrecisionTrading />;
    }
  };

  return (
    <div className="App min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="pt-20">
        {renderActiveComponent()}
      </div>
    </div>
  );
}

export default App; 