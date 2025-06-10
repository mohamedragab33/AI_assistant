import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Brain, TrendingUp, Activity, Zap, Target, BarChart3 } from 'lucide-react';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    aiTraining: null,
    multiTimeframe: null,
    tradeHistory: []
  });

  useEffect(() => {
    fetchAnalyticsData();
    const interval = setInterval(fetchAnalyticsData, 20000); // Refresh every 20 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const [aiRes, multiRes, tradesRes] = await Promise.all([
        fetch('http://localhost:8000/api/ai-training-data'),
        fetch('http://localhost:8000/api/multi-timeframe/status'),
        fetch('http://localhost:8000/api/trade-history')
      ]);

      const [aiData, multiData, tradesData] = await Promise.all([
        aiRes.json(),
        multiRes.json(),
        tradesRes.json()
      ]);

      setAnalyticsData({
        aiTraining: aiData,
        multiTimeframe: multiData,
        tradeHistory: tradesData
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
    }
  };

  const getTimeframePerformance = () => {
    if (!analyticsData.multiTimeframe?.timeframes) return [];
    
    return Object.entries(analyticsData.multiTimeframe.timeframes).map(([timeframe, data]) => ({
      timeframe,
      accuracy: data.accuracy || 0,
      winRate: data.win_rate || 0,
      totalSignals: data.total_signals || 0,
      totalProfit: data.total_profit || 0
    }));
  };

  const getAILearningProgress = () => {
    if (!analyticsData.aiTraining?.samples) return [];
    
    return analyticsData.aiTraining.samples.slice(-30).map((sample, index) => ({
      sample: index + 1,
      confidence: sample.confidence || 0,
      accuracy: sample.result === 'win' ? 100 : sample.result === 'loss' ? 0 : 50,
      timestamp: sample.timestamp
    }));
  };

  const getSignalDistribution = () => {
    if (!analyticsData.tradeHistory) return [];
    
    const distribution = analyticsData.tradeHistory.reduce((acc, trade) => {
      const action = trade.action || 'Unknown';
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(distribution).map(([action, count]) => ({
      action,
      count,
      percentage: (count / analyticsData.tradeHistory.length * 100).toFixed(1)
    }));
  };

  const getConfidenceDistribution = () => {
    if (!analyticsData.tradeHistory) return [];
    
    const ranges = {
      'Low (0-50%)': 0,
      'Medium (50-70%)': 0,
      'High (70-85%)': 0,
      'Very High (85%+)': 0
    };

    analyticsData.tradeHistory.forEach(trade => {
      const confidence = trade.confidence || 0;
      if (confidence < 50) ranges['Low (0-50%)']++;
      else if (confidence < 70) ranges['Medium (50-70%)']++;
      else if (confidence < 85) ranges['High (70-85%)']++;
      else ranges['Very High (85%+)']++;
    });

    return Object.entries(ranges).map(([range, count]) => ({
      range,
      count,
      percentage: analyticsData.tradeHistory.length > 0 ? 
        (count / analyticsData.tradeHistory.length * 100).toFixed(1) : 0
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bitcoin"></div>
      </div>
    );
  }

  const timeframeData = getTimeframePerformance();
  const aiProgressData = getAILearningProgress();
  const signalDistribution = getSignalDistribution();
  const confidenceDistribution = getConfidenceDistribution();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
          <BarChart3 className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Advanced Analytics</h1>
          <p className="text-slate-400">AI performance and trading system insights</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300">AI Training Samples</h3>
            <Brain className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {analyticsData.aiTraining?.total_samples || 0}
            </div>
            <p className="text-sm text-slate-400 mt-1">Total Samples</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300">Overall Accuracy</h3>
            <Target className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {analyticsData.aiTraining?.overall_accuracy?.toFixed(1) || '0.0'}%
            </div>
            <p className="text-sm text-slate-400 mt-1">AI Accuracy</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300">Active Timeframes</h3>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {Object.keys(analyticsData.multiTimeframe?.timeframes || {}).length}
            </div>
            <p className="text-sm text-slate-400 mt-1">Timeframes</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300">Total Signals</h3>
            <Zap className="w-5 h-5 text-bitcoin" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {analyticsData.tradeHistory?.length || 0}
            </div>
            <p className="text-sm text-slate-400 mt-1">Generated</p>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Learning Progress */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-500" />
            AI Learning Progress
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={aiProgressData}>
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
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Accuracy %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Multi-Timeframe Performance */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-bitcoin" />
            Multi-Timeframe Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeframeData}>
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
              <Bar dataKey="accuracy" fill="#f7931a" name="Accuracy %" />
              <Bar dataKey="winRate" fill="#10b981" name="Win Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Signal Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signal Distribution */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Signal Distribution</h3>
          <div className="space-y-4">
            {signalDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    item.action === 'Buy' ? 'bg-green-500' : 
                    item.action === 'Sell' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-slate-300">{item.action}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{item.count}</div>
                  <div className="text-xs text-slate-400">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence Distribution */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Confidence Distribution</h3>
          <div className="space-y-4">
            {confidenceDistribution.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">{item.range}</span>
                  <span className="text-sm text-white">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === 0 ? 'bg-red-500' :
                      index === 1 ? 'bg-yellow-500' :
                      index === 2 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Timeframe Analysis */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Timeframe Performance Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 pb-3">Timeframe</th>
                <th className="text-left text-slate-400 pb-3">Total Signals</th>
                <th className="text-left text-slate-400 pb-3">Accuracy</th>
                <th className="text-left text-slate-400 pb-3">Win Rate</th>
                <th className="text-left text-slate-400 pb-3">Total Profit</th>
                <th className="text-left text-slate-400 pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {timeframeData.map((tf, index) => (
                <tr key={index} className="border-b border-slate-700/50">
                  <td className="py-3">
                    <span className="text-bitcoin font-semibold">{tf.timeframe}</span>
                  </td>
                  <td className="py-3 text-white">{tf.totalSignals}</td>
                  <td className="py-3">
                    <span className={`font-semibold ${
                      tf.accuracy >= 60 ? 'text-green-500' :
                      tf.accuracy >= 40 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {tf.accuracy.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`font-semibold ${
                      tf.winRate >= 50 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {tf.winRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`font-semibold ${
                      tf.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {tf.totalProfit >= 0 ? '+' : ''}{tf.totalProfit.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      tf.totalSignals > 0 ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {tf.totalSignals > 0 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Training Insights */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">AI Training Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-purple-400">Learning Progress</h4>
            <p className="text-sm text-slate-300">
              AI has processed {analyticsData.aiTraining?.total_samples || 0} training samples with 
              {analyticsData.aiTraining?.overall_accuracy?.toFixed(1) || '0'}% overall accuracy. 
              Recent performance shows {analyticsData.aiTraining?.recent_accuracy?.toFixed(1) || '0'}% accuracy 
              over the last {analyticsData.aiTraining?.recent_sample_count || 0} samples.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-purple-400">Pattern Recognition</h4>
            <p className="text-sm text-slate-300">
              The AI system has identified {analyticsData.aiTraining?.pattern_count || 0} distinct market patterns.
              Current pattern matching accuracy is {analyticsData.aiTraining?.pattern_accuracy?.toFixed(1) || '0'}%.
              Most successful patterns are in the {timeframeData.find(tf => tf.accuracy === Math.max(...timeframeData.map(t => t.accuracy)))?.timeframe || 'N/A'} timeframe.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-purple-400">Performance Trends</h4>
            <p className="text-sm text-slate-300">
              Signal generation rate: {(analyticsData.tradeHistory?.length || 0) / Math.max(1, (analyticsData.aiTraining?.total_samples || 1))} signals per sample.
              Average confidence level: {analyticsData.tradeHistory?.reduce((acc, trade) => acc + (trade.confidence || 0), 0) / Math.max(1, analyticsData.tradeHistory?.length || 1)}%.
              System is {analyticsData.aiTraining?.overall_accuracy > 50 ? 'improving' : 'learning'} with each iteration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 