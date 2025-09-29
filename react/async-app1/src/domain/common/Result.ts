export abstract class Result<T, E = Error> {
  abstract isSuccess(): boolean;
  abstract isError(): boolean;
  abstract getValue(): T;
  abstract getError(): E;

  static success<T, E = Error>(value: T): Result<T, E> {
    return new Success(value);
  }

  static error<T, E = Error>(error: E): Result<T, E> {
    return new Failure(error);
  }
}

class Success<T, E = Error> extends Result<T, E> {
  private readonly value: T;

  constructor(value: T) {
    super();
    this.value = value;
  }

  isSuccess(): boolean {
    return true;
  }

  isError(): boolean {
    return false;
  }

  getValue(): T {
    return this.value;
  }

  getError(): E {
    throw new Error('Cannot get error from Success result');
  }
}

class Failure<T, E = Error> extends Result<T, E> {
  private readonly error: E;

  constructor(error: E) {
    super();
    this.error = error;
  }

  isSuccess(): boolean {
    return false;
  }

  isError(): boolean {
    return true;
  }

  getValue(): T {
    throw new Error('Cannot get value from Failure result');
  }

  getError(): E {
    return this.error;
  }
}