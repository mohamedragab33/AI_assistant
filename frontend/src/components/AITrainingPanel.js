import React, { useState, useEffect } from 'react';
import { tradingAPI } from '../services/api';

const AITrainingPanel = () => {
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAIData = async () => {
    try {
      const response = await tradingAPI.getAITrainingData();
      setAiData(response.data);
    } catch (error) {
      console.error('Error fetching AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIData();
    
    // Refresh AI data every 10 seconds
    const interval = setInterval(fetchAIData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 70) return 'text-crypto-green';
    if (accuracy >= 50) return 'text-crypto-gold';
    return 'text-crypto-red';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '🔄';
    }
  };

  if (loading) {
    return (
      <div className="trading-card">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trading-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-300">AI Learning System</h3>
        <div className="text-2xl">🧠</div>
      </div>

      {/* AI Overview Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-slate-400 text-sm">Total Samples</div>
          <div className="text-2xl font-bold text-crypto-blue">
            {aiData?.ai_training_overview?.total_samples || 0}
          </div>
        </div>
        <div className="text-center">
          <div className="text-slate-400 text-sm">AI Accuracy</div>
          <div className={`text-2xl font-bold ${getAccuracyColor(aiData?.ai_training_overview?.ai_accuracy || 0)}`}>
            {(aiData?.ai_training_overview?.ai_accuracy || 0).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Learning Metrics */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Learning Velocity</span>
          <span className="text-white font-medium">
            {(aiData?.ai_training_overview?.learning_velocity || 0).toFixed(2)}%/sample
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400">Confidence Trend</span>
          <div className="flex items-center space-x-2">
            <span className="text-lg">
              {getTrendIcon(aiData?.ai_training_overview?.confidence_trend)}
            </span>
            <span className="text-white font-medium capitalize">
              {aiData?.ai_training_overview?.confidence_trend || 'Building'}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400">Database Status</span>
          <span className={`font-medium ${
            aiData?.ai_training_overview?.mongodb_status === 'connected' 
              ? 'text-crypto-green' 
              : 'text-slate-400'
          }`}>
            {aiData?.ai_training_overview?.mongodb_status === 'connected' ? 'MongoDB' : 'Memory'}
          </span>
        </div>
      </div>

      {/* Recent Training Samples */}
      <div className="border-t border-slate-700 pt-4">
        <h4 className="text-sm font-semibold text-slate-300 mb-3">Recent AI Training Samples</h4>
        
        {aiData?.training_samples && aiData.training_samples.length > 0 ? (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {aiData.training_samples.slice(-5).reverse().map((sample, index) => (
              <div key={sample.id} className="p-2 bg-slate-700 bg-opacity-50 rounded text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">{sample.id}</span>
                  <span className={`font-medium ${getAccuracyColor(sample.confidence)}`}>
                    {sample.confidence}%
                  </span>
                </div>
                <div className="text-slate-500 text-xs">
                  {sample.timeframe} • {new Date(sample.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-4">
            No training samples yet
          </div>
        )}
      </div>

      {/* AI Performance Indicators */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="p-3 bg-crypto-blue bg-opacity-10 border border-crypto-blue border-opacity-30 rounded-lg text-center">
          <div className="text-crypto-blue font-semibold text-sm">Learning Phase</div>
          <div className="text-xs text-slate-400 mt-1">Collecting Data</div>
        </div>
        <div className="p-3 bg-crypto-gold bg-opacity-10 border border-crypto-gold border-opacity-30 rounded-lg text-center">
          <div className="text-crypto-gold font-semibold text-sm">Auto-Learning</div>
          <div className="text-xs text-slate-400 mt-1">Continuous</div>
        </div>
      </div>
    </div>
  );
};

export default AITrainingPanel; 