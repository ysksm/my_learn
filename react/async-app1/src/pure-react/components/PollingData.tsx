import React from 'react';
import { usePolling } from '../hooks/usePolling';
import { Container } from '../../infrastructure/di/Container';

const container = Container.getInstance();

export const PollingData: React.FC = () => {
  const pollRepository = container.getPollRepository();

  const {
    data: pollData,
    loading,
    error,
    isPolling,
    start,
    stop,
    refetch
  } = usePolling(
    (signal) => pollRepository.getPollData(signal),
    2000,
    false
  );

  const handleTogglePolling = () => {
    if (isPolling) {
      stop();
    } else {
      start();
    }
  };

  return (
    <div className="polling-data">
      <div className="header">
        <h2>Polling Data (Pure React)</h2>
        <div className="controls">
          <button
            onClick={handleTogglePolling}
            className={isPolling ? 'stop' : 'start'}
          >
            {isPolling ? 'Stop Polling' : 'Start Polling'}
          </button>
          <button onClick={refetch} disabled={loading}>
            Manual Refresh
          </button>
        </div>
      </div>

      <div className="status">
        <span className={`polling-status ${isPolling ? 'active' : 'inactive'}`}>
          {isPolling ? '🟢 Polling Active' : '🔴 Polling Stopped'}
        </span>
        {loading && <span className="loading-indicator">⏳ Loading...</span>}
      </div>

      {error && (
        <div className="error">
          <p>Error: {error.message}</p>
          <small>Code: {error.code}</small>
        </div>
      )}

      {pollData && (
        <div className="poll-data">
          <div className="data-card">
            <h3>Poll Data</h3>
            <div className="data-row">
              <span className="label">ID:</span>
              <span className="value">{pollData.id}</span>
            </div>
            <div className="data-row">
              <span className="label">Value:</span>
              <span className="value large">{pollData.value.toFixed(2)}</span>
            </div>
            <div className="data-row">
              <span className="label">Status:</span>
              <span className={`status-badge ${pollData.status}`}>
                {pollData.status}
              </span>
            </div>
            <div className="data-row">
              <span className="label">Last Updated:</span>
              <span className="value">
                {new Date(pollData.lastUpdated).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};