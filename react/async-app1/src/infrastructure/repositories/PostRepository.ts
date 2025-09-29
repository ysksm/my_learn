import type { IPostRepository } from '../../domain/repositories/IPostRepository';
import { Post } from '../../domain/entities/Post';
import { Result } from '../../domain/common/Result';
import { RepositoryError } from '../../domain/repositories/IUserRepository';
import { ApiClient } from '../api/ApiClient';

export class PostRepository implements IPostRepository {
  private readonly apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getAllPosts(signal?: AbortSignal): Promise<Result<Post[], RepositoryError>> {
    const result = await this.apiClient.get<any[]>('/api/posts', { signal });

    if (result.isError()) {
      return Result.error(result.getError());
    }

    try {
      const posts = result.getValue().map(postData => Post.fromApiResponse(postData));
      return Result.success(posts);
    } catch (error) {
      return Result.error(RepositoryError.validationError('Invalid post data format'));
    }
  }

  async getPostById(id: number, signal?: AbortSignal): Promise<Result<Post, RepositoryError>> {
    const result = await this.apiClient.get<any>(`/api/posts/${id}`, { signal });

    if (result.isError()) {
      return Result.error(result.getError());
    }

    try {
      const post = Post.fromApiResponse(result.getValue());
      return Result.success(post);
    } catch (error) {
      return Result.error(RepositoryError.validationError('Invalid post data format'));
    }
  }

  async getPostsByAuthor(authorId: number, signal?: AbortSignal): Promise<Result<Post[], RepositoryError>> {
    const result = await this.apiClient.get<any[]>(`/api/posts/author/${authorId}`, { signal });

    if (result.isError()) {
      return Result.error(result.getError());
    }

    try {
      const posts = result.getValue().map(postData => Post.fromApiResponse(postData));
      return Result.success(posts);
    } catch (error) {
      return Result.error(RepositoryError.validationError('Invalid post data format'));
    }
  }
}