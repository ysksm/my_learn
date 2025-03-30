import { Entity } from './entity';

export interface TagProps {
  name: string;
  color: string;
}

export class Tag extends Entity<TagProps> {
  get name(): string {
    return this.props.name;
  }

  get color(): string {
    return this.props.color;
  }

  // Factory method for creating a new tag
  static create(props: TagProps, id?: string): Tag {
    return new Tag(props, id);
  }
}
