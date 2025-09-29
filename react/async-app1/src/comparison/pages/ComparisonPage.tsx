import React, { useState } from 'react';
import { UserList } from '../../pure-react/components/UserList';
import { RxUserList } from '../../rxjs/components/RxUserList';
import { PollingData } from '../../pure-react/components/PollingData';
import { RxPollingData } from '../../rxjs/components/RxPollingData';
import { TimeoutTest } from '../../pure-react/components/TimeoutTest';
import { RxTimeoutTest } from '../../rxjs/components/RxTimeoutTest';
import { MultipleApiTest } from '../../pure-react/components/MultipleApiTest';
import { RxMultipleTest } from '../../rxjs/components/RxMultipleTest';

type ComparisonView = 'users' | 'polling' | 'timeout' | 'multiple';

export const ComparisonPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<ComparisonView>('users');

  const renderComparison = () => {
    switch (currentView) {
      case 'users':
        return (
          <div className="comparison-grid">
            <div className="comparison-section pure-react">
              <UserList />
            </div>
            <div className="comparison-section rxjs">
              <RxUserList />
            </div>
          </div>
        );
      case 'polling':
        return (
          <div className="comparison-grid">
            <div className="comparison-section pure-react">
              <PollingData />
            </div>
            <div className="comparison-section rxjs">
              <RxPollingData />
            </div>
          </div>
        );
      case 'timeout':
        return (
          <div className="comparison-grid">
            <div className="comparison-section pure-react">
              <TimeoutTest />
            </div>
            <div className="comparison-section rxjs">
              <RxTimeoutTest />
            </div>
          </div>
        );
      case 'multiple':
        return (
          <div className="comparison-grid">
            <div className="comparison-section pure-react">
              <MultipleApiTest />
            </div>
            <div className="comparison-section rxjs">
              <RxMultipleTest />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="comparison-page">
      <header className="page-header">
        <h1>Pure React vs RxJS Comparison</h1>
        <p>
          Side-by-side comparison of the same async operations implemented with
          Pure React (left) and RxJS (right). Notice the differences in approach
          and complexity.
        </p>
      </header>

      <nav className="comparison-nav">
        <button
          onClick={() => setCurrentView('users')}
          className={currentView === 'users' ? 'active' : ''}
        >
          Basic API Calls
        </button>
        <button
          onClick={() => setCurrentView('polling')}
          className={currentView === 'polling' ? 'active' : ''}
        >
          Polling
        </button>
        <button
          onClick={() => setCurrentView('timeout')}
          className={currentView === 'timeout' ? 'active' : ''}
        >
          Timeout Handling
        </button>
        <button
          onClick={() => setCurrentView('multiple')}
          className={currentView === 'multiple' ? 'active' : ''}
        >
          Multiple APIs
        </button>
      </nav>

      <div className="comparison-content">
        {renderComparison()}
      </div>

      <div className="comparison-analysis">
        <h2>Analysis: Pure React vs RxJS</h2>

        <div className="analysis-grid">
          <div className="analysis-section">
            <h3>📊 Complexity Comparison</h3>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Aspect</th>
                  <th>Pure React</th>
                  <th>RxJS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Learning Curve</td>
                  <td className="advantage">Lower</td>
                  <td>Higher</td>
                </tr>
                <tr>
                  <td>Code Readability</td>
                  <td>Imperative</td>
                  <td className="advantage">Declarative</td>
                </tr>
                <tr>
                  <td>Error Handling</td>
                  <td>Manual try/catch</td>
                  <td className="advantage">Operator-based</td>
                </tr>
                <tr>
                  <td>Cancellation</td>
                  <td>AbortController</td>
                  <td className="advantage">Built-in subscription</td>
                </tr>
                <tr>
                  <td>Time Operations</td>
                  <td>Manual timing</td>
                  <td className="advantage">First-class support</td>
                </tr>
                <tr>
                  <td>Bundle Size</td>
                  <td className="advantage">Smaller</td>
                  <td>Larger (+RxJS)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="analysis-section">
            <h3>🎯 When to Use Each</h3>

            <div className="recommendation">
              <h4>Choose Pure React When:</h4>
              <ul>
                <li>Simple async operations</li>
                <li>Small team or project</li>
                <li>Bundle size is critical</li>
                <li>Limited time for learning</li>
                <li>Basic CRUD operations</li>
              </ul>
            </div>

            <div className="recommendation">
              <h4>Choose RxJS When:</h4>
              <ul>
                <li>Complex async workflows</li>
                <li>Real-time data streams</li>
                <li>Heavy cancellation needs</li>
                <li>Time-based operations</li>
                <li>Team familiar with reactive programming</li>
              </ul>
            </div>
          </div>

          <div className="analysis-section">
            <h3>📈 Performance Considerations</h3>

            <div className="performance-grid">
              <div className="performance-item">
                <h4>Memory Usage</h4>
                <p><strong>Pure React:</strong> Manual cleanup required</p>
                <p><strong>RxJS:</strong> Automatic with unsubscribe</p>
              </div>

              <div className="performance-item">
                <h4>Request Deduplication</h4>
                <p><strong>Pure React:</strong> Manual implementation needed</p>
                <p><strong>RxJS:</strong> Built-in with operators like shareReplay</p>
              </div>

              <div className="performance-item">
                <h4>Error Recovery</h4>
                <p><strong>Pure React:</strong> Restart from scratch</p>
                <p><strong>RxJS:</strong> Sophisticated retry strategies</p>
              </div>
            </div>
          </div>
        </div>

        <div className="final-verdict">
          <h3>🏆 Verdict</h3>
          <p>
            Both approaches have their strengths. <strong>Pure React</strong> is excellent for
            straightforward async operations and when you want to minimize dependencies.
            <strong>RxJS</strong> shines in complex scenarios with sophisticated async requirements
            but comes with a steeper learning curve and larger bundle size.
          </p>
          <p>
            The best choice depends on your specific use case, team expertise, and project requirements.
          </p>
        </div>
      </div>
    </div>
  );
};