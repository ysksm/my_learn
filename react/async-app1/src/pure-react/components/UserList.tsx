import React from 'react';
import { useAsyncState } from '../hooks/useAsyncState';
import { Container } from '../../infrastructure/di/Container';

const container = Container.getInstance();

export const UserList: React.FC = () => {
  const getUsersUseCase = container.getUsersUseCase();

  const { data: users, loading, error, refetch } = useAsyncState(
    (signal) => getUsersUseCase.execute(signal),
    []
  );

  if (loading) {
    return <div className="loading">Loading users...</div>;
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
        <h2>Users (Pure React)</h2>
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
    </div>
  );
};