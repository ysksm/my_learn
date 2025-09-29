import { useState } from 'react'
import { PureReactPage } from './pure-react/pages/PureReactPage'
import { RxJSPage } from './rxjs/pages/RxJSPage'
import { ComparisonPage } from './comparison/pages/ComparisonPage'
import './App.css'

type PageType = 'home' | 'pure-react' | 'rxjs' | 'comparison';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home')

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div className="home-page">
            <h1>React Async Learning Project</h1>
            <p>
              This project demonstrates different approaches to handling async operations in React.
            </p>
            <div className="nav-cards">
              <div className="nav-card" onClick={() => setCurrentPage('pure-react')}>
                <h2>Pure React</h2>
                <p>Using only React's built-in features</p>
              </div>
              <div className="nav-card" onClick={() => setCurrentPage('rxjs')}>
                <h2>RxJS</h2>
                <p>Using reactive programming</p>
              </div>
              <div className="nav-card" onClick={() => setCurrentPage('comparison')}>
                <h2>Comparison</h2>
                <p>Side-by-side comparison</p>
              </div>
            </div>
          </div>
        );
      case 'pure-react':
        return <PureReactPage />;
      case 'rxjs':
        return <RxJSPage />;
      case 'comparison':
        return <ComparisonPage />;
      default:
        return <div>Page not found</div>;
    }
  }

  return (
    <div className="app">
      <nav className="app-nav">
        <button
          onClick={() => setCurrentPage('home')}
          className={currentPage === 'home' ? 'active' : ''}
        >
          Home
        </button>
        <button
          onClick={() => setCurrentPage('pure-react')}
          className={currentPage === 'pure-react' ? 'active' : ''}
        >
          Pure React
        </button>
        <button
          onClick={() => setCurrentPage('rxjs')}
          className={currentPage === 'rxjs' ? 'active' : ''}
        >
          RxJS
        </button>
        <button
          onClick={() => setCurrentPage('comparison')}
          className={currentPage === 'comparison' ? 'active' : ''}
        >
          Comparison
        </button>
      </nav>

      <main className="app-main">
        {renderPage()}
      </main>
    </div>
  )
}

export default App
