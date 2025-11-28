import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and, desc } from "drizzle-orm";
import * as schema from "@shared/schema";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
export const db = drizzle(pool, { schema });

export interface IStorage {
  getUser(id: number): Promise<schema.User | undefined>;
  getUserByUsername(username: string): Promise<schema.User | undefined>;
  getUsers(): Promise<schema.User[]>;
  createUser(user: schema.InsertUser): Promise<schema.User>;
  updateUserPoints(id: number, amount: number): Promise<void>;

  getRoles(): Promise<schema.Role[]>;
  getRole(id: number): Promise<schema.Role | undefined>;

  getServers(): Promise<schema.Server[]>;
  getServer(id: number): Promise<schema.Server | undefined>;
  createServer(server: Omit<schema.Server, 'id'>): Promise<schema.Server>;
  updateServer(id: number, server: Partial<schema.Server>): Promise<void>;
  deleteServer(id: number): Promise<void>;

  getDifficulties(): Promise<schema.Difficulty[]>;
  getDifficulty(id: number): Promise<schema.Difficulty | undefined>;

  getStatuses(): Promise<schema.RequestStatus[]>;
  getStatus(id: number): Promise<schema.RequestStatus | undefined>;

  getCharacters(): Promise<schema.Character[]>;
  getCharacter(id: number): Promise<schema.Character | undefined>;
  getCharactersByUser(userId: number): Promise<schema.Character[]>;
  createCharacter(character: Omit<schema.Character, 'id'>): Promise<schema.Character>;
  updateCharacter(id: number, character: Partial<schema.Character>): Promise<void>;
  setMainCharacter(id: number): Promise<void>;
  deleteCharacter(id: number): Promise<void>;

  getRespawns(): Promise<schema.Respawn[]>;
  getRespawn(id: number): Promise<schema.Respawn | undefined>;
  createRespawn(respawn: Omit<schema.Respawn, 'id'>): Promise<schema.Respawn>;
  updateRespawn(id: number, respawn: Partial<schema.Respawn>): Promise<void>;
  deleteRespawn(id: number): Promise<void>;

  getSlots(): Promise<schema.Slot[]>;
  getSlot(id: number): Promise<schema.Slot | undefined>;
  createSlot(slot: Omit<schema.Slot, 'id'>): Promise<schema.Slot>;
  deleteSlot(id: number): Promise<void>;

  getPeriods(): Promise<schema.SchedulePeriod[]>;
  getPeriod(id: number): Promise<schema.SchedulePeriod | undefined>;
  createPeriod(period: Omit<schema.SchedulePeriod, 'id'>): Promise<schema.SchedulePeriod>;
  togglePeriod(id: number): Promise<void>;
  deletePeriod(id: number): Promise<void>;

  getRequests(): Promise<schema.Request[]>;
  getRequest(id: number): Promise<schema.Request | undefined>;
  createRequest(request: Omit<schema.Request, 'id' | 'createdAt'>, partyMembers: { characterId?: number; characterName?: string; roleInParty?: string }[]): Promise<schema.Request>;
  updateRequestStatus(id: number, statusId: number, reason?: string): Promise<void>;
  deleteRequest(id: number): Promise<void>;

  getRequestPartyMembers(requestId: number): Promise<schema.RequestPartyMember[]>;

  verifyPassword(username: string, password: string): Promise<schema.User | null>;
  seedData(): Promise<void>;
}

class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<schema.User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user;
  }

  async getUsers(): Promise<schema.User[]> {
    return db.select().from(schema.users);
  }

  async createUser(user: schema.InsertUser): Promise<schema.User> {
    const [newUser] = await db.insert(schema.users).values(user).returning();
    return newUser;
  }

  async updateUserPoints(id: number, amount: number): Promise<void> {
    const user = await this.getUser(id);
    if (user) {
      await db.update(schema.users).set({ points: user.points + amount }).where(eq(schema.users.id, id));
    }
  }

  async getRoles(): Promise<schema.Role[]> {
    return db.select().from(schema.roles);
  }

  async getRole(id: number): Promise<schema.Role | undefined> {
    const [role] = await db.select().from(schema.roles).where(eq(schema.roles.id, id));
    return role;
  }

  async getServers(): Promise<schema.Server[]> {
    return db.select().from(schema.servers);
  }

  async getServer(id: number): Promise<schema.Server | undefined> {
    const [server] = await db.select().from(schema.servers).where(eq(schema.servers.id, id));
    return server;
  }

  async createServer(server: Omit<schema.Server, 'id'>): Promise<schema.Server> {
    const [newServer] = await db.insert(schema.servers).values(server).returning();
    return newServer;
  }

  async updateServer(id: number, server: Partial<schema.Server>): Promise<void> {
    await db.update(schema.servers).set(server).where(eq(schema.servers.id, id));
  }

  async deleteServer(id: number): Promise<void> {
    await db.delete(schema.servers).where(eq(schema.servers.id, id));
  }

  async getDifficulties(): Promise<schema.Difficulty[]> {
    return db.select().from(schema.difficulties);
  }

  async getDifficulty(id: number): Promise<schema.Difficulty | undefined> {
    const [difficulty] = await db.select().from(schema.difficulties).where(eq(schema.difficulties.id, id));
    return difficulty;
  }

  async getStatuses(): Promise<schema.RequestStatus[]> {
    return db.select().from(schema.requestStatuses);
  }

  async getStatus(id: number): Promise<schema.RequestStatus | undefined> {
    const [status] = await db.select().from(schema.requestStatuses).where(eq(schema.requestStatuses.id, id));
    return status;
  }

  async getCharacters(): Promise<schema.Character[]> {
    return db.select().from(schema.characters);
  }

  async getCharacter(id: number): Promise<schema.Character | undefined> {
    const [character] = await db.select().from(schema.characters).where(eq(schema.characters.id, id));
    return character;
  }

  async getCharactersByUser(userId: number): Promise<schema.Character[]> {
    return db.select().from(schema.characters).where(eq(schema.characters.userId, userId));
  }

  async createCharacter(character: Omit<schema.Character, 'id'>): Promise<schema.Character> {
    const [newCharacter] = await db.insert(schema.characters).values(character).returning();
    return newCharacter;
  }

  async updateCharacter(id: number, character: Partial<schema.Character>): Promise<void> {
    await db.update(schema.characters).set(character).where(eq(schema.characters.id, id));
  }

  async setMainCharacter(id: number): Promise<void> {
    const character = await this.getCharacter(id);
    if (character && character.userId) {
      await db.update(schema.characters).set({ isMain: false }).where(eq(schema.characters.userId, character.userId));
      await db.update(schema.characters).set({ isMain: true }).where(eq(schema.characters.id, id));
    }
  }

  async deleteCharacter(id: number): Promise<void> {
    await db.delete(schema.characters).where(eq(schema.characters.id, id));
  }

  async getRespawns(): Promise<schema.Respawn[]> {
    return db.select().from(schema.respawns);
  }

  async getRespawn(id: number): Promise<schema.Respawn | undefined> {
    const [respawn] = await db.select().from(schema.respawns).where(eq(schema.respawns.id, id));
    return respawn;
  }

  async createRespawn(respawn: Omit<schema.Respawn, 'id'>): Promise<schema.Respawn> {
    const [newRespawn] = await db.insert(schema.respawns).values(respawn).returning();
    return newRespawn;
  }

  async updateRespawn(id: number, respawn: Partial<schema.Respawn>): Promise<void> {
    await db.update(schema.respawns).set(respawn).where(eq(schema.respawns.id, id));
  }

  async deleteRespawn(id: number): Promise<void> {
    await db.delete(schema.respawns).where(eq(schema.respawns.id, id));
  }

  async getSlots(): Promise<schema.Slot[]> {
    return db.select().from(schema.slots);
  }

  async getSlot(id: number): Promise<schema.Slot | undefined> {
    const [slot] = await db.select().from(schema.slots).where(eq(schema.slots.id, id));
    return slot;
  }

  async createSlot(slot: Omit<schema.Slot, 'id'>): Promise<schema.Slot> {
    const [newSlot] = await db.insert(schema.slots).values(slot).returning();
    return newSlot;
  }

  async deleteSlot(id: number): Promise<void> {
    await db.delete(schema.slots).where(eq(schema.slots.id, id));
  }

  async getPeriods(): Promise<schema.SchedulePeriod[]> {
    return db.select().from(schema.schedulePeriods);
  }

  async getPeriod(id: number): Promise<schema.SchedulePeriod | undefined> {
    const [period] = await db.select().from(schema.schedulePeriods).where(eq(schema.schedulePeriods.id, id));
    return period;
  }

  async createPeriod(period: Omit<schema.SchedulePeriod, 'id'>): Promise<schema.SchedulePeriod> {
    const [newPeriod] = await db.insert(schema.schedulePeriods).values(period).returning();
    return newPeriod;
  }

  async togglePeriod(id: number): Promise<void> {
    const period = await this.getPeriod(id);
    if (period) {
      await db.update(schema.schedulePeriods).set({ isActive: !period.isActive }).where(eq(schema.schedulePeriods.id, id));
    }
  }

  async deletePeriod(id: number): Promise<void> {
    await db.delete(schema.schedulePeriods).where(eq(schema.schedulePeriods.id, id));
  }

  async getRequests(): Promise<schema.Request[]> {
    return db.select().from(schema.requests).orderBy(desc(schema.requests.createdAt));
  }

  async getRequest(id: number): Promise<schema.Request | undefined> {
    const [request] = await db.select().from(schema.requests).where(eq(schema.requests.id, id));
    return request;
  }

  async createRequest(request: Omit<schema.Request, 'id' | 'createdAt'>, partyMembers: { characterId?: number; characterName?: string; roleInParty?: string }[]): Promise<schema.Request> {
    const [newRequest] = await db.insert(schema.requests).values(request).returning();
    
    if (partyMembers.length > 0) {
      await db.insert(schema.requestPartyMembers).values(
        partyMembers.map(pm => ({
          requestId: newRequest.id,
          characterId: pm.characterId || null,
          characterName: pm.characterName || null,
          roleInParty: pm.roleInParty || null,
        }))
      );
    }
    
    return newRequest;
  }

  async updateRequestStatus(id: number, statusId: number, reason?: string): Promise<void> {
    await db.update(schema.requests).set({ statusId, rejectionReason: reason }).where(eq(schema.requests.id, id));
  }

  async deleteRequest(id: number): Promise<void> {
    await db.delete(schema.requests).where(eq(schema.requests.id, id));
  }

  async getRequestPartyMembers(requestId: number): Promise<schema.RequestPartyMember[]> {
    return db.select().from(schema.requestPartyMembers).where(eq(schema.requestPartyMembers.requestId, requestId));
  }

  async verifyPassword(username: string, password: string): Promise<schema.User | null> {
    const user = await this.getUserByUsername(username);
    if (!user || !user.password) return null;
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async seedData(): Promise<void> {
    const existingUsers = await this.getUsers();
    if (existingUsers.length > 0) return;

    const existingRoles = await this.getRoles();
    if (existingRoles.length === 0) {
      await db.insert(schema.roles).values([
        { name: 'admin', description: 'Guild administrator with full access' },
        { name: 'user', description: 'Regular guild member' },
      ]);
    }

    const existingStatuses = await this.getStatuses();
    if (existingStatuses.length === 0) {
      await db.insert(schema.requestStatuses).values([
        { name: 'pending', description: 'Awaiting admin approval', color: 'yellow' },
        { name: 'approved', description: 'Request approved', color: 'green' },
        { name: 'rejected', description: 'Request rejected', color: 'red' },
        { name: 'cancelled', description: 'Request cancelled by user', color: 'gray' },
      ]);
    }

    const existingDifficulties = await this.getDifficulties();
    if (existingDifficulties.length === 0) {
      await db.insert(schema.difficulties).values([
        { name: 'easy', description: 'Beginner friendly', color: 'green', sortOrder: 1 },
        { name: 'medium', description: 'Intermediate challenge', color: 'yellow', sortOrder: 2 },
        { name: 'hard', description: 'Advanced players', color: 'orange', sortOrder: 3 },
        { name: 'nightmare', description: 'Elite players only', color: 'red', sortOrder: 4 },
      ]);
    }

    const roles = await this.getRoles();
    const adminRole = roles.find(r => r.name === 'admin');
    const userRole = roles.find(r => r.name === 'user');

    const difficulties = await this.getDifficulties();
    const hardDifficulty = difficulties.find(d => d.name === 'hard');
    const nightmareDifficulty = difficulties.find(d => d.name === 'nightmare');
    const mediumDifficulty = difficulties.find(d => d.name === 'medium');

    if (!adminRole || !userRole || !hardDifficulty || !nightmareDifficulty || !mediumDifficulty) {
      console.error('Seed data dependencies not found');
      return;
    }

    const existingServers = await this.getServers();
    let server1, server2;
    
    if (existingServers.length === 0) {
      [server1] = await db.insert(schema.servers).values([
        { name: 'Antica', region: 'EU' },
      ]).returning();
      [server2] = await db.insert(schema.servers).values([
        { name: 'Wintera', region: 'NA' },
      ]).returning();
    } else {
      server1 = existingServers.find(s => s.name === 'Antica') || existingServers[0];
      server2 = existingServers.find(s => s.name === 'Wintera') || existingServers[1] || existingServers[0];
    }

    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const playerPasswordHash = await bcrypt.hash('player123', 10);

    const [adminUser] = await db.insert(schema.users).values([
      { username: 'admin', password: adminPasswordHash, roleId: adminRole.id, points: 1000 },
    ]).returning();

    const [regularUser] = await db.insert(schema.users).values([
      { username: 'player1', password: playerPasswordHash, roleId: userRole.id, points: 150 },
    ]).returning();

    await db.insert(schema.characters).values([
      { userId: adminUser.id, serverId: server1.id, name: 'Admin Knight', vocation: 'Elite Knight', level: 500, isMain: true },
      { userId: regularUser.id, serverId: server1.id, name: 'Hunter Elite', vocation: 'Royal Paladin', level: 450, isMain: true },
    ]);

    await db.insert(schema.respawns).values([
      { serverId: server1.id, name: 'Library - Fire', difficultyId: hardDifficulty.id, maxPlayers: 5 },
      { serverId: server1.id, name: 'Soul War - Crater', difficultyId: nightmareDifficulty.id, maxPlayers: 5 },
      { serverId: server1.id, name: 'Cobras', difficultyId: mediumDifficulty.id, maxPlayers: 4 },
      { serverId: server2.id, name: 'Rotten Blood - Jaded', difficultyId: nightmareDifficulty.id, maxPlayers: 5 },
    ]);

    await db.insert(schema.slots).values([
      { serverId: server1.id, startTime: '18:00', endTime: '20:00' },
      { serverId: server1.id, startTime: '20:00', endTime: '22:00' },
      { serverId: server1.id, startTime: '22:00', endTime: '00:00' },
      { serverId: server2.id, startTime: '19:00', endTime: '21:00' },
      { serverId: server2.id, startTime: '21:00', endTime: '23:00' },
    ]);

    await db.insert(schema.schedulePeriods).values([
      { serverId: server1.id, name: 'Week 1 - December 2024', startDate: '2024-12-01', endDate: '2024-12-07', isActive: true },
      { serverId: server2.id, name: 'Week 1 - December 2024', startDate: '2024-12-01', endDate: '2024-12-07', isActive: true },
    ]);
  }
}

export const storage = new DatabaseStorage();
