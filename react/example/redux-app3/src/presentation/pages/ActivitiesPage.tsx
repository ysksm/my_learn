import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../application/store/hooks';
import { 
  fetchActivities, 
  fetchActivitiesByRelatedTo,
  fetchActivitiesByType,
  fetchActivitiesByStatus,
  createActivityAsync, 
  updateActivityAsync, 
  deleteActivityAsync,
  completeActivityAsync,
  cancelActivityAsync
} from '../../application/store/slices/activity-slice';
import { fetchAccounts } from '../../application/store/slices/account-slice';
import { fetchOpportunities } from '../../application/store/slices/opportunity-slice';
import { Activity, CreateActivityDTO } from '../../domain/model';
import { ActivityType, RelatedToType } from '../../types';

/**
 * 活動ページコンポーネント
 */
export const ActivitiesPage = () => {
  const dispatch = useAppDispatch();
  const { activities, loading, error } = useAppSelector(state => state.activities);
  const { accounts } = useAppSelector(state => state.accounts);
  const { opportunities } = useAppSelector(state => state.opportunities);
  
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState<CreateActivityDTO>({
    relatedTo: { type: RelatedToType.ACCOUNT, id: '' },
    type: ActivityType.MEETING,
    subject: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'planned',
    description: '',
    assignedTo: '',
  });
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // コンポーネントマウント時に活動データと関連データを取得
  useEffect(() => {
    dispatch(fetchActivities());
    dispatch(fetchAccounts());
    dispatch(fetchOpportunities());
  }, [dispatch]);

  // フォームの入力値を更新
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'relatedToType') {
      setFormData(prev => ({
        ...prev,
        relatedTo: {
          ...prev.relatedTo,
          type: value as RelatedToType,
          id: '', // 関連先タイプが変更されたら、IDをリセット
        },
      }));
    } else if (name === 'relatedToId') {
      setFormData(prev => ({
        ...prev,
        relatedTo: {
          ...prev.relatedTo,
          id: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // 活動タイプでフィルタリング
  const handleFilterTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    setFilterType(type);
    
    if (type) {
      dispatch(fetchActivitiesByType(type as ActivityType));
    } else {
      dispatch(fetchActivities());
    }
  };

  // ステータスでフィルタリング
  const handleFilterStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    setFilterStatus(status);
    
    if (status) {
      dispatch(fetchActivitiesByStatus(status as 'planned' | 'completed' | 'canceled'));
    } else {
      dispatch(fetchActivities());
    }
  };

  // 新規作成フォームを表示
  const handleShowCreateForm = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedActivity(null);
    setFormData({
      relatedTo: { type: RelatedToType.ACCOUNT, id: '' },
      type: ActivityType.MEETING,
      subject: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      status: 'planned',
      description: '',
      assignedTo: '',
    });
  };

  // 編集フォームを表示
  const handleShowEditForm = (activity: Activity) => {
    setIsCreating(false);
    setIsEditing(true);
    setSelectedActivity(activity);
    setFormData({
      relatedTo: activity.relatedTo,
      type: activity.type,
      subject: activity.subject,
      date: activity.date,
      dueDate: activity.dueDate || '',
      status: activity.status || 'planned',
      description: activity.description || '',
      assignedTo: activity.assignedTo || '',
    });
  };

  // フォームをキャンセル
  const handleCancelForm = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedActivity(null);
  };

  // 活動を作成
  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createActivityAsync(formData))
      .unwrap()
      .then(() => {
        setIsCreating(false);
        setFormData({
          relatedTo: { type: RelatedToType.ACCOUNT, id: '' },
          type: ActivityType.MEETING,
          subject: '',
          date: new Date().toISOString().split('T')[0],
          dueDate: '',
          status: 'planned',
          description: '',
          assignedTo: '',
        });
      })
      .catch(error => {
        console.error('Failed to create activity:', error);
      });
  };

  // 活動を更新
  const handleUpdateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;

    dispatch(updateActivityAsync({
      id: selectedActivity.id,
      ...formData,
    }))
      .unwrap()
      .then(() => {
        setIsEditing(false);
        setSelectedActivity(null);
      })
      .catch(error => {
        console.error('Failed to update activity:', error);
      });
  };

  // 活動を削除
  const handleDeleteActivity = (id: string) => {
    if (window.confirm('この活動を削除してもよろしいですか？')) {
      dispatch(deleteActivityAsync(id))
        .unwrap()
        .catch(error => {
          console.error('Failed to delete activity:', error);
        });
    }
  };

  // 活動を完了としてマークする
  const handleCompleteActivity = (id: string) => {
    dispatch(completeActivityAsync(id))
      .unwrap()
      .catch(error => {
        console.error('Failed to complete activity:', error);
      });
  };

  // 活動をキャンセルとしてマークする
  const handleCancelActivity = (id: string) => {
    if (window.confirm('この活動をキャンセルとしてマークしますか？')) {
      dispatch(cancelActivityAsync(id))
        .unwrap()
        .catch(error => {
          console.error('Failed to cancel activity:', error);
        });
    }
  };

  // 活動タイプの表示名を取得
  const getTypeName = (type: ActivityType): string => {
    const typeNames: Record<ActivityType, string> = {
      [ActivityType.CALL]: '電話',
      [ActivityType.EMAIL]: 'メール',
      [ActivityType.MEETING]: '会議',
      [ActivityType.TASK]: 'タスク',
    };
    return typeNames[type] || type;
  };

  // 関連先の表示名を取得
  const getRelatedToName = (relatedTo: { type: RelatedToType; id: string }): string => {
    if (relatedTo.type === RelatedToType.ACCOUNT) {
      const account = accounts.find(a => a.id === relatedTo.id);
      return account ? `取引先: ${account.name}` : '-';
    } else if (relatedTo.type === RelatedToType.OPPORTUNITY) {
      const opportunity = opportunities.find(o => o.id === relatedTo.id);
      return opportunity ? `商談: ${opportunity.name}` : '-';
    }
    return '-';
  };

  // ステータスに応じた色を取得
  const getStatusColor = (status?: string): string => {
    if (status === 'completed') {
      return 'bg-green-100 text-green-800';
    } else if (status === 'canceled') {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-blue-100 text-blue-800';
    }
  };

  // ステータスの表示名を取得
  const getStatusName = (status?: string): string => {
    const statusNames: Record<string, string> = {
      'planned': '予定',
      'completed': '完了',
      'canceled': 'キャンセル',
    };
    return statusNames[status || 'planned'] || '予定';
  };

  return (
    <div className="page">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">活動一覧</h2>
        <div className="flex gap-4">
          <div>
            <label htmlFor="typeFilter" className="sr-only">タイプでフィルタ</label>
            <select
              id="typeFilter"
              value={filterType}
              onChange={handleFilterTypeChange}
              className="form-select"
              style={{ minWidth: '150px' }}
              aria-label="タイプでフィルタ"
            >
              <option value="">すべてのタイプ</option>
              {Object.values(ActivityType).map(type => (
                <option key={type} value={type}>{getTypeName(type)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="statusFilter" className="sr-only">ステータスでフィルタ</label>
            <select
              id="statusFilter"
              value={filterStatus}
              onChange={handleFilterStatusChange}
              className="form-select"
              style={{ minWidth: '150px' }}
              aria-label="ステータスでフィルタ"
            >
              <option value="">すべてのステータス</option>
              <option value="planned">予定</option>
              <option value="completed">完了</option>
              <option value="canceled">キャンセル</option>
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
          <h3 className="card-header">{isCreating ? '活動を新規作成' : '活動を編集'}</h3>
          <form onSubmit={isCreating ? handleCreateActivity : handleUpdateActivity}>
            <div className="form-group">
              <label htmlFor="relatedToType" className="form-label">関連先タイプ *</label>
              <select
                id="relatedToType"
                name="relatedToType"
                value={formData.relatedTo.type}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value={RelatedToType.ACCOUNT}>取引先</option>
                <option value={RelatedToType.OPPORTUNITY}>商談</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="relatedToId" className="form-label">関連先 *</label>
              <select
                id="relatedToId"
                name="relatedToId"
                value={formData.relatedTo.id}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">選択してください</option>
                {formData.relatedTo.type === RelatedToType.ACCOUNT ? (
                  accounts.map(account => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))
                ) : (
                  opportunities.map(opportunity => (
                    <option key={opportunity.id} value={opportunity.id}>{opportunity.name}</option>
                  ))
                )}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="type" className="form-label">活動タイプ *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                {Object.values(ActivityType).map(type => (
                  <option key={type} value={type}>{getTypeName(type)}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="subject" className="form-label">件名 *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date" className="form-label">日付 *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dueDate" className="form-label">期限日</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="status" className="form-label">ステータス</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="planned">予定</option>
                <option value="completed">完了</option>
                <option value="canceled">キャンセル</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="assignedTo" className="form-label">担当者</label>
              <input
                type="text"
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
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
      ) : activities.length === 0 ? (
        <div className="text-center p-4">活動がありません。新規作成してください。</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>件名</th>
                <th>関連先</th>
                <th>タイプ</th>
                <th>日付</th>
                <th>期限日</th>
                <th>ステータス</th>
                <th>担当者</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {activities.map(activity => (
                <tr key={activity.id}>
                  <td>{activity.subject}</td>
                  <td>{getRelatedToName(activity.relatedTo)}</td>
                  <td>{getTypeName(activity.type)}</td>
                  <td>{new Date(activity.date).toLocaleDateString()}</td>
                  <td>{activity.dueDate ? new Date(activity.dueDate).toLocaleDateString() : '-'}</td>
                  <td>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(activity.status)}`}
                    >
                      {getStatusName(activity.status)}
                    </span>
                  </td>
                  <td>{activity.assignedTo || '-'}</td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      <button
                        onClick={() => handleShowEditForm(activity)}
                        className="form-button"
                        style={{ backgroundColor: '#4299e1', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        disabled={isCreating || isEditing}
                      >
                        編集
                      </button>
                      
                      {activity.status !== 'completed' && activity.status !== 'canceled' && (
                        <>
                          <button
                            onClick={() => handleCompleteActivity(activity.id)}
                            className="form-button"
                            style={{ backgroundColor: '#38a169', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            disabled={isCreating || isEditing}
                            title="完了"
                          >
                            完了
                          </button>
                          <button
                            onClick={() => handleCancelActivity(activity.id)}
                            className="form-button"
                            style={{ backgroundColor: '#e53e3e', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            disabled={isCreating || isEditing}
                            title="キャンセル"
                          >
                            キャンセル
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => handleDeleteActivity(activity.id)}
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
