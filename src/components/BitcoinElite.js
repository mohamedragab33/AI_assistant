import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { Bitcoin, Clock, TrendingUp, AlertTriangle, Eye, Zap, Target, Activity } from 'lucide-react';

const BitcoinElite = () => {
  const [loading, setLoading] = useState(true);
  const [bitcoinData, setBitcoinData] = useState({
    comprehensive: null,
    onchain: null,
    halving: null,
    whales: null,
    cycle: null,
    dominance: null
  });

  useEffect(() => {
    fetchBitcoinData();
    const interval = setInterval(fetchBitcoinData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBitcoinData = async () => {
    try {
      const [compRes, onchainRes, halvingRes, whalesRes, cycleRes, dominanceRes] = await Promise.all([
        fetch('http://localhost:8000/api/bitcoin/comprehensive-analysis'),
        fetch('http://localhost:8000/api/bitcoin/onchain-metrics'),
        fetch('http://localhost:8000/api/bitcoin/halving-analysis'),
        fetch('http://localhost:8000/api/bitcoin/whale-alerts'),
        fetch('http://localhost:8000/api/bitcoin/market-cycle'),
        fetch('http://localhost:8000/api/bitcoin/dominance')
      ]);

      const [compData, onchainData, halvingData, whalesData, cycleData, dominanceData] = await Promise.all([
        compRes.json(),
        onchainRes.json(),
        halvingRes.json(),
        whalesRes.json(),
        cycleRes.json(),
        dominanceRes.json()
      ]);

      setBitcoinData({
        comprehensive: compData,
        onchain: onchainData,
        halving: halvingData,
        whales: whalesData,
        cycle: cycleData,
        dominance: dominanceData
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Bitcoin data:', error);
      setLoading(false);
    }
  };

  const getFearGreedColor = (value) => {
    if (value >= 75) return 'text-green-500';
    if (value >= 55) return 'text-green-400';
    if (value >= 45) return 'text-yellow-500';
    if (value >= 25) return 'text-orange-500';
    return 'text-red-500';
  };

  const getDominanceData = () => {
    const btcDominance = bitcoinData.dominance?.btc_dominance || 0;
    return [
      { name: 'Bitcoin', value: btcDominance, color: '#f7931a' },
      { name: 'Others', value: 100 - btcDominance, color: '#64748b' }
    ];
  };

  const getHalvingProgress = () => {
    if (!bitcoinData.halving) return 0;
    const totalDays = 1460; // ~4 years
    const daysPassed = bitcoinData.halving.days_since_last_halving || 0;
    return Math.min((daysPassed / totalDays) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bitcoin"></div>
      </div>
    );
  }

  const dominanceData = getDominanceData();
  const halvingProgress = getHalvingProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-bitcoin to-orange-500 rounded-lg bitcoin-glow">
          <Bitcoin className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">₿ Bitcoin Elite Analytics</h1>
          <p className="text-slate-400">Professional-grade Bitcoin market intelligence</p>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Fear & Greed Index */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300">Fear & Greed Index</h3>
            <Activity className="w-5 h-5 text-bitcoin" />
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getFearGreedColor(bitcoinData.onchain?.fear_greed_index)}`}>
              {bitcoinData.onchain?.fear_greed_index || 0}
            </div>
            <p className="text-sm text-slate-400 mt-1">
              {bitcoinData.onchain?.fear_greed_index >= 75 ? 'Extreme Greed' :
               bitcoinData.onchain?.fear_greed_index >= 55 ? 'Greed' :
               bitcoinData.onchain?.fear_greed_index >= 45 ? 'Neutral' :
               bitcoinData.onchain?.fear_greed_index >= 25 ? 'Fear' : 'Extreme Fear'}
            </p>
          </div>
        </div>

        {/* Bitcoin Dominance */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300">BTC Dominance</h3>
            <Target className="w-5 h-5 text-bitcoin" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-bitcoin">
              {bitcoinData.dominance?.btc_dominance?.toFixed(1) || '0.0'}%
            </div>
            <p className="text-sm text-slate-400 mt-1">Market Share</p>
          </div>
        </div>

        {/* Hash Rate */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300">Hash Rate</h3>
            <Zap className="w-5 h-5 text-bitcoin" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {bitcoinData.onchain?.hash_rate || 0} EH/s
            </div>
            <p className="text-sm text-slate-400 mt-1">Network Security</p>
          </div>
        </div>

        {/* Active Addresses */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300">Active Addresses</h3>
            <Eye className="w-5 h-5 text-bitcoin" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {(bitcoinData.onchain?.active_addresses / 1000).toFixed(0)}K
            </div>
            <p className="text-sm text-slate-400 mt-1">Daily Active</p>
          </div>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Halving Countdown */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-bitcoin" />
            Halving Cycle Analysis
          </h3>
          
          <div className="space-y-4">
            {/* Next Halving Countdown */}
            <div className="text-center bg-slate-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-bitcoin mb-2">
                {bitcoinData.halving?.days_until_next_halving || 0} Days
              </div>
              <p className="text-sm text-slate-400">Until Next Halving</p>
              <p className="text-xs text-slate-500 mt-1">
                Expected: {bitcoinData.halving?.next_halving_date || 'TBD'}
              </p>
            </div>

            {/* Cycle Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">Cycle Progress</span>
                <span className="text-sm text-white">{halvingProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-bitcoin to-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${halvingProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Cycle Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Days Since Last</p>
                <p className="text-white font-semibold">{bitcoinData.halving?.days_since_last_halving || 0}</p>
              </div>
              <div>
                <p className="text-slate-400">Current Reward</p>
                <p className="text-white font-semibold">{bitcoinData.halving?.current_block_reward || 0} BTC</p>
              </div>
            </div>
          </div>
        </div>

        {/* Market Cycle Phase */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-bitcoin" />
            Market Cycle Analysis
          </h3>

          <div className="space-y-4">
            {/* Current Phase */}
            <div className="text-center bg-slate-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-bitcoin mb-2">
                {bitcoinData.cycle?.current_phase || 'Unknown'}
              </div>
              <p className="text-sm text-slate-400">Current Market Phase</p>
              <div className="flex items-center justify-center mt-2">
                <div className="w-2 h-2 bg-bitcoin rounded-full mr-2"></div>
                <span className="text-xs text-slate-400">
                  {bitcoinData.cycle?.confidence_level || 0}% Confidence
                </span>
              </div>
            </div>

            {/* Phase Recommendation */}
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Strategy Recommendation:</p>
              <p className="text-white font-semibold">
                {bitcoinData.cycle?.recommendation || 'Hold and monitor'}
              </p>
            </div>

            {/* Cycle Metrics */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Estimated Top</p>
                <p className="text-white font-semibold">{bitcoinData.cycle?.estimated_cycle_top || 'TBD'}</p>
              </div>
              <div>
                <p className="text-slate-400">Days in Cycle</p>
                <p className="text-white font-semibold">{bitcoinData.cycle?.days_into_cycle || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bitcoin Dominance Chart */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Bitcoin Dominance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={dominanceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                dataKey="value"
              >
                {dominanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center mt-2">
            <p className="text-2xl font-bold text-bitcoin">
              {bitcoinData.dominance?.btc_dominance?.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* On-Chain Metrics */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">On-Chain Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">MVRV Ratio</span>
              <span className="text-white font-semibold">
                {bitcoinData.onchain?.mvrv_ratio?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Exchange Net Flow</span>
              <span className={`font-semibold ${
                (bitcoinData.onchain?.exchange_net_flow || 0) < 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {bitcoinData.onchain?.exchange_net_flow?.toFixed(1) || 0} BTC
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Long-term Holders</span>
              <span className="text-white font-semibold">
                {bitcoinData.onchain?.long_term_holder_ratio?.toFixed(1) || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Realized Price</span>
              <span className="text-white font-semibold">
                ${bitcoinData.onchain?.realized_price?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
        </div>

        {/* Whale Alerts */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-bitcoin" />
            Whale Activity
          </h3>
          <div className="space-y-3">
            {bitcoinData.whales?.recent_alerts?.slice(0, 4).map((alert, index) => (
              <div key={index} className="bg-slate-700 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs px-2 py-1 rounded ${
                    alert.type === 'large_transfer' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {alert.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-white font-semibold">
                  {alert.amount?.toLocaleString()} BTC
                </p>
                <p className="text-xs text-slate-400">${alert.usd_value?.toLocaleString()}</p>
              </div>
            )) || (
              <div className="text-center text-slate-400 py-4">
                <p className="text-sm">No recent whale activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Summary */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Elite Analysis Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-bitcoin">Market Sentiment</h4>
            <p className="text-sm text-slate-300">
              Current Fear & Greed at {bitcoinData.onchain?.fear_greed_index || 0}, indicating{' '}
              {bitcoinData.onchain?.fear_greed_index >= 50 ? 'bullish' : 'bearish'} sentiment.
              Bitcoin dominance at {bitcoinData.dominance?.btc_dominance?.toFixed(1)}% shows{' '}
              {(bitcoinData.dominance?.btc_dominance || 0) > 60 ? 'strong' : 'weak'} relative performance.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-bitcoin">Cycle Position</h4>
            <p className="text-sm text-slate-300">
              Currently in {bitcoinData.cycle?.current_phase || 'Unknown'} phase,{' '}
              {bitcoinData.halving?.days_since_last_halving || 0} days post-halving.
              Market cycle suggests {bitcoinData.cycle?.recommendation || 'cautious approach'}.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-bitcoin">On-Chain Health</h4>
            <p className="text-sm text-slate-300">
              MVRV ratio at {bitcoinData.onchain?.mvrv_ratio?.toFixed(2) || 0} indicates{' '}
              {(bitcoinData.onchain?.mvrv_ratio || 0) > 2 ? 'potential overvaluation' : 'fair value'}.
              Exchange flows {(bitcoinData.onchain?.exchange_net_flow || 0) < 0 ? 'bullish' : 'bearish'}{' '}
              with net outflow of {Math.abs(bitcoinData.onchain?.exchange_net_flow || 0).toFixed(1)} BTC.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BitcoinElite; 