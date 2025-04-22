import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  Activity, 
  CreateActivityDTO, 
  UpdateActivityDTO, 
  createActivity, 
  updateActivity,
  completeActivity,
  cancelActivity
} from '../../../domain/model';
import { LocalStorageActivityRepository } from '../../../infrastructure/persistence';
import { ActivityType, ID, RelatedToType } from '../../../types';

// リポジトリのインスタンスを作成
const activityRepository = new LocalStorageActivityRepository();

// 状態の型定義
interface ActivityState {
  activities: Activity[];
  selectedActivity: Activity | null;
  loading: boolean;
  error: string | null;
}

// 初期状態
const initialState: ActivityState = {
  activities: [],
  selectedActivity: null,
  loading: false,
  error: null,
};

// 非同期アクション

// すべての活動を取得
export const fetchActivities = createAsyncThunk(
  'activities/fetchAll',
  async () => {
    return await activityRepository.findAll();
  }
);

// 関連先タイプとIDで活動を取得
export const fetchActivitiesByRelatedTo = createAsyncThunk(
  'activities/fetchByRelatedTo',
  async ({ type, id }: { type: RelatedToType, id: ID }) => {
    return await activityRepository.findByRelatedTo(type, id);
  }
);

// 活動タイプで活動を取得
export const fetchActivitiesByType = createAsyncThunk(
  'activities/fetchByType',
  async (type: ActivityType) => {
    return await activityRepository.findByType(type);
  }
);

// 日付範囲で活動を取得
export const fetchActivitiesByDateRange = createAsyncThunk(
  'activities/fetchByDateRange',
  async ({ startDate, endDate }: { startDate: string, endDate: string }) => {
    return await activityRepository.findByDateRange(startDate, endDate);
  }
);

// ステータスで活動を取得
export const fetchActivitiesByStatus = createAsyncThunk(
  'activities/fetchByStatus',
  async (status: 'planned' | 'completed' | 'canceled') => {
    return await activityRepository.findByStatus(status);
  }
);

// 予定されている活動を取得
export const fetchPlannedActivities = createAsyncThunk(
  'activities/fetchPlanned',
  async () => {
    return await activityRepository.findPlanned();
  }
);

// 完了した活動を取得
export const fetchCompletedActivities = createAsyncThunk(
  'activities/fetchCompleted',
  async () => {
    return await activityRepository.findCompleted();
  }
);

// キャンセルされた活動を取得
export const fetchCanceledActivities = createAsyncThunk(
  'activities/fetchCanceled',
  async () => {
    return await activityRepository.findCanceled();
  }
);

// IDで活動を取得
export const fetchActivityById = createAsyncThunk(
  'activities/fetchById',
  async (id: ID) => {
    const activity = await activityRepository.findById(id);
    if (!activity) {
      throw new Error(`Activity with ID ${id} not found`);
    }
    return activity;
  }
);

// 活動を作成
export const createActivityAsync = createAsyncThunk(
  'activities/create',
  async (dto: CreateActivityDTO) => {
    const newActivity = createActivity(dto);
    return await activityRepository.save(newActivity);
  }
);

// 活動を更新
export const updateActivityAsync = createAsyncThunk(
  'activities/update',
  async (dto: UpdateActivityDTO) => {
    const activity = await activityRepository.findById(dto.id);
    if (!activity) {
      throw new Error(`Activity with ID ${dto.id} not found`);
    }
    const updatedActivity = updateActivity(activity, dto);
    return await activityRepository.save(updatedActivity);
  }
);

// 活動を完了としてマークする
export const completeActivityAsync = createAsyncThunk(
  'activities/complete',
  async (id: ID) => {
    const activity = await activityRepository.findById(id);
    if (!activity) {
      throw new Error(`Activity with ID ${id} not found`);
    }
    const updatedActivity = completeActivity(activity);
    return await activityRepository.save(updatedActivity);
  }
);

// 活動をキャンセルとしてマークする
export const cancelActivityAsync = createAsyncThunk(
  'activities/cancel',
  async (id: ID) => {
    const activity = await activityRepository.findById(id);
    if (!activity) {
      throw new Error(`Activity with ID ${id} not found`);
    }
    const updatedActivity = cancelActivity(activity);
    return await activityRepository.save(updatedActivity);
  }
);

// 活動を削除
export const deleteActivityAsync = createAsyncThunk(
  'activities/delete',
  async (id: ID) => {
    const success = await activityRepository.deleteById(id);
    if (!success) {
      throw new Error(`Failed to delete activity with ID ${id}`);
    }
    return id;
  }
);

// スライスの作成
const activitySlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    // 選択中の活動をクリア
    clearSelectedActivity: (state) => {
      state.selectedActivity = null;
    },
    // 活動を選択
    selectActivity: (state, action: PayloadAction<Activity>) => {
      state.selectedActivity = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchActivities
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch activities';
      })
      
      // fetchActivitiesByRelatedTo
      .addCase(fetchActivitiesByRelatedTo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivitiesByRelatedTo.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(fetchActivitiesByRelatedTo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch activities by related to';
      })
      
      // fetchActivitiesByType
      .addCase(fetchActivitiesByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivitiesByType.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(fetchActivitiesByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch activities by type';
      })
      
      // fetchActivitiesByDateRange
      .addCase(fetchActivitiesByDateRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivitiesByDateRange.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(fetchActivitiesByDateRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch activities by date range';
      })
      
      // fetchActivitiesByStatus
      .addCase(fetchActivitiesByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivitiesByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(fetchActivitiesByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch activities by status';
      })
      
      // fetchPlannedActivities
      .addCase(fetchPlannedActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlannedActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(fetchPlannedActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch planned activities';
      })
      
      // fetchCompletedActivities
      .addCase(fetchCompletedActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompletedActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(fetchCompletedActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch completed activities';
      })
      
      // fetchCanceledActivities
      .addCase(fetchCanceledActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCanceledActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(fetchCanceledActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch canceled activities';
      })
      
      // fetchActivityById
      .addCase(fetchActivityById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedActivity = action.payload;
      })
      .addCase(fetchActivityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch activity';
      })
      
      // createActivityAsync
      .addCase(createActivityAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createActivityAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.activities.push(action.payload);
        state.selectedActivity = action.payload;
      })
      .addCase(createActivityAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create activity';
      })
      
      // updateActivityAsync
      .addCase(updateActivityAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateActivityAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.activities.findIndex(activity => activity.id === action.payload.id);
        if (index !== -1) {
          state.activities[index] = action.payload;
        }
        state.selectedActivity = action.payload;
      })
      .addCase(updateActivityAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update activity';
      })
      
      // completeActivityAsync
      .addCase(completeActivityAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeActivityAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.activities.findIndex(activity => activity.id === action.payload.id);
        if (index !== -1) {
          state.activities[index] = action.payload;
        }
        state.selectedActivity = action.payload;
      })
      .addCase(completeActivityAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to complete activity';
      })
      
      // cancelActivityAsync
      .addCase(cancelActivityAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelActivityAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.activities.findIndex(activity => activity.id === action.payload.id);
        if (index !== -1) {
          state.activities[index] = action.payload;
        }
        state.selectedActivity = action.payload;
      })
      .addCase(cancelActivityAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to cancel activity';
      })
      
      // deleteActivityAsync
      .addCase(deleteActivityAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteActivityAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = state.activities.filter(activity => activity.id !== action.payload);
        if (state.selectedActivity && state.selectedActivity.id === action.payload) {
          state.selectedActivity = null;
        }
      })
      .addCase(deleteActivityAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete activity';
      });
  },
});

// アクションをエクスポート
export const { clearSelectedActivity, selectActivity } = activitySlice.actions;

// リデューサーをエクスポート
export default activitySlice.reducer;
