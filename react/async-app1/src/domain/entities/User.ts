export class User {
  public readonly id: number;
  public readonly name: string;
  public readonly email: string;
  public readonly createdAt: Date;

  constructor(
    id: number,
    name: string,
    email: string,
    createdAt: Date
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.createdAt = createdAt;
  }

  static fromApiResponse(data: any): User {
    return new User(
      data.id,
      data.name,
      data.email,
      new Date(data.createdAt)
    );
  }

  isValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  getDisplayName(): string {
    return this.name;
  }
}