import React from 'react';
import { useObservable } from '../hooks/useObservable';
import { RxApiService } from '../services/RxApiService';

export const RxUserList: React.FC = () => {
  const { data: users, loading, error, refetch } = useObservable(
    () => RxApiService.getUsers(),
    []
  );

  if (loading) {
    return <div className="loading">Loading users with RxJS...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error.message}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  return (
    <div className="user-list">
      <div className="header">
        <h2>Users (RxJS)</h2>
        <button onClick={refetch}>Refresh</button>
      </div>

      {users && users.length > 0 ? (
        <ul>
          {users.map(user => (
            <li key={user.id} className="user-item">
              <div className="user-info">
                <h3>{user.displayName}</h3>
                <p>Email: {user.email}</p>
                <p>Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                <span className={`email-status ${user.isValidEmail ? 'valid' : 'invalid'}`}>
                  {user.isValidEmail ? '✓ Valid email' : '✗ Invalid email'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No users found</p>
      )}

      <div className="rxjs-info">
        <h4>🔧 RxJS Features Used:</h4>
        <ul>
          <li><strong>from():</strong> Converts Promise to Observable</li>
          <li><strong>map():</strong> Transforms Result to data</li>
          <li><strong>catchError():</strong> Handles errors in the stream</li>
          <li><strong>Subscription:</strong> Manages observable lifecycle</li>
        </ul>
      </div>
    </div>
  );
};