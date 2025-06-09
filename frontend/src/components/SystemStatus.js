import React from 'react';

const SystemStatus = ({ health, autoTradingStatus }) => {
  const getStatusColor = (status) => {
    return status === 'healthy' ? 'text-crypto-green' : 'text-crypto-red';
  };

  const getConnectionStatus = (connected) => {
    return connected ? 'Connected' : 'Disconnected';
  };

  return (
    <div className="trading-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-300">System Status</h3>
        <div className={`text-2xl ${getStatusColor(health?.status)}`}>
          {health?.status === 'healthy' ? '🟢' : '🔴'}
        </div>
      </div>

      <div className="space-y-4">
        {/* Backend Status */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Backend</span>
          <span className={`font-medium ${getStatusColor(health?.status)}`}>
            {health?.status === 'healthy' ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* MongoDB Status */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Database</span>
          <span className={`font-medium ${health?.mongodb_connected ? 'text-crypto-green' : 'text-crypto-red'}`}>
            {getConnectionStatus(health?.mongodb_connected)}
          </span>
        </div>

        {/* AI Training Status */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400">AI Training</span>
          <span className={`font-medium ${health?.ai_training_active ? 'text-crypto-green' : 'text-slate-400'}`}>
            {health?.ai_training_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Auto Trading Status */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Auto Trading</span>
          <span className={`font-medium ${autoTradingStatus?.auto_trading_enabled ? 'text-crypto-green' : 'text-slate-400'}`}>
            {autoTradingStatus?.auto_trading_enabled ? 'Running' : 'Stopped'}
          </span>
        </div>

        {/* Uptime */}
        {health?.timestamp && (
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Last Update</span>
            <span className="text-white font-medium text-sm">
              {new Date(health.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* System Overview */}
      <div className="mt-6 p-3 bg-slate-700 bg-opacity-50 rounded-lg">
        <div className="text-center">
          <div className="text-crypto-blue font-medium">
            {health?.auto_signals_generated || 0} Auto Signals Generated
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus; 