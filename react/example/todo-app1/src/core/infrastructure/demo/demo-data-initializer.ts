import { StorageAdapter } from '../storage/storage-adapter';
import { TicketType, Priority, Severity, Status, SprintStatus } from '../../domain/types';
import { Tag } from '../../domain/models/tag';
import { Ticket } from '../../domain/models/ticket';
import { Sprint } from '../../domain/models/sprint';
import { TagRepository } from '../../domain/repositories/tag-repository';
import { TicketRepository } from '../../domain/repositories/ticket-repository';
import { SprintRepository } from '../../domain/repositories/sprint-repository';

export class DemoDataInitializer {
  private readonly DEMO_DATA_INITIALIZED_KEY = 'demoDataInitialized';
  
  constructor(
    private storageAdapter: StorageAdapter,
    private tagRepository: TagRepository,
    private ticketRepository: TicketRepository,
    private sprintRepository: SprintRepository
  ) {}
  
  async initialize(): Promise<void> {
    // Check if demo data has already been initialized
    const initialized = await this.storageAdapter.getItem<boolean>(this.DEMO_DATA_INITIALIZED_KEY);
    if (initialized) return;
    
    // Create tags
    const tags = await this.createDemoTags();
    
    // Create sprints
    const sprints = await this.createDemoSprints();
    
    // Create tickets
    await this.createDemoTickets(tags, sprints);
    
    // Mark as initialized
    await this.storageAdapter.setItem(this.DEMO_DATA_INITIALIZED_KEY, true);
    
    console.log('Demo data initialized successfully');
  }
  
  private async createDemoTags(): Promise<Tag[]> {
    const tagData = [
      { name: 'フロントエンド', color: '#36b37e' },
      { name: 'バックエンド', color: '#0052cc' },
      { name: 'バグ', color: '#ff5630' },
      { name: '改善', color: '#00b8d9' },
      { name: '新機能', color: '#6554c0' }
    ];
    
    const tags: Tag[] = [];
    
    for (const data of tagData) {
      const tag = Tag.create(data);
      await this.tagRepository.save(tag);
      tags.push(tag);
    }
    
    return tags;
  }
  
  private async createDemoSprints(): Promise<Sprint[]> {
    const now = new Date();
    const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;
    
    const sprintData = [
      {
        name: 'スプリント1',
        goal: '基本機能の実装',
        startDate: new Date(now.getTime() - twoWeeksInMs),
        endDate: now,
        status: 'COMPLETED' as SprintStatus,
        tickets: []
      },
      {
        name: 'スプリント2',
        goal: 'UIの改善とバグ修正',
        startDate: now,
        endDate: new Date(now.getTime() + twoWeeksInMs),
        status: 'ACTIVE' as SprintStatus,
        tickets: []
      },
      {
        name: 'スプリント3',
        goal: '新機能の追加',
        startDate: new Date(now.getTime() + twoWeeksInMs),
        endDate: new Date(now.getTime() + 2 * twoWeeksInMs),
        status: 'PLANNING' as SprintStatus,
        tickets: []
      }
    ];
    
    const sprints: Sprint[] = [];
    
    for (const data of sprintData) {
      const sprint = Sprint.create(data);
      await this.sprintRepository.save(sprint);
      sprints.push(sprint);
    }
    
    return sprints;
  }
  
  private async createDemoTickets(tags: Tag[], sprints: Sprint[]): Promise<void> {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    
    const ticketData = [
      {
        title: 'ログイン機能の実装',
        description: 'ユーザーがアプリケーションにログインできるようにする',
        type: 'USER_STORY' as TicketType,
        status: 'DONE' as Status,
        priority: 'HIGH' as Priority,
        severity: 'MAJOR' as Severity,
        tags: [tags[0], tags[1]],
        reporterId: 'user1',
        createdAt: new Date(now.getTime() - 10 * oneDay),
        updatedAt: new Date(now.getTime() - 2 * oneDay),
        sprintId: sprints[0].id
      },
      {
        title: 'ダッシュボード画面のデザイン',
        description: 'ユーザーフレンドリーなダッシュボード画面を作成する',
        type: 'TODO' as TicketType,
        status: 'IN_PROGRESS' as Status,
        priority: 'MEDIUM' as Priority,
        severity: 'NORMAL' as Severity,
        tags: [tags[0], tags[4]],
        reporterId: 'user2',
        assigneeId: 'user1',
        createdAt: new Date(now.getTime() - 5 * oneDay),
        updatedAt: new Date(now.getTime() - 1 * oneDay),
        dueDate: new Date(now.getTime() + 5 * oneDay),
        sprintId: sprints[1].id
      },
      {
        title: 'APIレスポンスが遅い',
        description: 'ユーザー一覧取得APIのレスポンスが遅く、UXに影響している',
        type: 'BUG' as TicketType,
        status: 'TODO' as Status,
        priority: 'HIGH' as Priority,
        severity: 'MAJOR' as Severity,
        tags: [tags[1], tags[2]],
        reporterId: 'user3',
        createdAt: new Date(now.getTime() - 2 * oneDay),
        updatedAt: new Date(now.getTime() - 2 * oneDay),
        sprintId: sprints[1].id
      },
      {
        title: 'モバイル対応',
        description: 'アプリケーションをモバイルフレンドリーにする',
        type: 'EPIC' as TicketType,
        status: 'BACKLOG' as Status,
        priority: 'MEDIUM' as Priority,
        severity: 'NORMAL' as Severity,
        tags: [tags[0], tags[4]],
        reporterId: 'user1',
        createdAt: new Date(now.getTime() - 15 * oneDay),
        updatedAt: new Date(now.getTime() - 15 * oneDay),
        sprintId: sprints[2].id
      },
      {
        title: 'レポート機能の追加',
        description: 'プロジェクトの進捗状況を可視化するレポート機能',
        type: 'FEATURE' as TicketType,
        status: 'BACKLOG' as Status,
        priority: 'LOW' as Priority,
        severity: 'MINOR' as Severity,
        tags: [tags[4]],
        reporterId: 'user2',
        createdAt: new Date(now.getTime() - 7 * oneDay),
        updatedAt: new Date(now.getTime() - 7 * oneDay),
        sprintId: sprints[2].id
      }
    ];
    
    for (const data of ticketData) {
      const ticket = Ticket.create(data);
      await this.ticketRepository.save(ticket);
      
      // Add ticket to sprint
      if (data.sprintId) {
        const sprint = sprints.find(s => s.id === data.sprintId);
        if (sprint) {
          sprint.addTicket(ticket.id);
          await this.sprintRepository.save(sprint);
        }
      }
    }
    
    // Create child tickets for the Epic
    const epicTicket = await this.ticketRepository.findAll({
      types: ['EPIC']
    });
    
    if (epicTicket.length > 0) {
      const epic = epicTicket[0];
      
      const childTicketData = [
        {
          title: 'モバイルレイアウトの設計',
          description: 'レスポンシブデザインの実装',
          type: 'TODO' as TicketType,
          status: 'BACKLOG' as Status,
          priority: 'MEDIUM' as Priority,
          severity: 'NORMAL' as Severity,
          tags: [tags[0]],
          reporterId: 'user1',
          parentId: epic.id
        },
        {
          title: 'タッチイベントの対応',
          description: 'モバイルデバイスでのタッチイベントの実装',
          type: 'TODO' as TicketType,
          status: 'BACKLOG' as Status,
          priority: 'MEDIUM' as Priority,
          severity: 'NORMAL' as Severity,
          tags: [tags[0]],
          reporterId: 'user1',
          parentId: epic.id
        }
      ];
      
      for (const data of childTicketData) {
        const ticket = Ticket.create(data);
        await this.ticketRepository.save(ticket);
      }
    }
  }
}
