import React, { useState, useEffect } from 'react';
import { 
  Target, TrendingUp, BarChart3, Layers, Timer, 
  Calendar, Award, Activity, ChevronDown
} from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const [bitcoinPrice, setBitcoinPrice] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationTabs = [
    { 
      id: 'precision', 
      label: 'Precision Trading', 
      icon: Target, 
      description: 'Exact Entry & Exit Levels',
      color: 'text-amber-400'
    },
    { 
      id: 'trading', 
      label: 'Trading Dashboard', 
      icon: TrendingUp, 
      description: 'Core Trading Interface',
      color: 'text-blue-400'
    },
    { 
      id: 'comprehensive', 
      label: 'Comprehensive Analysis', 
      icon: BarChart3, 
      description: 'Complete Market View',
      color: 'text-green-400'
    },
    { 
      id: 'onchain', 
      label: 'On-Chain Analytics', 
      icon: Layers, 
      description: 'Blockchain Data Insights',
      color: 'text-purple-400'
    },
    { 
      id: 'multiframe', 
      label: 'Multi-Timeframe', 
      icon: Timer, 
      description: '5m/15m/1h Signals',
      color: 'text-cyan-400'
    },
    { 
      id: 'halving', 
      label: 'Halving Cycle', 
      icon: Calendar, 
      description: '4-Year Cycle Analysis',
      color: 'text-orange-400'
    },
    { 
      id: 'elite', 
      label: 'Elite Analytics', 
      icon: Award, 
      description: 'Premium Indicators',
      color: 'text-yellow-400'
    },
    { 
      id: 'system', 
      label: 'System Monitor', 
      icon: Activity, 
      description: 'System Health & Status',
      color: 'text-red-400'
    }
  ];

  // Fetch Bitcoin price for header
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch('http://localhost:8001/api/bitcoin/price');
        const data = await response.json();
        setBitcoinPrice(data.price);
      } catch (error) {
        console.error('Error fetching Bitcoin price:', error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price) => {
    if (!price) return 'Loading...';
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
      {/* Top Header */}
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            ₿ Elite Trading AI
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">LIVE</span>
          </div>
        </div>

        {/* Bitcoin Price Display */}
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <div className="text-xs text-gray-400">Bitcoin Price</div>
            <div className="text-lg font-bold text-amber-400">
              {formatPrice(bitcoinPrice)}
            </div>
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
          >
            <ChevronDown className={`w-5 h-5 transform transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`px-6 overflow-x-auto ${isMenuOpen || 'hidden md:block'}`}>
        <div className="flex space-x-1 pb-3">
          {navigationTabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMenuOpen(false);
                }}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap
                  ${isActive 
                    ? 'bg-gray-800 text-white border border-gray-600' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }
                `}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? tab.color : ''}`} />
                <div className="text-left">
                  <div className="text-sm font-medium">{tab.label}</div>
                  <div className="text-xs opacity-75">{tab.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 