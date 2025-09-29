import { Post } from '../entities/Post';
import { Result } from '../common/Result';
import { RepositoryError } from './IUserRepository';

export interface IPostRepository {
  getAllPosts(signal?: AbortSignal): Promise<Result<Post[], RepositoryError>>;
  getPostById(id: number, signal?: AbortSignal): Promise<Result<Post, RepositoryError>>;
  getPostsByAuthor(authorId: number, signal?: AbortSignal): Promise<Result<Post[], RepositoryError>>;
}