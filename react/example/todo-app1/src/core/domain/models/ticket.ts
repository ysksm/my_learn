import { Entity } from './entity';
import { TicketType, Priority, Severity, Status } from '../types';
import { Tag } from './tag';

export interface TicketProps {
  title: string;
  description: string;
  type: TicketType;
  status: Status;
  priority: Priority;
  severity: Severity;
  tags: Tag[];
  assigneeId?: string;
  reporterId: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  estimatedHours?: number;
  sprintId?: string;
  parentId?: string;
}

export class Ticket extends Entity<TicketProps> {
  get title(): string { return this.props.title; }
  get description(): string { return this.props.description; }
  get type(): TicketType { return this.props.type; }
  get status(): Status { return this.props.status; }
  get priority(): Priority { return this.props.priority; }
  get severity(): Severity { return this.props.severity; }
  get tags(): Tag[] { return [...this.props.tags]; }
  get assigneeId(): string | undefined { return this.props.assigneeId; }
  get reporterId(): string { return this.props.reporterId; }
  get createdAt(): Date { return new Date(this.props.createdAt); }
  get updatedAt(): Date { return new Date(this.props.updatedAt); }
  get dueDate(): Date | undefined { 
    return this.props.dueDate ? new Date(this.props.dueDate) : undefined; 
  }
  get estimatedHours(): number | undefined { return this.props.estimatedHours; }
  get sprintId(): string | undefined { return this.props.sprintId; }
  get parentId(): string | undefined { return this.props.parentId; }

  // Domain logic methods
  updateTitle(newTitle: string): void {
    this.props.title = newTitle;
    this.props.updatedAt = new Date();
  }

  updateDescription(newDescription: string): void {
    this.props.description = newDescription;
    this.props.updatedAt = new Date();
  }

  updateStatus(newStatus: Status): void {
    this.props.status = newStatus;
    this.props.updatedAt = new Date();
  }

  updatePriority(newPriority: Priority): void {
    this.props.priority = newPriority;
    this.props.updatedAt = new Date();
  }

  updateSeverity(newSeverity: Severity): void {
    this.props.severity = newSeverity;
    this.props.updatedAt = new Date();
  }

  updateTags(newTags: Tag[]): void {
    this.props.tags = [...newTags];
    this.props.updatedAt = new Date();
  }

  assignToUser(userId: string): void {
    this.props.assigneeId = userId;
    this.props.updatedAt = new Date();
  }

  unassign(): void {
    this.props.assigneeId = undefined;
    this.props.updatedAt = new Date();
  }

  updateDueDate(newDueDate?: Date): void {
    this.props.dueDate = newDueDate;
    this.props.updatedAt = new Date();
  }

  updateEstimatedHours(hours?: number): void {
    this.props.estimatedHours = hours;
    this.props.updatedAt = new Date();
  }

  assignToSprint(sprintId: string): void {
    this.props.sprintId = sprintId;
    this.props.updatedAt = new Date();
  }

  removeFromSprint(): void {
    this.props.sprintId = undefined;
    this.props.updatedAt = new Date();
  }

  setParent(parentId: string): void {
    this.props.parentId = parentId;
    this.props.updatedAt = new Date();
  }

  removeParent(): void {
    this.props.parentId = undefined;
    this.props.updatedAt = new Date();
  }

  // Factory method for creating a new ticket
  static create(props: Omit<TicketProps, 'createdAt' | 'updatedAt'>, id?: string): Ticket {
    const now = new Date();
    return new Ticket({
      ...props,
      createdAt: now,
      updatedAt: now
    }, id);
  }
}
