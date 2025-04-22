import { Product } from '../model';
import { Repository } from './repository';

/**
 * 納入商品リポジトリのインターフェース
 */
export interface ProductRepository extends Repository<Product> {
  /**
   * 名前で納入商品を検索する
   */
  findByName(name: string): Promise<Product[]>;

  /**
   * カテゴリで納入商品を検索する
   */
  findByCategory(category: string): Promise<Product[]>;

  /**
   * 価格範囲で納入商品を検索する
   */
  findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]>;

  /**
   * アクティブな納入商品のみを取得する
   */
  findActive(): Promise<Product[]>;
}
