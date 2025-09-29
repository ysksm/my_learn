import type { IUserRepository } from '../../domain/repositories/IUserRepository';
import type { RepositoryError } from '../../domain/repositories/IUserRepository';
import { UserDto } from '../dto/UserDto';
import { Result } from '../../domain/common/Result';

export class GetUsersUseCase {
  private readonly userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(signal?: AbortSignal): Promise<Result<UserDto[], RepositoryError>> {
    const result = await this.userRepository.getAllUsers(signal);

    if (result.isError()) {
      return Result.error(result.getError());
    }

    const userDtos = UserDto.fromEntities(result.getValue());
    return Result.success(userDtos);
  }
}

export class GetUserByIdUseCase {
  private readonly userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(id: number, signal?: AbortSignal): Promise<Result<UserDto, RepositoryError>> {
    const result = await this.userRepository.getUserById(id, signal);

    if (result.isError()) {
      return Result.error(result.getError());
    }

    const userDto = UserDto.fromEntity(result.getValue());
    return Result.success(userDto);
  }
}

export class CreateUserUseCase {
  private readonly userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(
    name: string,
    email: string,
    signal?: AbortSignal
  ): Promise<Result<UserDto, RepositoryError>> {
    const result = await this.userRepository.createUser(name, email, signal);

    if (result.isError()) {
      return Result.error(result.getError());
    }

    const userDto = UserDto.fromEntity(result.getValue());
    return Result.success(userDto);
  }
}