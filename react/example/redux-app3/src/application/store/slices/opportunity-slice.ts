import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  Opportunity, 
  CreateOpportunityDTO, 
  UpdateOpportunityDTO, 
  createOpportunity, 
  updateOpportunity,
  advanceOpportunityStage,
  regressOpportunityStage,
  closeWonOpportunity,
  closeLostOpportunity
} from '../../../domain/model';
import { LocalStorageOpportunityRepository } from '../../../infrastructure/persistence';
import { ID, OpportunityStage } from '../../../types';

// リポジトリのインスタンスを作成
const opportunityRepository = new LocalStorageOpportunityRepository();

// 状態の型定義
interface OpportunityState {
  opportunities: Opportunity[];
  selectedOpportunity: Opportunity | null;
  loading: boolean;
  error: string | null;
}

// 初期状態
const initialState: OpportunityState = {
  opportunities: [],
  selectedOpportunity: null,
  loading: false,
  error: null,
};

// 非同期アクション

// すべての商談を取得
export const fetchOpportunities = createAsyncThunk(
  'opportunities/fetchAll',
  async () => {
    return await opportunityRepository.findAll();
  }
);

// 取引先IDで商談を取得
export const fetchOpportunitiesByAccountId = createAsyncThunk(
  'opportunities/fetchByAccountId',
  async (accountId: ID) => {
    return await opportunityRepository.findByAccountId(accountId);
  }
);

// ステージで商談を取得
export const fetchOpportunitiesByStage = createAsyncThunk(
  'opportunities/fetchByStage',
  async (stage: OpportunityStage) => {
    return await opportunityRepository.findByStage(stage);
  }
);

// 進行中の商談を取得
export const fetchOpenOpportunities = createAsyncThunk(
  'opportunities/fetchOpen',
  async () => {
    return await opportunityRepository.findOpen();
  }
);

// 成立した商談を取得
export const fetchClosedWonOpportunities = createAsyncThunk(
  'opportunities/fetchClosedWon',
  async () => {
    return await opportunityRepository.findClosedWon();
  }
);

// 失注した商談を取得
export const fetchClosedLostOpportunities = createAsyncThunk(
  'opportunities/fetchClosedLost',
  async () => {
    return await opportunityRepository.findClosedLost();
  }
);

// IDで商談を取得
export const fetchOpportunityById = createAsyncThunk(
  'opportunities/fetchById',
  async (id: ID) => {
    const opportunity = await opportunityRepository.findById(id);
    if (!opportunity) {
      throw new Error(`Opportunity with ID ${id} not found`);
    }
    return opportunity;
  }
);

// 商談を作成
export const createOpportunityAsync = createAsyncThunk(
  'opportunities/create',
  async (dto: CreateOpportunityDTO) => {
    const newOpportunity = createOpportunity(dto);
    return await opportunityRepository.save(newOpportunity);
  }
);

// 商談を更新
export const updateOpportunityAsync = createAsyncThunk(
  'opportunities/update',
  async (dto: UpdateOpportunityDTO) => {
    const opportunity = await opportunityRepository.findById(dto.id);
    if (!opportunity) {
      throw new Error(`Opportunity with ID ${dto.id} not found`);
    }
    const updatedOpportunity = updateOpportunity(opportunity, dto);
    return await opportunityRepository.save(updatedOpportunity);
  }
);

// 商談ステージを進める
export const advanceOpportunityStageAsync = createAsyncThunk(
  'opportunities/advanceStage',
  async (id: ID) => {
    const opportunity = await opportunityRepository.findById(id);
    if (!opportunity) {
      throw new Error(`Opportunity with ID ${id} not found`);
    }
    const updatedOpportunity = advanceOpportunityStage(opportunity);
    return await opportunityRepository.save(updatedOpportunity);
  }
);

// 商談ステージを戻す
export const regressOpportunityStageAsync = createAsyncThunk(
  'opportunities/regressStage',
  async (id: ID) => {
    const opportunity = await opportunityRepository.findById(id);
    if (!opportunity) {
      throw new Error(`Opportunity with ID ${id} not found`);
    }
    const updatedOpportunity = regressOpportunityStage(opportunity);
    return await opportunityRepository.save(updatedOpportunity);
  }
);

// 商談を成立させる
export const closeWonOpportunityAsync = createAsyncThunk(
  'opportunities/closeWon',
  async (id: ID) => {
    const opportunity = await opportunityRepository.findById(id);
    if (!opportunity) {
      throw new Error(`Opportunity with ID ${id} not found`);
    }
    const updatedOpportunity = closeWonOpportunity(opportunity);
    return await opportunityRepository.save(updatedOpportunity);
  }
);

// 商談を失注させる
export const closeLostOpportunityAsync = createAsyncThunk(
  'opportunities/closeLost',
  async (id: ID) => {
    const opportunity = await opportunityRepository.findById(id);
    if (!opportunity) {
      throw new Error(`Opportunity with ID ${id} not found`);
    }
    const updatedOpportunity = closeLostOpportunity(opportunity);
    return await opportunityRepository.save(updatedOpportunity);
  }
);

// 商談を削除
export const deleteOpportunityAsync = createAsyncThunk(
  'opportunities/delete',
  async (id: ID) => {
    const success = await opportunityRepository.deleteById(id);
    if (!success) {
      throw new Error(`Failed to delete opportunity with ID ${id}`);
    }
    return id;
  }
);

// スライスの作成
const opportunitySlice = createSlice({
  name: 'opportunities',
  initialState,
  reducers: {
    // 選択中の商談をクリア
    clearSelectedOpportunity: (state) => {
      state.selectedOpportunity = null;
    },
    // 商談を選択
    selectOpportunity: (state, action: PayloadAction<Opportunity>) => {
      state.selectedOpportunity = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchOpportunities
      .addCase(fetchOpportunities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOpportunities.fulfilled, (state, action) => {
        state.loading = false;
        state.opportunities = action.payload;
      })
      .addCase(fetchOpportunities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch opportunities';
      })
      
      // fetchOpportunitiesByAccountId
      .addCase(fetchOpportunitiesByAccountId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOpportunitiesByAccountId.fulfilled, (state, action) => {
        state.loading = false;
        state.opportunities = action.payload;
      })
      .addCase(fetchOpportunitiesByAccountId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch opportunities by account ID';
      })
      
      // fetchOpportunitiesByStage
      .addCase(fetchOpportunitiesByStage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOpportunitiesByStage.fulfilled, (state, action) => {
        state.loading = false;
        state.opportunities = action.payload;
      })
      .addCase(fetchOpportunitiesByStage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch opportunities by stage';
      })
      
      // fetchOpenOpportunities
      .addCase(fetchOpenOpportunities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOpenOpportunities.fulfilled, (state, action) => {
        state.loading = false;
        state.opportunities = action.payload;
      })
      .addCase(fetchOpenOpportunities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch open opportunities';
      })
      
      // fetchClosedWonOpportunities
      .addCase(fetchClosedWonOpportunities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClosedWonOpportunities.fulfilled, (state, action) => {
        state.loading = false;
        state.opportunities = action.payload;
      })
      .addCase(fetchClosedWonOpportunities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch closed won opportunities';
      })
      
      // fetchClosedLostOpportunities
      .addCase(fetchClosedLostOpportunities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClosedLostOpportunities.fulfilled, (state, action) => {
        state.loading = false;
        state.opportunities = action.payload;
      })
      .addCase(fetchClosedLostOpportunities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch closed lost opportunities';
      })
      
      // fetchOpportunityById
      .addCase(fetchOpportunityById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOpportunityById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOpportunity = action.payload;
      })
      .addCase(fetchOpportunityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch opportunity';
      })
      
      // createOpportunityAsync
      .addCase(createOpportunityAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOpportunityAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.opportunities.push(action.payload);
        state.selectedOpportunity = action.payload;
      })
      .addCase(createOpportunityAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create opportunity';
      })
      
      // updateOpportunityAsync
      .addCase(updateOpportunityAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOpportunityAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.opportunities.findIndex(opportunity => opportunity.id === action.payload.id);
        if (index !== -1) {
          state.opportunities[index] = action.payload;
        }
        state.selectedOpportunity = action.payload;
      })
      .addCase(updateOpportunityAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update opportunity';
      })
      
      // advanceOpportunityStageAsync
      .addCase(advanceOpportunityStageAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(advanceOpportunityStageAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.opportunities.findIndex(opportunity => opportunity.id === action.payload.id);
        if (index !== -1) {
          state.opportunities[index] = action.payload;
        }
        state.selectedOpportunity = action.payload;
      })
      .addCase(advanceOpportunityStageAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to advance opportunity stage';
      })
      
      // regressOpportunityStageAsync
      .addCase(regressOpportunityStageAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(regressOpportunityStageAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.opportunities.findIndex(opportunity => opportunity.id === action.payload.id);
        if (index !== -1) {
          state.opportunities[index] = action.payload;
        }
        state.selectedOpportunity = action.payload;
      })
      .addCase(regressOpportunityStageAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to regress opportunity stage';
      })
      
      // closeWonOpportunityAsync
      .addCase(closeWonOpportunityAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(closeWonOpportunityAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.opportunities.findIndex(opportunity => opportunity.id === action.payload.id);
        if (index !== -1) {
          state.opportunities[index] = action.payload;
        }
        state.selectedOpportunity = action.payload;
      })
      .addCase(closeWonOpportunityAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to close opportunity as won';
      })
      
      // closeLostOpportunityAsync
      .addCase(closeLostOpportunityAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(closeLostOpportunityAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.opportunities.findIndex(opportunity => opportunity.id === action.payload.id);
        if (index !== -1) {
          state.opportunities[index] = action.payload;
        }
        state.selectedOpportunity = action.payload;
      })
      .addCase(closeLostOpportunityAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to close opportunity as lost';
      })
      
      // deleteOpportunityAsync
      .addCase(deleteOpportunityAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOpportunityAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.opportunities = state.opportunities.filter(opportunity => opportunity.id !== action.payload);
        if (state.selectedOpportunity && state.selectedOpportunity.id === action.payload) {
          state.selectedOpportunity = null;
        }
      })
      .addCase(deleteOpportunityAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete opportunity';
      });
  },
});

// アクションをエクスポート
export const { clearSelectedOpportunity, selectOpportunity } = opportunitySlice.actions;

// リデューサーをエクスポート
export default opportunitySlice.reducer;
