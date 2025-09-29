import { PollData } from '../entities/PollData';
import { Result } from '../common/Result';
import { RepositoryError } from './IUserRepository';

export interface IPollRepository {
  getPollData(signal?: AbortSignal): Promise<Result<PollData, RepositoryError>>;
  togglePollStatus(signal?: AbortSignal): Promise<Result<PollData, RepositoryError>>;
}