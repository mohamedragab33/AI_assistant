import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Zap, Target, Brain } from 'lucide-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    systemHealth: null,
    multiTimeframeStatus: null,
    aiTrainingData: null,
    tradeHistory: []
  });

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [healthRes, multiRes, aiRes, tradesRes] = await Promise.all([
        fetch('http://localhost:8000/health'),
        fetch('http://localhost:8000/api/multi-timeframe/status'),
        fetch('http://localhost:8000/api/ai-training-data'),
        fetch('http://localhost:8000/api/trade-history')
      ]);

      const [healthData, multiData, aiData, tradesData] = await Promise.all([
        healthRes.json(),
        multiRes.json(),
        tradesRes.json(),
        aiRes.json()
      ]);

      setDashboardData({
        systemHealth: healthData,
        multiTimeframeStatus: multiData,
        aiTrainingData: aiData,
        tradeHistory: tradesData
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const formatPerformanceData = () => {
    if (!dashboardData.multiTimeframeStatus?.timeframes) return [];
    
    return Object.entries(dashboardData.multiTimeframeStatus.timeframes).map(([timeframe, data]) => ({
      timeframe,
      accuracy: data.accuracy || 0,
      profit: data.total_profit || 0,
      signals: data.total_signals || 0,
      winRate: data.win_rate || 0
    }));
  };

  const getAIPerformanceChart = () => {
    if (!dashboardData.aiTrainingData?.samples) return [];
    
    return dashboardData.aiTrainingData.samples.slice(-20).map((sample, index) => ({
      sample: index + 1,
      confidence: sample.confidence || 0,
      accuracy: sample.result === 'win' ? 100 : 0
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bitcoin"></div>
      </div>
    );
  }

  const performanceData = formatPerformanceData();
  const aiChartData = getAIPerformanceChart();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Trading Dashboard</h1>
        <p className="text-slate-400">Real-time overview of your Bitcoin trading system</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Signals</p>
              <p className="text-2xl font-bold text-white">
                {dashboardData.multiTimeframeStatus?.total_signals || 0}
              </p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">AI Training Samples</p>
              <p className="text-2xl font-bold text-white">
                {dashboardData.aiTrainingData?.total_samples || 0}
              </p>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <Brain className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Overall Accuracy</p>
              <p className="text-2xl font-bold text-white">
                {dashboardData.aiTrainingData?.overall_accuracy?.toFixed(1) || '0.0'}%
              </p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <Target className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">System Status</p>
              <p className="text-2xl font-bold text-green-500">
                {dashboardData.systemHealth?.status === 'healthy' ? 'Online' : 'Offline'}
              </p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multi-Timeframe Performance */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Multi-Timeframe Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="timeframe" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#f7931a" 
                fill="#f7931a" 
                fillOpacity={0.3}
                name="Accuracy %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Learning Progress */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">AI Learning Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={aiChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="sample" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="confidence" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Confidence %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeframe Status Grid */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Active Timeframes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {performanceData.map((tf) => (
            <div key={tf.timeframe} className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-bitcoin font-semibold">{tf.timeframe}</span>
                <div className={`w-3 h-3 rounded-full ${tf.signals > 0 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Signals:</span>
                  <span className="text-white">{tf.signals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Accuracy:</span>
                  <span className="text-white">{tf.accuracy.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Win Rate:</span>
                  <span className={tf.winRate >= 50 ? 'text-green-500' : 'text-red-500'}>
                    {tf.winRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Trades */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Trades</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 pb-2">Time</th>
                <th className="text-left text-slate-400 pb-2">Action</th>
                <th className="text-left text-slate-400 pb-2">Price</th>
                <th className="text-left text-slate-400 pb-2">Timeframe</th>
                <th className="text-left text-slate-400 pb-2">Confidence</th>
                <th className="text-left text-slate-400 pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.tradeHistory.slice(0, 5).map((trade, index) => (
                <tr key={index} className="border-b border-slate-700/50">
                  <td className="py-2 text-slate-300">
                    {new Date(trade.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      trade.action === 'Buy' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {trade.action}
                    </span>
                  </td>
                  <td className="py-2 text-white">${trade.entry_price?.toLocaleString()}</td>
                  <td className="py-2 text-slate-300">{trade.timeframe || 'N/A'}</td>
                  <td className="py-2 text-slate-300">{trade.confidence?.toFixed(1)}%</td>
                  <td className="py-2">
                    <span className="text-yellow-500">Pending</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 