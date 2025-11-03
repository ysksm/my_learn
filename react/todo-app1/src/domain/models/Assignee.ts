export class Assignee {
  readonly id: string;
  readonly name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  equals(other: Assignee): boolean {
    return this.id === other.id;
  }
}
