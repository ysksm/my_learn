import { Entity } from './entity';
import { SprintStatus } from '../types';

export interface SprintProps {
  name: string;
  goal: string;
  startDate: Date;
  endDate: Date;
  status: SprintStatus;
  tickets: string[]; // Array of ticket IDs
}

export class Sprint extends Entity<SprintProps> {
  get name(): string { return this.props.name; }
  get goal(): string { return this.props.goal; }
  get startDate(): Date { return new Date(this.props.startDate); }
  get endDate(): Date { return new Date(this.props.endDate); }
  get status(): SprintStatus { return this.props.status; }
  get tickets(): string[] { return [...this.props.tickets]; }

  // Domain logic methods
  updateName(newName: string): void {
    this.props.name = newName;
  }

  updateGoal(newGoal: string): void {
    this.props.goal = newGoal;
  }

  updateDates(startDate: Date, endDate: Date): void {
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }
    this.props.startDate = startDate;
    this.props.endDate = endDate;
  }

  updateStatus(newStatus: SprintStatus): void {
    this.props.status = newStatus;
  }

  addTicket(ticketId: string): void {
    if (!this.props.tickets.includes(ticketId)) {
      this.props.tickets.push(ticketId);
    }
  }

  removeTicket(ticketId: string): void {
    this.props.tickets = this.props.tickets.filter(id => id !== ticketId);
  }

  // Factory method for creating a new sprint
  static create(props: SprintProps, id?: string): Sprint {
    if (props.startDate >= props.endDate) {
      throw new Error('Start date must be before end date');
    }
    return new Sprint(props, id);
  }
}
