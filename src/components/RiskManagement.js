import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Shield, AlertTriangle, TrendingDown, Calculator, Target, Zap } from 'lucide-react';

const RiskManagement = () => {
  const [loading, setLoading] = useState(true);
  const [riskData, setRiskData] = useState({
    liquidationHeatmap: null,
    positionSizing: null,
    riskAssessment: null,
    dynamicStopLoss: null
  });
  const [positionParams, setPositionParams] = useState({
    timeframe: '15m',
    accountSize: 50000,
    direction: 'buy',
    atr: 150
  });

  useEffect(() => {
    fetchRiskData();
    const interval = setInterval(fetchRiskData, 20000); // Refresh every 20 seconds
    return () => clearInterval(interval);
  }, [positionParams]);

  const fetchRiskData = async () => {
    try {
      const [liquidationRes, assessmentRes] = await Promise.all([
        fetch('http://localhost:8000/api/risk/liquidation-heatmap'),
        fetch('http://localhost:8000/api/risk/comprehensive-assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            position_direction: positionParams.direction,
            timeframe: positionParams.timeframe
          })
        })
      ]);

      const [liquidationData, assessmentData] = await Promise.all([
        liquidationRes.json(),
        assessmentRes.json()
      ]);

      // Fetch position sizing
      const positionRes = await fetch('http://localhost:8000/api/risk/position-sizing-advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeframe: positionParams.timeframe,
          account_size: positionParams.accountSize
        })
      });
      const positionData = await positionRes.json();

      // Fetch dynamic stop loss
      const stopLossRes = await fetch('http://localhost:8000/api/risk/dynamic-stop-loss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position_direction: positionParams.direction,
          timeframe: positionParams.timeframe,
          atr: positionParams.atr
        })
      });
      const stopLossData = await stopLossRes.json();

      setRiskData({
        liquidationHeatmap: liquidationData,
        positionSizing: positionData,
        riskAssessment: assessmentData,
        dynamicStopLoss: stopLossData
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching risk data:', error);
      setLoading(false);
    }
  };

  const formatLiquidationData = () => {
    if (!riskData.liquidationHeatmap?.liquidation_clusters) return [];
    
    return riskData.liquidationHeatmap.liquidation_clusters.map(cluster => ({
      price: cluster.price_level,
      size: cluster.liquidation_size / 1000000, // Convert to millions
      confidence: cluster.confidence_level * 100,
      type: cluster.side
    }));
  };

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'critical': return 'text-red-500';
      default: return 'text-slate-400';
    }
  };

  const getRiskBgColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'bg-green-500/20';
      case 'medium': return 'bg-yellow-500/20';
      case 'high': return 'bg-orange-500/20';
      case 'critical': return 'bg-red-500/20';
      default: return 'bg-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bitcoin"></div>
      </div>
    );
  }

  const liquidationChartData = formatLiquidationData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Risk Management</h1>
          <p className="text-slate-400">Advanced risk analysis and position management</p>
        </div>
      </div>

      {/* Risk Controls */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Position Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Timeframe</label>
            <select 
              value={positionParams.timeframe}
              onChange={(e) => setPositionParams({...positionParams, timeframe: e.target.value})}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="1m">1 Minute</option>
              <option value="5m">5 Minutes</option>
              <option value="15m">15 Minutes</option>
              <option value="30m">30 Minutes</option>
              <option value="1h">1 Hour</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Account Size ($)</label>
            <input 
              type="number"
              value={positionParams.accountSize}
              onChange={(e) => setPositionParams({...positionParams, accountSize: parseInt(e.target.value)})}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Direction</label>
            <select 
              value={positionParams.direction}
              onChange={(e) => setPositionParams({...positionParams, direction: e.target.value})}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="buy">Long</option>
              <option value="sell">Short</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">ATR</label>
            <input 
              type="number"
              value={positionParams.atr}
              onChange={(e) => setPositionParams({...positionParams, atr: parseFloat(e.target.value)})}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
        </div>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300">Overall Risk</h3>
            <Shield className="w-5 h-5 text-bitcoin" />
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getRiskColor(riskData.riskAssessment?.overall_risk_level)}`}>
              {riskData.riskAssessment?.overall_risk_level || 'Unknown'}
            </div>
            <p className="text-sm text-slate-400 mt-1">Risk Level</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300">Position Size</h3>
            <Calculator className="w-5 h-5 text-bitcoin" />
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              ${riskData.positionSizing?.recommended_position_size?.toLocaleString() || '0'}
            </div>
            <p className="text-sm text-slate-400 mt-1">
              {riskData.positionSizing?.position_size_percentage?.toFixed(1) || '0'}% of Account
            </p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300">Liquidation Risk</h3>
            <AlertTriangle className="w-5 h-5 text-bitcoin" />
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getRiskColor(riskData.riskAssessment?.liquidation_risk_level)}`}>
              {riskData.riskAssessment?.liquidation_risk_percentage?.toFixed(1) || '0'}%
            </div>
            <p className="text-sm text-slate-400 mt-1">Liquidation Risk</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300">Risk/Reward</h3>
            <Target className="w-5 h-5 text-bitcoin" />
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {riskData.dynamicStopLoss?.risk_reward_ratio?.toFixed(1) || '0'}:1
            </div>
            <p className="text-sm text-slate-400 mt-1">Risk/Reward</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liquidation Heatmap */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingDown className="w-5 h-5 mr-2 text-red-500" />
            Liquidation Heatmap
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={liquidationChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="price" 
                stroke="#9ca3af"
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <YAxis 
                stroke="#9ca3af"
                tickFormatter={(value) => `${value}M`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value, name) => [
                  name === 'size' ? `$${value}M` : `${value}%`,
                  name === 'size' ? 'Liquidation Size' : 'Confidence'
                ]}
                labelFormatter={(value) => `Price: $${value.toLocaleString()}`}
              />
              <Bar 
                dataKey="size" 
                fill="#ef4444" 
                opacity={0.8}
                name="Liquidation Size (M)"
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-slate-400">
            <p>Total Liquidation Size: ${(riskData.liquidationHeatmap?.total_liquidation_size / 1000000)?.toFixed(1) || '0'}M</p>
          </div>
        </div>

        {/* Risk Factors Breakdown */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Risk Factors Analysis</h3>
          <div className="space-y-4">
            {riskData.riskAssessment?.risk_factors && Object.entries(riskData.riskAssessment.risk_factors).map(([factor, data]) => (
              <div key={factor} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-300 capitalize">{factor.replace('_', ' ')}</span>
                  <span className={`text-sm font-semibold ${getRiskColor(data.level)}`}>
                    {data.level}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      data.level === 'low' ? 'bg-green-500' :
                      data.level === 'medium' ? 'bg-yellow-500' :
                      data.level === 'high' ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${
                        data.level === 'low' ? 25 :
                        data.level === 'medium' ? 50 :
                        data.level === 'high' ? 75 : 100
                      }%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-slate-400">{data.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Position Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stop Loss & Take Profit */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Dynamic Stop Loss & Take Profit</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-red-400 mb-2">Stop Loss</h4>
                <p className="text-xl font-bold text-white">
                  ${riskData.dynamicStopLoss?.stop_loss_price?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {riskData.dynamicStopLoss?.stop_loss_distance?.toFixed(2) || '0'} points away
                </p>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-400 mb-2">Take Profit</h4>
                <p className="text-xl font-bold text-white">
                  ${riskData.dynamicStopLoss?.take_profit_price?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {riskData.dynamicStopLoss?.take_profit_distance?.toFixed(2) || '0'} points away
                </p>
              </div>
            </div>
            
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Risk Metrics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Max Risk</p>
                  <p className="text-white font-semibold">
                    ${riskData.dynamicStopLoss?.max_risk_amount?.toLocaleString() || '0'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Potential Profit</p>
                  <p className="text-white font-semibold">
                    ${riskData.dynamicStopLoss?.potential_profit?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Position Sizing Details */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Position Sizing Analysis</h3>
          <div className="space-y-4">
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-bitcoin mb-3">Recommended Position</h4>
              <div className="text-center">
                <p className="text-2xl font-bold text-white mb-1">
                  ${riskData.positionSizing?.recommended_position_size?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-slate-400">
                  {riskData.positionSizing?.position_size_percentage?.toFixed(2) || '0'}% of account
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Base Size:</span>
                <span className="text-white">${riskData.positionSizing?.base_position_size?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Volatility Adjustment:</span>
                <span className="text-white">{riskData.positionSizing?.volatility_adjustment?.toFixed(2) || '0'}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cycle Adjustment:</span>
                <span className="text-white">{riskData.positionSizing?.cycle_adjustment?.toFixed(2) || '0'}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fear & Greed Adjustment:</span>
                <span className="text-white">{riskData.positionSizing?.fear_greed_adjustment?.toFixed(2) || '0'}x</span>
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">Reasoning:</p>
              <p className="text-sm text-white">{riskData.positionSizing?.reasoning || 'No reasoning provided'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Summary */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Risk Management Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-bitcoin">Current Risk Profile</h4>
            <p className="text-sm text-slate-300">
              Overall risk level is <span className={getRiskColor(riskData.riskAssessment?.overall_risk_level)}>
                {riskData.riskAssessment?.overall_risk_level || 'unknown'}
              </span> with {riskData.riskAssessment?.liquidation_risk_percentage?.toFixed(1) || '0'}% liquidation risk.
              Recommended position size is {riskData.positionSizing?.position_size_percentage?.toFixed(1) || '0'}% of account.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-bitcoin">Market Conditions</h4>
            <p className="text-sm text-slate-300">
              Current market volatility and cycle position suggest 
              {riskData.positionSizing?.volatility_adjustment > 1 ? ' increased' : ' reduced'} position sizing.
              Total liquidation exposure: ${(riskData.liquidationHeatmap?.total_liquidation_size / 1000000)?.toFixed(1) || '0'}M.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-bitcoin">Recommendations</h4>
            <p className="text-sm text-slate-300">
              Use {riskData.dynamicStopLoss?.risk_reward_ratio?.toFixed(1) || '0'}:1 risk-reward ratio.
              Set stop loss at ${riskData.dynamicStopLoss?.stop_loss_price?.toLocaleString() || '0'} and 
              take profit at ${riskData.dynamicStopLoss?.take_profit_price?.toLocaleString() || '0'}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskManagement; 