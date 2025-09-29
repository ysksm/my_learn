import React from 'react';
import { useRxMultiple } from '../hooks/useRxMultiple';
import { RxApiService } from '../services/RxApiService';

interface CombinedData {
  users: any[];
  posts: any[];
  userCount: number;
  postCount: number;
  summary: string;
}

export const RxMultipleTest: React.FC = () => {
  const {
    data,
    loading,
    error,
    progress,
    executeParallel,
    executeSequential,
    cancel
  } = useRxMultiple(
    [
      () => RxApiService.getUsers(),
      () => RxApiService.getAllPosts()
    ],
    (results): CombinedData => {
      const [usersResult, postsResult] = results;
      const users = usersResult || [];
      const posts = postsResult || [];

      return {
        users,
        posts,
        userCount: users.length,
        postCount: posts.length,
        summary: `Found ${users.length} users and ${posts.length} posts via RxJS`
      };
    }
  );

  return (
    <div className="multiple-api-test">
      <h2>Multiple API Test (RxJS)</h2>

      <div className="controls">
        <button
          onClick={executeParallel}
          disabled={loading}
          className="parallel"
        >
          Execute Parallel
        </button>
        <button
          onClick={executeSequential}
          disabled={loading}
          className="sequential"
        >
          Execute Sequential
        </button>
        {loading && (
          <button onClick={cancel} className="cancel">
            Cancel
          </button>
        )}
      </div>

      {loading && (
        <div className="progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p>RxJS Progress: {progress.toFixed(1)}%</p>
        </div>
      )}

      {error && (
        <div className="error">
          <h3>❌ Error</h3>
          <p>{error.message}</p>
          <small>Error code: {error.code}</small>
        </div>
      )}

      {data && !loading && (
        <div className="results">
          <h3>✅ Combined Results</h3>
          <div className="summary">
            <p>{data.summary}</p>
          </div>

          <div className="data-grid">
            <div className="data-section">
              <h4>Users ({data.userCount})</h4>
              <div className="data-list">
                {data.users.slice(0, 3).map((user, index) => (
                  <div key={index} className="data-item">
                    <strong>{user.displayName || user.name}</strong>
                    <small>{user.email}</small>
                  </div>
                ))}
                {data.userCount > 3 && (
                  <div className="more">... and {data.userCount - 3} more</div>
                )}
              </div>
            </div>

            <div className="data-section">
              <h4>Posts ({data.postCount})</h4>
              <div className="data-list">
                {data.posts.slice(0, 3).map((post, index) => (
                  <div key={index} className="data-item">
                    <strong>{post.title}</strong>
                    <small>By User {post.authorId}</small>
                  </div>
                ))}
                {data.postCount > 3 && (
                  <div className="more">... and {data.postCount - 3} more</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rxjs-info">
        <h4>🔧 RxJS Features Used:</h4>
        <ul>
          <li><strong>combineLatest():</strong> Waits for all observables (parallel)</li>
          <li><strong>concat():</strong> Executes observables in sequence</li>
          <li><strong>scan():</strong> Accumulates results for progress tracking</li>
          <li><strong>map():</strong> Transforms emission data</li>
          <li><strong>catchError():</strong> Graceful error handling per stream</li>
        </ul>
      </div>

      <div className="explanation">
        <h3>RxJS vs Promise Comparison:</h3>
        <ul>
          <li><strong>Parallel:</strong> combineLatest() vs Promise.all()</li>
          <li><strong>Sequential:</strong> concat() + scan() vs manual async/await loop</li>
          <li><strong>Cancellation:</strong> Unsubscribe vs AbortController</li>
          <li><strong>Progress:</strong> Built-in with scan() vs manual tracking</li>
          <li><strong>Error handling:</strong> Per-stream catchError vs try/catch blocks</li>
        </ul>
      </div>
    </div>
  );
};