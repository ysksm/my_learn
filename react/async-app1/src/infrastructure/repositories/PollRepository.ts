import type { IPollRepository } from '../../domain/repositories/IPollRepository';
import { PollData } from '../../domain/entities/PollData';
import { Result } from '../../domain/common/Result';
import { RepositoryError } from '../../domain/repositories/IUserRepository';
import { ApiClient } from '../api/ApiClient';

export class PollRepository implements IPollRepository {
  private readonly apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getPollData(signal?: AbortSignal): Promise<Result<PollData, RepositoryError>> {
    const result = await this.apiClient.get<any>('/api/poll/data', { signal });

    if (result.isError()) {
      return Result.error(result.getError());
    }

    try {
      const pollData = PollData.fromApiResponse(result.getValue());
      return Result.success(pollData);
    } catch (error) {
      return Result.error(RepositoryError.validationError('Invalid poll data format'));
    }
  }

  async togglePollStatus(signal?: AbortSignal): Promise<Result<PollData, RepositoryError>> {
    const result = await this.apiClient.post<any>('/api/poll/toggle', {}, { signal });

    if (result.isError()) {
      return Result.error(result.getError());
    }

    try {
      const pollData = PollData.fromApiResponse(result.getValue());
      return Result.success(pollData);
    } catch (error) {
      return Result.error(RepositoryError.validationError('Invalid poll data format'));
    }
  }
}