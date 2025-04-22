import { Product } from '../../domain/model';
import { ProductRepository } from '../../domain/repository';
import { LocalStorageRepository } from './local-storage-repository';

/**
 * LocalStorageを使用した納入商品リポジトリの実装
 */
export class LocalStorageProductRepository extends LocalStorageRepository<Product> implements ProductRepository {
  constructor() {
    super('products');
  }

  /**
   * 名前で納入商品を検索する
   */
  async findByName(name: string): Promise<Product[]> {
    const products = await this.findAll();
    const lowerName = name.toLowerCase();
    return products.filter(product => product.name.toLowerCase().includes(lowerName));
  }

  /**
   * カテゴリで納入商品を検索する
   */
  async findByCategory(category: string): Promise<Product[]> {
    const products = await this.findAll();
    return products.filter(product => product.category === category);
  }

  /**
   * 価格範囲で納入商品を検索する
   */
  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    const products = await this.findAll();
    return products.filter(product => product.price >= minPrice && product.price <= maxPrice);
  }

  /**
   * アクティブな納入商品のみを取得する
   */
  async findActive(): Promise<Product[]> {
    const products = await this.findAll();
    return products.filter(product => product.isActive);
  }
}
