import { User } from '../../domain/entities/User';

export interface UserDto {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  displayName: string;
  isValidEmail: boolean;
}

export class UserDto {
  static fromEntity(user: User): UserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      displayName: user.getDisplayName(),
      isValidEmail: user.isValidEmail()
    };
  }

  static fromEntities(users: User[]): UserDto[] {
    return users.map(user => UserDto.fromEntity(user));
  }
}