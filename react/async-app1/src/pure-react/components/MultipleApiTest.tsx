import React from 'react';
import { useMultipleAsync } from '../hooks/useMultipleAsync';
import { Container } from '../../infrastructure/di/Container';

const container = Container.getInstance();

interface CombinedData {
  users: any[];
  posts: any[];
  userCount: number;
  postCount: number;
  summary: string;
}

export const MultipleApiTest: React.FC = () => {
  const userRepository = container.getUserRepository();
  const postRepository = container.getPostRepository();

  const {
    data,
    loading,
    error,
    progress,
    executeParallel,
    executeSequential,
    cancel
  } = useMultipleAsync(
    [
      (signal) => userRepository.getAllUsers(signal),
      (signal) => postRepository.getAllPosts(signal)
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
        summary: `Found ${users.length} users and ${posts.length} posts`
      };
    }
  );

  return (
    <div className="multiple-api-test">
      <h2>Multiple API Test (Pure React)</h2>

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
          <p>Progress: {progress.toFixed(1)}%</p>
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
                    <strong>{user.name}</strong>
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

      <div className="explanation">
        <h3>Execution Types:</h3>
        <ul>
          <li><strong>Parallel:</strong> Calls both APIs simultaneously using Promise.all()</li>
          <li><strong>Sequential:</strong> Calls APIs one after another with progress tracking</li>
          <li>Both approaches handle errors and cancellation properly</li>
        </ul>
      </div>
    </div>
  );
};