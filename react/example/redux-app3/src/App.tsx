import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './application/store';
import { Navbar } from './presentation/components/Navbar';
import { useLocalStorageSync } from './presentation/hooks';

// ページコンポーネントのインポート
import { AccountsPage } from './presentation/pages/AccountsPage';
import { ProductsPage } from './presentation/pages/ProductsPage';
import { OpportunitiesPage } from './presentation/pages/OpportunitiesPage';
import { ActivitiesPage } from './presentation/pages/ActivitiesPage';

// ホームページコンポーネント
const HomePage = () => (
  <div className="page">
    <h1 className="text-xl font-bold mb-4">CRMシステム</h1>
    <p className="mb-4">
      このCRMシステムでは、取引先、納入商品、商談、活動を管理できます。
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="card">
        <h2 className="card-header">取引先</h2>
        <p className="card-body">取引先の情報を管理します。</p>
        <div className="card-footer">
          <Link to="/accounts" className="form-button">取引先一覧へ</Link>
        </div>
      </div>
      <div className="card">
        <h2 className="card-header">納入商品</h2>
        <p className="card-body">納入商品の情報を管理します。</p>
        <div className="card-footer">
          <Link to="/products" className="form-button">納入商品一覧へ</Link>
        </div>
      </div>
      <div className="card">
        <h2 className="card-header">商談</h2>
        <p className="card-body">商談の情報を管理します。</p>
        <div className="card-footer">
          <Link to="/opportunities" className="form-button">商談一覧へ</Link>
        </div>
      </div>
      <div className="card">
        <h2 className="card-header">活動</h2>
        <p className="card-body">活動の情報を管理します。</p>
        <div className="card-footer">
          <Link to="/activities" className="form-button">活動一覧へ</Link>
        </div>
      </div>
    </div>
  </div>
);

// LocalStorageの同期を行うコンポーネント
const LocalStorageSyncComponent = () => {
  useLocalStorageSync();
  return null;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <LocalStorageSyncComponent />
        <div className="app">
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/accounts" element={<AccountsPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/opportunities" element={<OpportunitiesPage />} />
              <Route path="/activities" element={<ActivitiesPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
