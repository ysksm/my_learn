import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../application/store/hooks';
import { 
  fetchAccounts, 
  createAccountAsync, 
  updateAccountAsync, 
  deleteAccountAsync 
} from '../../application/store/slices/account-slice';
import { Account, CreateAccountDTO } from '../../domain/model';

/**
 * 取引先ページコンポーネント
 */
export const AccountsPage = () => {
  const dispatch = useAppDispatch();
  const { accounts, loading, error } = useAppSelector(state => state.accounts);
  
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<CreateAccountDTO>({
    name: '',
    industry: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: '',
  });

  // コンポーネントマウント時に取引先データを取得
  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  // フォームの入力値を更新
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 新規作成フォームを表示
  const handleShowCreateForm = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedAccount(null);
    setFormData({
      name: '',
      industry: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      description: '',
    });
  };

  // 編集フォームを表示
  const handleShowEditForm = (account: Account) => {
    setIsCreating(false);
    setIsEditing(true);
    setSelectedAccount(account);
    setFormData({
      name: account.name,
      industry: account.industry,
      address: account.address || '',
      phone: account.phone || '',
      email: account.email || '',
      website: account.website || '',
      description: account.description || '',
    });
  };

  // フォームをキャンセル
  const handleCancelForm = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedAccount(null);
  };

  // 取引先を作成
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createAccountAsync(formData))
      .unwrap()
      .then(() => {
        setIsCreating(false);
        setFormData({
          name: '',
          industry: '',
          address: '',
          phone: '',
          email: '',
          website: '',
          description: '',
        });
      })
      .catch(error => {
        console.error('Failed to create account:', error);
      });
  };

  // 取引先を更新
  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    dispatch(updateAccountAsync({
      id: selectedAccount.id,
      ...formData,
    }))
      .unwrap()
      .then(() => {
        setIsEditing(false);
        setSelectedAccount(null);
      })
      .catch(error => {
        console.error('Failed to update account:', error);
      });
  };

  // 取引先を削除
  const handleDeleteAccount = (id: string) => {
    if (window.confirm('この取引先を削除してもよろしいですか？')) {
      dispatch(deleteAccountAsync(id))
        .unwrap()
        .catch(error => {
          console.error('Failed to delete account:', error);
        });
    }
  };

  // 業界の選択肢
  const industries = [
    '製造業',
    'IT・通信',
    '金融・保険',
    '小売・卸売',
    '医療・福祉',
    '建設・不動産',
    '運輸・物流',
    'エネルギー',
    '教育',
    'その他',
  ];

  return (
    <div className="page">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">取引先一覧</h2>
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
          <h3 className="card-header">{isCreating ? '取引先を新規作成' : '取引先を編集'}</h3>
          <form onSubmit={isCreating ? handleCreateAccount : handleUpdateAccount}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">取引先名 *</label>
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
              <label htmlFor="industry" className="form-label">業界 *</label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">選択してください</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="address" className="form-label">住所</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">電話番号</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">メールアドレス</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="website" className="form-label">Webサイト</label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="form-input"
              />
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
      ) : accounts.length === 0 ? (
        <div className="text-center p-4">取引先がありません。新規作成してください。</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>取引先名</th>
                <th>業界</th>
                <th>電話番号</th>
                <th>メールアドレス</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(account => (
                <tr key={account.id}>
                  <td>{account.name}</td>
                  <td>{account.industry}</td>
                  <td>{account.phone || '-'}</td>
                  <td>{account.email || '-'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleShowEditForm(account)}
                        className="form-button"
                        style={{ backgroundColor: '#4299e1', padding: '0.25rem 0.5rem' }}
                        disabled={isCreating || isEditing}
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
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
