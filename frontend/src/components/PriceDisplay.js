import React, { useState, useEffect } from 'react';
import { tradingAPI } from '../services/api';

const PriceDisplay = () => {
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrice = async () => {
    try {
      const response = await tradingAPI.getCurrentPrice();
      setPriceData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching price:', err);
      setError('Price unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
    
    // Update price every 10 seconds
    const interval = setInterval(fetchPrice, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price) => {
    if (price === 0 || !price) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="trading-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-300">Bitcoin Price</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-crypto-gold rounded-full animate-pulse"></div>
          <span className="text-sm text-slate-400">Live</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded mb-2"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-crypto-red text-2xl mb-2">⚠️</div>
          <p className="text-slate-400">{error}</p>
          <button 
            onClick={fetchPrice}
            className="mt-2 text-sm text-crypto-blue hover:text-blue-400"
          >
            Retry
          </button>
        </div>
      ) : (
        <div>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-crypto-gold mb-2">
              {formatPrice(priceData?.price)}
            </div>
            {priceData?.timestamp && (
              <div className="text-sm text-slate-400">
                Updated: {new Date(priceData.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-slate-400">Source</div>
              <div className="text-white font-medium">
                {priceData?.source === 'binance_price_api' ? 'Binance API' : 'Market Data'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-slate-400">AI Samples</div>
              <div className="text-crypto-blue font-medium">
                {priceData?.ai_training_samples || 0}
              </div>
            </div>
          </div>

          {priceData?.auto_trading_active && (
            <div className="mt-4 p-3 bg-crypto-green bg-opacity-10 border border-crypto-green border-opacity-30 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-crypto-green rounded-full animate-pulse"></div>
                <span className="text-crypto-green text-sm font-medium">
                  Auto-Trading Active
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceDisplay; 