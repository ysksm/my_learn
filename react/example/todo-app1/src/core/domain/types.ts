// Type-safe alternatives to enums using literal types
export type TicketType = 'USER_STORY' | 'TODO' | 'BUG' | 'EPIC' | 'FEATURE';
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Severity = 'BLOCKER' | 'MAJOR' | 'NORMAL' | 'MINOR' | 'TRIVIAL';
export type Status = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type SprintStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED';

// Constant objects to restrict values
export const TicketTypes = {
  USER_STORY: 'USER_STORY' as const,
  TODO: 'TODO' as const,
  BUG: 'BUG' as const,
  EPIC: 'EPIC' as const,
  FEATURE: 'FEATURE' as const
};

export const Priorities = {
  CRITICAL: 'CRITICAL' as const,
  HIGH: 'HIGH' as const,
  MEDIUM: 'MEDIUM' as const,
  LOW: 'LOW' as const
};

export const Severities = {
  BLOCKER: 'BLOCKER' as const,
  MAJOR: 'MAJOR' as const,
  NORMAL: 'NORMAL' as const,
  MINOR: 'MINOR' as const,
  TRIVIAL: 'TRIVIAL' as const
};

export const Statuses = {
  BACKLOG: 'BACKLOG' as const,
  TODO: 'TODO' as const,
  IN_PROGRESS: 'IN_PROGRESS' as const,
  IN_REVIEW: 'IN_REVIEW' as const,
  DONE: 'DONE' as const
};

export const SprintStatuses = {
  PLANNING: 'PLANNING' as const,
  ACTIVE: 'ACTIVE' as const,
  COMPLETED: 'COMPLETED' as const
};
