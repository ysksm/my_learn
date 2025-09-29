import React, { useState } from 'react';
import { useTimeout } from '../hooks/useTimeout';
import { ApiClient } from '../../infrastructure/api/ApiClient';

const apiClient = new ApiClient();

export const TimeoutTest: React.FC = () => {
  const [delay, setDelay] = useState(2000);
  const [timeoutMs, setTimeoutMs] = useState(5000);

  const {
    data,
    loading,
    error,
    execute,
    cancel
  } = useTimeout(
    (signal) => apiClient.get(`/api/timeout/slow/${delay}`, { signal }),
    timeoutMs
  );

  const handleTest = () => {
    execute();
  };

  return (
    <div className="timeout-test">
      <h2>Timeout Test (Pure React)</h2>

      <div className="controls">
        <div className="control-group">
          <label>
            API Delay (ms):
            <input
              type="number"
              value={delay}
              onChange={(e) => setDelay(Number(e.target.value))}
              min="0"
              max="30000"
              step="500"
            />
          </label>
        </div>

        <div className="control-group">
          <label>
            Timeout (ms):
            <input
              type="number"
              value={timeoutMs}
              onChange={(e) => setTimeoutMs(Number(e.target.value))}
              min="1000"
              max="60000"
              step="1000"
            />
          </label>
        </div>

        <div className="buttons">
          <button onClick={handleTest} disabled={loading}>
            {loading ? 'Testing...' : 'Start Test'}
          </button>
          {loading && (
            <button onClick={cancel} className="cancel">
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="result">
        {loading && (
          <div className="loading">
            ⏳ Testing timeout with {delay}ms delay...
            <br />
            <small>Will timeout after {timeoutMs}ms</small>
          </div>
        )}

        {error && (
          <div className="error">
            <h3>❌ {error.code === 'TIMEOUT' ? 'Timeout!' : 'Error'}</h3>
            <p>{error.message}</p>
            <small>Error code: {error.code}</small>
          </div>
        )}

        {(data && !loading) ? (
          <div className="success">
            <h3>✅ Success!</h3>
            <p>API responded successfully</p>
            <div className="data">
              <strong>Response:</strong>
              <pre>{JSON.stringify(data as any, null, 2)}</pre>
            </div>
          </div>
        ) : null}
      </div>

      <div className="explanation">
        <h3>How it works:</h3>
        <ul>
          <li>Set an API delay to simulate slow responses</li>
          <li>Set a timeout threshold</li>
          <li>If API delay {'>'} timeout: Request times out</li>
          <li>If API delay {'<'} timeout: Request succeeds</li>
          <li>Use Cancel button to manually abort</li>
        </ul>
      </div>
    </div>
  );
};