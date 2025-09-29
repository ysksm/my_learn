import React, { useState } from 'react';
import { useRxTimeout } from '../hooks/useRxTimeout';
import { RxApiService } from '../services/RxApiService';

export const RxTimeoutTest: React.FC = () => {
  const [delay, setDelay] = useState(2000);
  const [timeoutMs, setTimeoutMs] = useState(5000);

  const {
    data,
    loading,
    error,
    execute,
    cancel
  } = useRxTimeout(
    () => RxApiService.getSlowData(delay),
    timeoutMs
  );

  const handleTest = () => {
    execute();
  };

  return (
    <div className="timeout-test">
      <h2>Timeout Test (RxJS)</h2>

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
            ⏳ Testing RxJS timeout with {delay}ms delay...
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

        {data && !loading && (
          <div className="success">
            <h3>✅ Success!</h3>
            <p>RxJS Observable completed successfully</p>
            <div className="data">
              <strong>Response:</strong>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>

      <div className="rxjs-info">
        <h4>🔧 RxJS Features Used:</h4>
        <ul>
          <li><strong>timeout():</strong> Emits error if source doesn't emit within time</li>
          <li><strong>catchError():</strong> Transforms TimeoutError to RepositoryError</li>
          <li><strong>throwError():</strong> Creates error observable</li>
          <li><strong>Subscription:</strong> Can be unsubscribed for cancellation</li>
        </ul>
      </div>

      <div className="explanation">
        <h3>How RxJS timeout works:</h3>
        <ul>
          <li>timeout() operator automatically cancels slow requests</li>
          <li>More declarative than Promise.race approach</li>
          <li>Cleaner error handling with catchError operator</li>
          <li>Subscription-based cancellation is more explicit</li>
        </ul>
      </div>
    </div>
  );
};