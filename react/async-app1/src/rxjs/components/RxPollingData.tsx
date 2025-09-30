import React from 'react';
import { useRxPolling } from '../hooks/useRxPolling';
import { RxApiService } from '../services/RxApiService';

export const RxPollingData: React.FC = () => {
  const {
    data: pollData,
    loading,
    error,
    isPolling,
    start,
    stop,
    refetch
  } = useRxPolling(
    () => RxApiService.getPollData(),
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
        <h2>Polling Data (RxJS)</h2>
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
          {isPolling ? '🟢 RxJS Polling Active' : '🔴 RxJS Polling Stopped'}
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

      <div className="rxjs-info">
        <h4>🔧 RxJS Features Used:</h4>
        <ul>
          <li><strong>interval():</strong> Creates periodic emissions</li>
          <li><strong>switchMap():</strong> Switches to new inner observable</li>
          <li><strong>takeUntil():</strong> Completes when stop signal emitted</li>
          <li><strong>startWith():</strong> Emits initial value immediately</li>
          <li><strong>catchError():</strong> Handles errors without stopping stream</li>
        </ul>
      </div>
    </div>
  );
};