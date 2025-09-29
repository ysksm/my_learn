export class Post {
  public readonly id: number;
  public readonly title: string;
  public readonly content: string;
  public readonly authorId: number;
  public readonly createdAt: Date;

  constructor(
    id: number,
    title: string,
    content: string,
    authorId: number,
    createdAt: Date
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.authorId = authorId;
    this.createdAt = createdAt;
  }

  static fromApiResponse(data: any): Post {
    return new Post(
      data.id,
      data.title,
      data.content,
      data.authorId,
      new Date(data.createdAt)
    );
  }

  getPreview(maxLength: number = 100): string {
    if (this.content.length <= maxLength) {
      return this.content;
    }
    return this.content.substring(0, maxLength) + '...';
  }

  isOwnedBy(userId: number): boolean {
    return this.authorId === userId;
  }
}