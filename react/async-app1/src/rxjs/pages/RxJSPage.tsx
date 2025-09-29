import React from 'react';
import { RxUserList } from '../components/RxUserList';
import { RxPollingData } from '../components/RxPollingData';
import { RxTimeoutTest } from '../components/RxTimeoutTest';
import { RxMultipleTest } from '../components/RxMultipleTest';

export const RxJSPage: React.FC = () => {
  return (
    <div className="rxjs-page">
      <header className="page-header">
        <h1>RxJS Reactive Implementation</h1>
        <p>
          This page demonstrates the same async operations using RxJS reactive programming.
          Compare the declarative approach with the imperative Pure React implementation.
        </p>
      </header>

      <div className="sections">
        <section className="section">
          <RxUserList />
        </section>

        <section className="section">
          <RxPollingData />
        </section>

        <section className="section">
          <RxTimeoutTest />
        </section>

        <section className="section">
          <RxMultipleTest />
        </section>
      </div>

      <footer className="page-footer rxjs-footer">
        <h3>RxJS Reactive Programming Benefits:</h3>
        <ul>
          <li><strong>Declarative:</strong> Describe what you want, not how to get it</li>
          <li><strong>Composable:</strong> Operators can be chained and combined</li>
          <li><strong>Cancellable:</strong> Built-in subscription management</li>
          <li><strong>Time-aware:</strong> First-class support for time-based operations</li>
          <li><strong>Error handling:</strong> Robust error recovery with operators</li>
          <li><strong>Memory efficient:</strong> Lazy evaluation and automatic cleanup</li>
          <li><strong>Consistent:</strong> Same patterns for all async scenarios</li>
        </ul>

        <h3>Key RxJS Concepts Used:</h3>
        <div className="concept-grid">
          <div className="concept">
            <h4>Observable</h4>
            <p>Stream of data over time</p>
          </div>
          <div className="concept">
            <h4>Operators</h4>
            <p>Transform, filter, combine streams</p>
          </div>
          <div className="concept">
            <h4>Subscription</h4>
            <p>Manage lifecycle and cleanup</p>
          </div>
          <div className="concept">
            <h4>Subject</h4>
            <p>Emit values imperatively</p>
          </div>
        </div>
      </footer>
    </div>
  );
};