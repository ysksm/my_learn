/**
 * Base Entity class
 * All domain entities should extend this class
 */
export abstract class Entity<T> {
  protected readonly _id: string;
  protected props: T;

  constructor(props: T, id?: string) {
    this._id = id || crypto.randomUUID();
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  public equals(entity?: Entity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (this === entity) {
      return true;
    }

    return this._id === entity._id;
  }
}
