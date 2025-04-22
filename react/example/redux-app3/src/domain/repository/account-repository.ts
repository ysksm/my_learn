import { Account } from '../model';
import { Repository } from './repository';

/**
 * 取引先リポジトリのインターフェース
 */
export interface AccountRepository extends Repository<Account> {
  /**
   * 名前で取引先を検索する
   */
  findByName(name: string): Promise<Account[]>;

  /**
   * 業界で取引先を検索する
   */
  findByIndustry(industry: string): Promise<Account[]>;
}
