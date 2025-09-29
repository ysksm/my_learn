export class PollData {
  public readonly id: string;
  public readonly value: number;
  public readonly status: 'active' | 'inactive';
  public readonly lastUpdated: Date;

  constructor(
    id: string,
    value: number,
    status: 'active' | 'inactive',
    lastUpdated: Date
  ) {
    this.id = id;
    this.value = value;
    this.status = status;
    this.lastUpdated = lastUpdated;
  }

  static fromApiResponse(data: any): PollData {
    return new PollData(
      data.id,
      data.value,
      data.status,
      new Date(data.lastUpdated)
    );
  }

  isActive(): boolean {
    return this.status === 'active';
  }

  getFormattedValue(): string {
    return this.value.toFixed(2);
  }

  getTimeSinceUpdate(): number {
    return Date.now() - this.lastUpdated.getTime();
  }
}