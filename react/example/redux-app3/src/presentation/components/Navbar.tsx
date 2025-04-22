import { Link } from 'react-router-dom';

/**
 * ナビゲーションバーコンポーネント
 */
export const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1>
          <Link to="/" className="navbar-brand">
            CRM System
          </Link>
        </h1>
        
        <div className="navbar-links">
          <Link to="/accounts" className="navbar-link">
            取引先
          </Link>
          <Link to="/products" className="navbar-link">
            納入商品
          </Link>
          <Link to="/opportunities" className="navbar-link">
            商談
          </Link>
          <Link to="/activities" className="navbar-link">
            活動
          </Link>
        </div>
      </div>
    </nav>
  );
};
