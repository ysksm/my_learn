import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, CreateProductDTO, UpdateProductDTO, createProduct, updateProduct } from '../../../domain/model';
import { LocalStorageProductRepository } from '../../../infrastructure/persistence';
import { ID } from '../../../types';

// リポジトリのインスタンスを作成
const productRepository = new LocalStorageProductRepository();

// 状態の型定義
interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
}

// 初期状態
const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
};

// 非同期アクション

// すべての納入商品を取得
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async () => {
    return await productRepository.findAll();
  }
);

// アクティブな納入商品のみを取得
export const fetchActiveProducts = createAsyncThunk(
  'products/fetchActive',
  async () => {
    return await productRepository.findActive();
  }
);

// IDで納入商品を取得
export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id: ID) => {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }
    return product;
  }
);

// 納入商品を作成
export const createProductAsync = createAsyncThunk(
  'products/create',
  async (dto: CreateProductDTO) => {
    const newProduct = createProduct(dto);
    return await productRepository.save(newProduct);
  }
);

// 納入商品を更新
export const updateProductAsync = createAsyncThunk(
  'products/update',
  async (dto: UpdateProductDTO) => {
    const product = await productRepository.findById(dto.id);
    if (!product) {
      throw new Error(`Product with ID ${dto.id} not found`);
    }
    const updatedProduct = updateProduct(product, dto);
    return await productRepository.save(updatedProduct);
  }
);

// 納入商品を削除
export const deleteProductAsync = createAsyncThunk(
  'products/delete',
  async (id: ID) => {
    const success = await productRepository.deleteById(id);
    if (!success) {
      throw new Error(`Failed to delete product with ID ${id}`);
    }
    return id;
  }
);

// スライスの作成
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // 選択中の納入商品をクリア
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    // 納入商品を選択
    selectProduct: (state, action: PayloadAction<Product>) => {
      state.selectedProduct = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      
      // fetchActiveProducts
      .addCase(fetchActiveProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchActiveProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch active products';
      })
      
      // fetchProductById
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch product';
      })
      
      // createProductAsync
      .addCase(createProductAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProductAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
        state.selectedProduct = action.payload;
      })
      .addCase(createProductAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create product';
      })
      
      // updateProductAsync
      .addCase(updateProductAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(product => product.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        state.selectedProduct = action.payload;
      })
      .addCase(updateProductAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update product';
      })
      
      // deleteProductAsync
      .addCase(deleteProductAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProductAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(product => product.id !== action.payload);
        if (state.selectedProduct && state.selectedProduct.id === action.payload) {
          state.selectedProduct = null;
        }
      })
      .addCase(deleteProductAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete product';
      });
  },
});

// アクションをエクスポート
export const { clearSelectedProduct, selectProduct } = productSlice.actions;

// リデューサーをエクスポート
export default productSlice.reducer;
