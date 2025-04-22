import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../application/store/hooks';
import { 
  fetchOpportunities, 
  fetchOpportunitiesByAccountId,
  createOpportunityAsync, 
  updateOpportunityAsync, 
  deleteOpportunityAsync,
  advanceOpportunityStageAsync,
  regressOpportunityStageAsync,
  closeWonOpportunityAsync,
  closeLostOpportunityAsync
} from '../../application/store/slices/opportunity-slice';
import { fetchAccounts } from '../../application/store/slices/account-slice';
import { Opportunity, CreateOpportunityDTO } from '../../domain/model';
import { OpportunityStage } from '../../types';

/**
 * 商談ページコンポーネント
 */
export const OpportunitiesPage = () => {
  const dispatch = useAppDispatch();
  const { opportunities, loading, error } = useAppSelector(state => state.opportunities);
  const { accounts } = useAppSelector(state => state.accounts);
  
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [formData, setFormData] = useState<CreateOpportunityDTO>({
    accountId: '',
    name: '',
    stage: OpportunityStage.PROSPECTING,
    amount: 0,
    closeDate: '',
    probability: 0,
    description: '',
  });
  const [filterAccountId, setFilterAccountId] = useState<string>('');

  // コンポーネントマウント時に商談データと取引先データを取得
  useEffect(() => {
    dispatch(fetchOpportunities());
    dispatch(fetchAccounts());
  }, [dispatch]);

  // フォームの入力値を更新
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // 取引先でフィルタリング
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const accountId = e.target.value;
    setFilterAccountId(accountId);
    
    if (accountId) {
      dispatch(fetchOpportunitiesByAccountId(accountId));
    } else {
      dispatch(fetchOpportunities());
    }
  };

  // 新規作成フォームを表示
  const handleShowCreateForm = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedOpportunity(null);
    setFormData({
      accountId: '',
      name: '',
      stage: OpportunityStage.PROSPECTING,
      amount: 0,
      closeDate: '',
      probability: 0,
      description: '',
    });
  };

  // 編集フォームを表示
  const handleShowEditForm = (opportunity: Opportunity) => {
    setIsCreating(false);
    setIsEditing(true);
    setSelectedOpportunity(opportunity);
    setFormData({
      accountId: opportunity.accountId,
      name: opportunity.name,
      stage: opportunity.stage,
      amount: opportunity.amount,
      closeDate: opportunity.closeDate || '',
      probability: opportunity.probability || 0,
      description: opportunity.description || '',
    });
  };

  // フォームをキャンセル
  const handleCancelForm = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedOpportunity(null);
  };

  // 商談を作成
  const handleCreateOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createOpportunityAsync(formData))
      .unwrap()
      .then(() => {
        setIsCreating(false);
        setFormData({
          accountId: '',
          name: '',
          stage: OpportunityStage.PROSPECTING,
          amount: 0,
          closeDate: '',
          probability: 0,
          description: '',
        });
      })
      .catch(error => {
        console.error('Failed to create opportunity:', error);
      });
  };

  // 商談を更新
  const handleUpdateOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpportunity) return;

    dispatch(updateOpportunityAsync({
      id: selectedOpportunity.id,
      ...formData,
    }))
      .unwrap()
      .then(() => {
        setIsEditing(false);
        setSelectedOpportunity(null);
      })
      .catch(error => {
        console.error('Failed to update opportunity:', error);
      });
  };

  // 商談を削除
  const handleDeleteOpportunity = (id: string) => {
    if (window.confirm('この商談を削除してもよろしいですか？')) {
      dispatch(deleteOpportunityAsync(id))
        .unwrap()
        .catch(error => {
          console.error('Failed to delete opportunity:', error);
        });
    }
  };

  // 商談ステージを進める
  const handleAdvanceStage = (id: string) => {
    dispatch(advanceOpportunityStageAsync(id))
      .unwrap()
      .catch(error => {
        console.error('Failed to advance opportunity stage:', error);
      });
  };

  // 商談ステージを戻す
  const handleRegressStage = (id: string) => {
    dispatch(regressOpportunityStageAsync(id))
      .unwrap()
      .catch(error => {
        console.error('Failed to regress opportunity stage:', error);
      });
  };

  // 商談を成立させる
  const handleCloseWon = (id: string) => {
    if (window.confirm('この商談を成立としてマークしますか？')) {
      dispatch(closeWonOpportunityAsync(id))
        .unwrap()
        .catch(error => {
          console.error('Failed to close opportunity as won:', error);
        });
    }
  };

  // 商談を失注させる
  const handleCloseLost = (id: string) => {
    if (window.confirm('この商談を失注としてマークしますか？')) {
      dispatch(closeLostOpportunityAsync(id))
        .unwrap()
        .catch(error => {
          console.error('Failed to close opportunity as lost:', error);
        });
    }
  };

  // 商談ステージの表示名を取得
  const getStageName = (stage: OpportunityStage): string => {
    const stageNames: Record<OpportunityStage, string> = {
      [OpportunityStage.PROSPECTING]: '見込み',
      [OpportunityStage.QUALIFICATION]: '資格確認',
      [OpportunityStage.NEEDS_ANALYSIS]: 'ニーズ分析',
      [OpportunityStage.VALUE_PROPOSITION]: '価値提案',
      [OpportunityStage.DECISION_MAKERS]: '意思決定者',
      [OpportunityStage.PROPOSAL]: '提案',
      [OpportunityStage.NEGOTIATION]: '交渉',
      [OpportunityStage.CLOSED_WON]: '成立',
      [OpportunityStage.CLOSED_LOST]: '失注',
    };
    return stageNames[stage] || stage;
  };

  // 商談ステージに応じた色を取得
  const getStageColor = (stage: OpportunityStage): string => {
    if (stage === OpportunityStage.CLOSED_WON) {
      return 'bg-green-100 text-green-800';
    } else if (stage === OpportunityStage.CLOSED_LOST) {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-blue-100 text-blue-800';
    }
  };

  // 取引先名を取得
  const getAccountName = (accountId: string): string => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : '-';
  };

  return (
    <div className="page">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">商談一覧</h2>
        <div className="flex gap-4">
          <div>
            <label htmlFor="accountFilter" className="sr-only">取引先でフィルタ</label>
            <select
              id="accountFilter"
              value={filterAccountId}
              onChange={handleFilterChange}
              className="form-select"
              style={{ minWidth: '200px' }}
              aria-label="取引先でフィルタ"
            >
              <option value="">すべての取引先</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </select>
          </div>
          <button 
            className="form-button"
            onClick={handleShowCreateForm}
            disabled={isCreating || isEditing}
          >
            新規作成
          </button>
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}

      {(isCreating || isEditing) && (
        <div className="card mb-4">
          <h3 className="card-header">{isCreating ? '商談を新規作成' : '商談を編集'}</h3>
          <form onSubmit={isCreating ? handleCreateOpportunity : handleUpdateOpportunity}>
            <div className="form-group">
              <label htmlFor="accountId" className="form-label">取引先 *</label>
              <select
                id="accountId"
                name="accountId"
                value={formData.accountId}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">選択してください</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="name" className="form-label">商談名 *</label>
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
              <label htmlFor="stage" className="form-label">ステージ *</label>
              <select
                id="stage"
                name="stage"
                value={formData.stage}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                {Object.values(OpportunityStage).map(stage => (
                  <option key={stage} value={stage}>{getStageName(stage)}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="amount" className="form-label">金額 *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="form-input"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="closeDate" className="form-label">予定成約日</label>
              <input
                type="date"
                id="closeDate"
                name="closeDate"
                value={formData.closeDate}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="probability" className="form-label">確度 (%)</label>
              <input
                type="number"
                id="probability"
                name="probability"
                value={formData.probability}
                onChange={handleInputChange}
                className="form-input"
                min="0"
                max="100"
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
      ) : opportunities.length === 0 ? (
        <div className="text-center p-4">商談がありません。新規作成してください。</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>商談名</th>
                <th>取引先</th>
                <th>ステージ</th>
                <th>金額</th>
                <th>予定成約日</th>
                <th>確度</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map(opportunity => (
                <tr key={opportunity.id}>
                  <td>{opportunity.name}</td>
                  <td>{getAccountName(opportunity.accountId)}</td>
                  <td>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${getStageColor(opportunity.stage)}`}
                    >
                      {getStageName(opportunity.stage)}
                    </span>
                  </td>
                  <td>{opportunity.amount.toLocaleString()}円</td>
                  <td>{opportunity.closeDate || '-'}</td>
                  <td>{opportunity.probability ? `${opportunity.probability}%` : '-'}</td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      <button
                        onClick={() => handleShowEditForm(opportunity)}
                        className="form-button"
                        style={{ backgroundColor: '#4299e1', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        disabled={isCreating || isEditing}
                      >
                        編集
                      </button>
                      
                      {opportunity.stage !== OpportunityStage.CLOSED_WON && 
                       opportunity.stage !== OpportunityStage.CLOSED_LOST && (
                        <>
                          <button
                            onClick={() => handleAdvanceStage(opportunity.id)}
                            className="form-button"
                            style={{ backgroundColor: '#38a169', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            disabled={isCreating || isEditing}
                            title="ステージを進める"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => handleRegressStage(opportunity.id)}
                            className="form-button"
                            style={{ backgroundColor: '#718096', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            disabled={isCreating || isEditing}
                            title="ステージを戻す"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => handleCloseWon(opportunity.id)}
                            className="form-button"
                            style={{ backgroundColor: '#38a169', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            disabled={isCreating || isEditing}
                            title="成立"
                          >
                            成立
                          </button>
                          <button
                            onClick={() => handleCloseLost(opportunity.id)}
                            className="form-button"
                            style={{ backgroundColor: '#e53e3e', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            disabled={isCreating || isEditing}
                            title="失注"
                          >
                            失注
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => handleDeleteOpportunity(opportunity.id)}
                        className="form-button"
                        style={{ backgroundColor: '#e53e3e', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
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
