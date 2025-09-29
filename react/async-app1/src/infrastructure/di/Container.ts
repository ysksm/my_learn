import { ApiClient } from '../api/ApiClient';
import { UserRepository } from '../repositories/UserRepository';
import { PostRepository } from '../repositories/PostRepository';
import { PollRepository } from '../repositories/PollRepository';
import { GetUsersUseCase, GetUserByIdUseCase, CreateUserUseCase } from '../../application/usecases/GetUsersUseCase';

export class Container {
  private static instance: Container;
  private readonly apiClient: ApiClient;
  private readonly userRepository: UserRepository;
  private readonly postRepository: PostRepository;
  private readonly pollRepository: PollRepository;

  private constructor() {
    this.apiClient = new ApiClient();
    this.userRepository = new UserRepository(this.apiClient);
    this.postRepository = new PostRepository(this.apiClient);
    this.pollRepository = new PollRepository(this.apiClient);
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  getUsersUseCase(): GetUsersUseCase {
    return new GetUsersUseCase(this.userRepository);
  }

  getUserByIdUseCase(): GetUserByIdUseCase {
    return new GetUserByIdUseCase(this.userRepository);
  }

  createUserUseCase(): CreateUserUseCase {
    return new CreateUserUseCase(this.userRepository);
  }

  getUserRepository(): UserRepository {
    return this.userRepository;
  }

  getPostRepository(): PostRepository {
    return this.postRepository;
  }

  getPollRepository(): PollRepository {
    return this.pollRepository;
  }
}