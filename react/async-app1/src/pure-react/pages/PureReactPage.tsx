import React from 'react';
import { UserList } from '../components/UserList';
import { PollingData } from '../components/PollingData';
import { TimeoutTest } from '../components/TimeoutTest';
import { MultipleApiTest } from '../components/MultipleApiTest';

export const PureReactPage: React.FC = () => {
  return (
    <div className="pure-react-page">
      <header className="page-header">
        <h1>Pure React Async Implementation</h1>
        <p>
          This page demonstrates async operations using only React's built-in features:
          useState, useEffect, and custom hooks.
        </p>
      </header>

      <div className="sections">
        <section className="section">
          <UserList />
        </section>

        <section className="section">
          <PollingData />
        </section>

        <section className="section">
          <TimeoutTest />
        </section>

        <section className="section">
          <MultipleApiTest />
        </section>
      </div>

      <footer className="page-footer">
        <h3>Pure React Features Used:</h3>
        <ul>
          <li><strong>useState:</strong> Managing loading, data, and error states</li>
          <li><strong>useEffect:</strong> Triggering API calls and cleanup</li>
          <li><strong>useCallback:</strong> Memoizing functions to prevent unnecessary re-renders</li>
          <li><strong>useRef:</strong> Storing mutable values (AbortController, timers)</li>
          <li><strong>AbortController:</strong> Cancelling ongoing requests</li>
          <li><strong>Promise.all/race:</strong> Handling multiple/timeout operations</li>
        </ul>
      </footer>
    </div>
  );
};