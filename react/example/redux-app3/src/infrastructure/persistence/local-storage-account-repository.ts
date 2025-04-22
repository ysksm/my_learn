import { Account } from '../../domain/model';
import { AccountRepository } from '../../domain/repository';
import { LocalStorageRepository } from './local-storage-repository';

/**
 * LocalStorageを使用した取引先リポジトリの実装
 */
export class LocalStorageAccountRepository extends LocalStorageRepository<Account> implements AccountRepository {
  constructor() {
    super('accounts');
  }

  /**
   * 名前で取引先を検索する
   */
  async findByName(name: string): Promise<Account[]> {
    const accounts = await this.findAll();
    const lowerName = name.toLowerCase();
    return accounts.filter(account => account.name.toLowerCase().includes(lowerName));
  }

  /**
   * 業界で取引先を検索する
   */
  async findByIndustry(industry: string): Promise<Account[]> {
    const accounts = await this.findAll();
    const lowerIndustry = industry.toLowerCase();
    return accounts.filter(account => account.industry.toLowerCase().includes(lowerIndustry));
  }
}
