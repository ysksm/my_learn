import { StorageAdapter } from './infrastructure/storage/storage-adapter';
import { LocalStorageAdapter } from './infrastructure/storage/local-storage-adapter';
import { TagRepository } from './domain/repositories/tag-repository';
import { TicketRepository } from './domain/repositories/ticket-repository';
import { SprintRepository } from './domain/repositories/sprint-repository';
import { StorageTagRepository } from './infrastructure/repositories/storage-tag-repository';
import { StorageTicketRepository } from './infrastructure/repositories/storage-ticket-repository';
import { StorageSprintRepository } from './infrastructure/repositories/storage-sprint-repository';
import { DemoDataInitializer } from './infrastructure/demo/demo-data-initializer';

// Use cases
import { GetTagsUseCase } from './application/use-cases/get-tags';
import { CreateTagUseCase } from './application/use-cases/create-tag';
import { UpdateTagUseCase } from './application/use-cases/update-tag';
import { DeleteTagUseCase } from './application/use-cases/delete-tag';

import { GetTicketsUseCase } from './application/use-cases/get-tickets';
import { GetTicketByIdUseCase } from './application/use-cases/get-ticket-by-id';
import { CreateTicketUseCase } from './application/use-cases/create-ticket';
import { UpdateTicketUseCase } from './application/use-cases/update-ticket';
import { DeleteTicketUseCase } from './application/use-cases/delete-ticket';

import { GetSprintsUseCase } from './application/use-cases/get-sprints';
import { GetSprintByIdUseCase } from './application/use-cases/get-sprint-by-id';
import { CreateSprintUseCase } from './application/use-cases/create-sprint';
import { UpdateSprintUseCase } from './application/use-cases/update-sprint';
import { DeleteSprintUseCase } from './application/use-cases/delete-sprint';
import { AddTicketToSprintUseCase } from './application/use-cases/add-ticket-to-sprint';
import { RemoveTicketFromSprintUseCase } from './application/use-cases/remove-ticket-from-sprint';

// Storage adapter
const storageAdapter: StorageAdapter = new LocalStorageAdapter();

// Repositories
const tagRepository: TagRepository = new StorageTagRepository(storageAdapter);
const ticketRepository: TicketRepository = new StorageTicketRepository(storageAdapter);
const sprintRepository: SprintRepository = new StorageSprintRepository(storageAdapter);

// Demo data initializer
const demoDataInitializer = new DemoDataInitializer(
  storageAdapter,
  tagRepository,
  ticketRepository,
  sprintRepository
);

// Tag use cases
const getTagsUseCase = new GetTagsUseCase(tagRepository);
const createTagUseCase = new CreateTagUseCase(tagRepository);
const updateTagUseCase = new UpdateTagUseCase(tagRepository);
const deleteTagUseCase = new DeleteTagUseCase(tagRepository, ticketRepository);

// Ticket use cases
const getTicketsUseCase = new GetTicketsUseCase(ticketRepository);
const getTicketByIdUseCase = new GetTicketByIdUseCase(ticketRepository, sprintRepository);
const createTicketUseCase = new CreateTicketUseCase(ticketRepository, tagRepository);
const updateTicketUseCase = new UpdateTicketUseCase(ticketRepository, tagRepository);
const deleteTicketUseCase = new DeleteTicketUseCase(ticketRepository);

// Sprint use cases
const getSprintsUseCase = new GetSprintsUseCase(sprintRepository);
const getSprintByIdUseCase = new GetSprintByIdUseCase(sprintRepository, ticketRepository);
const createSprintUseCase = new CreateSprintUseCase(sprintRepository);
const updateSprintUseCase = new UpdateSprintUseCase(sprintRepository);
const deleteSprintUseCase = new DeleteSprintUseCase(sprintRepository, ticketRepository);
const addTicketToSprintUseCase = new AddTicketToSprintUseCase(sprintRepository, ticketRepository);
const removeTicketFromSprintUseCase = new RemoveTicketFromSprintUseCase(sprintRepository, ticketRepository);

// Initialize demo data
const initializeDemoData = async (): Promise<void> => {
  await demoDataInitializer.initialize();
};

export {
  // Storage and repositories
  storageAdapter,
  tagRepository,
  ticketRepository,
  sprintRepository,
  
  // Demo data initializer
  initializeDemoData,
  
  // Tag use cases
  getTagsUseCase,
  createTagUseCase,
  updateTagUseCase,
  deleteTagUseCase,
  
  // Ticket use cases
  getTicketsUseCase,
  getTicketByIdUseCase,
  createTicketUseCase,
  updateTicketUseCase,
  deleteTicketUseCase,
  
  // Sprint use cases
  getSprintsUseCase,
  getSprintByIdUseCase,
  createSprintUseCase,
  updateSprintUseCase,
  deleteSprintUseCase,
  addTicketToSprintUseCase,
  removeTicketFromSprintUseCase
};
