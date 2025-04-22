import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../application/store/hooks';
import { 
  fetchProducts, 
  createProductAsync, 
  updateProductAsync, 
  deleteProductAsync 
} from '../../application/store/slices/product-slice';
import { Product, CreateProductDTO } from '../../domain/model';

/**
 * 納入商品ページコンポーネント
 */
export const ProductsPage = () => {
  const dispatch = useAppDispatch();
  const { products, loading, error } = useAppSelector(state => state.products);
  
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<CreateProductDTO>({
    name: '',
    price: 0,
    code: '',
    description: '',
    category: '',
    isActive: true,
  });

  // コンポーネントマウント時に納入商品データを取得
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // フォームの入力値を更新
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // 新規作成フォームを表示
  const handleShowCreateForm = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedProduct(null);
    setFormData({
      name: '',
      price: 0,
      code: '',
      description: '',
      category: '',
      isActive: true,
    });
  };

  // 編集フォームを表示
  const handleShowEditForm = (product: Product) => {
    setIsCreating(false);
    setIsEditing(true);
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      code: product.code || '',
      description: product.description || '',
      category: product.category || '',
      isActive: product.isActive,
    });
  };

  // フォームをキャンセル
  const handleCancelForm = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedProduct(null);
  };

  // 納入商品を作成
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createProductAsync(formData))
      .unwrap()
      .then(() => {
        setIsCreating(false);
        setFormData({
          name: '',
          price: 0,
          code: '',
          description: '',
          category: '',
          isActive: true,
        });
      })
      .catch(error => {
        console.error('Failed to create product:', error);
      });
  };

  // 納入商品を更新
  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    dispatch(updateProductAsync({
      id: selectedProduct.id,
      ...formData,
    }))
      .unwrap()
      .then(() => {
        setIsEditing(false);
        setSelectedProduct(null);
      })
      .catch(error => {
        console.error('Failed to update product:', error);
      });
  };

  // 納入商品を削除
  const handleDeleteProduct = (id: string) => {
    if (window.confirm('この納入商品を削除してもよろしいですか？')) {
      dispatch(deleteProductAsync(id))
        .unwrap()
        .catch(error => {
          console.error('Failed to delete product:', error);
        });
    }
  };

  // カテゴリの選択肢
  const categories = [
    'ハードウェア',
    'ソフトウェア',
    'サービス',
    'サポート',
    'トレーニング',
    'コンサルティング',
    'その他',
  ];

  return (
    <div className="page">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">納入商品一覧</h2>
        <button 
          className="form-button"
          onClick={handleShowCreateForm}
          disabled={isCreating || isEditing}
        >
          新規作成
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}

      {(isCreating || isEditing) && (
        <div className="card mb-4">
          <h3 className="card-header">{isCreating ? '納入商品を新規作成' : '納入商品を編集'}</h3>
          <form onSubmit={isCreating ? handleCreateProduct : handleUpdateProduct}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">商品名 *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="price" className="form-label">価格 *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="form-input"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="code" className="form-label">商品コード</label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category" className="form-label">カテゴリ</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">選択してください</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">説明</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-input"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                有効
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelForm}
                className="form-button"
                style={{ backgroundColor: '#718096' }}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="form-button"
                disabled={loading}
              >
                {loading ? '処理中...' : isCreating ? '作成' : '更新'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !isCreating && !isEditing ? (
        <div className="text-center p-4">読み込み中...</div>
      ) : products.length === 0 ? (
        <div className="text-center p-4">納入商品がありません。新規作成してください。</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>商品名</th>
                <th>価格</th>
                <th>商品コード</th>
                <th>カテゴリ</th>
                <th>ステータス</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.price.toLocaleString()}円</td>
                  <td>{product.code || '-'}</td>
                  <td>{product.category || '-'}</td>
                  <td>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        product.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.isActive ? '有効' : '無効'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleShowEditForm(product)}
                        className="form-button"
                        style={{ backgroundColor: '#4299e1', padding: '0.25rem 0.5rem' }}
                        disabled={isCreating || isEditing}
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="form-button"
                        style={{ backgroundColor: '#e53e3e', padding: '0.25rem 0.5rem' }}
                        disabled={isCreating || isEditing}
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
