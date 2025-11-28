import { create } from 'zustand';
import { api } from './api';

export type Role = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  role: Role;
  points: number;
}

export interface Server {
  id: string;
  name: string;
  region: string;
}

export interface RequestStatus {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface Difficulty {
  id: string;
  name: string;
  description?: string;
  color?: string;
  sortOrder: number;
}

export interface Respawn {
  id: string;
  serverId: string;
  name: string;
  difficultyId: string;
  difficulty?: string;
  maxPlayers: number;
}

export interface Slot {
  id: string;
  serverId: string;
  startTime: string;
  endTime: string;
}

export interface SchedulePeriod {
  id: string;
  serverId: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Request {
  id: string;
  userId: string;
  serverId: string;
  respawnId: string;
  slotId: string;
  periodId: string;
  statusId: string;
  status?: string;
  partyMembers: string[];
  rejectionReason?: string;
  createdAt: number;
}

const MOCK_STATUSES: RequestStatus[] = [
  { id: '1', name: 'pending', description: 'Awaiting admin approval', color: 'yellow' },
  { id: '2', name: 'approved', description: 'Request approved', color: 'green' },
  { id: '3', name: 'rejected', description: 'Request rejected', color: 'red' },
  { id: '4', name: 'cancelled', description: 'Request cancelled by user', color: 'gray' },
];

const MOCK_DIFFICULTIES: Difficulty[] = [
  { id: '1', name: 'easy', description: 'Beginner friendly', color: 'green', sortOrder: 1 },
  { id: '2', name: 'medium', description: 'Intermediate challenge', color: 'yellow', sortOrder: 2 },
  { id: '3', name: 'hard', description: 'Advanced players', color: 'orange', sortOrder: 3 },
  { id: '4', name: 'nightmare', description: 'Elite players only', color: 'red', sortOrder: 4 },
];

const MOCK_USERS: User[] = [
  { id: '1', username: 'AdminUser', role: 'admin', points: 1000 },
  { id: '2', username: 'HunterElite', role: 'user', points: 150 },
  { id: '3', username: 'PaladinMaster', role: 'user', points: 80 },
  { id: '4', username: 'DruidHealer', role: 'user', points: 200 },
];

const MOCK_SERVERS: Server[] = [
  { id: 's1', name: 'Antica', region: 'EU' },
  { id: 's2', name: 'Wintera', region: 'NA' },
];

const MOCK_RESPAWNS: Respawn[] = [
  { id: 'r1', serverId: 's1', name: 'Library - Fire', difficultyId: '3', difficulty: 'hard', maxPlayers: 5 },
  { id: 'r2', serverId: 's1', name: 'Soul War - Crater', difficultyId: '4', difficulty: 'nightmare', maxPlayers: 5 },
  { id: 'r3', serverId: 's1', name: 'Cobras', difficultyId: '2', difficulty: 'medium', maxPlayers: 4 },
  { id: 'r4', serverId: 's2', name: 'Rotten Blood - Jaded', difficultyId: '4', difficulty: 'nightmare', maxPlayers: 5 },
];

const MOCK_SLOTS: Slot[] = [
  { id: 'sl1', serverId: 's1', startTime: '18:00', endTime: '20:00' },
  { id: 'sl2', serverId: 's1', startTime: '20:00', endTime: '22:00' },
  { id: 'sl3', serverId: 's1', startTime: '22:00', endTime: '00:00' },
  { id: 'sl4', serverId: 's2', startTime: '18:00', endTime: '20:00' },
  { id: 'sl5', serverId: 's2', startTime: '20:00', endTime: '22:00' },
];

const MOCK_PERIODS: SchedulePeriod[] = [
  { id: 'p1', serverId: 's1', name: 'Week 48 - Nov Rotation', startDate: '2024-11-27', endDate: '2024-12-04', isActive: true },
  { id: 'p2', serverId: 's1', name: 'Week 49 - Dec Rotation', startDate: '2024-12-04', endDate: '2024-12-11', isActive: false },
  { id: 'p3', serverId: 's2', name: 'Week 48 - Wintera', startDate: '2024-11-27', endDate: '2024-12-04', isActive: true },
];

const MOCK_REQUESTS: Request[] = [
  { 
    id: 'req1', userId: '2', serverId: 's1', respawnId: 'r1', slotId: 'sl1', 
    periodId: 'p1', statusId: '2', status: 'approved',
    partyMembers: ['HunterElite', 'DruidHealer', 'SorcBlaster', 'KnightTank'],
    createdAt: Date.now() - 100000
  },
  { 
    id: 'req2', userId: '3', serverId: 's1', respawnId: 'r1', slotId: 'sl1', 
    periodId: 'p1', statusId: '3', status: 'rejected',
    rejectionReason: 'Slot already taken by higher priority team',
    partyMembers: ['PaladinMaster', 'RandomDruid'],
    createdAt: Date.now() - 50000
  },
  { 
    id: 'req3', userId: '2', serverId: 's1', respawnId: 'r2', slotId: 'sl2', 
    periodId: 'p1', statusId: '1', status: 'pending',
    partyMembers: ['HunterElite', 'DruidHealer'],
    createdAt: Date.now()
  },
];

interface AppState {
  currentUser: User | null;
  users: User[];
  servers: Server[];
  statuses: RequestStatus[];
  difficulties: Difficulty[];
  respawns: Respawn[];
  slots: Slot[];
  periods: SchedulePeriod[];
  requests: Request[];
  isLoading: boolean;
  useApi: boolean;
  
  login: (userId: string) => void;
  logout: () => void;
  addRequest: (req: Omit<Request, 'id' | 'statusId' | 'status' | 'createdAt'>) => void;
  updateRequestStatus: (id: string, statusId: string, reason?: string) => void;
  addPoints: (userId: string, amount: number) => void;
  addPeriod: (period: Omit<SchedulePeriod, 'id'>) => void;
  togglePeriod: (id: string) => void;
  addRespawn: (respawn: Omit<Respawn, 'id'>) => void;
  updateRespawn: (id: string, respawn: Partial<Omit<Respawn, 'id'>>) => void;
  deleteRespawn: (id: string) => void;
  loadFromApi: () => Promise<void>;
  getStatusName: (statusId: string) => string;
  getDifficultyName: (difficultyId: string) => string;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: MOCK_USERS[0],
  users: MOCK_USERS,
  servers: MOCK_SERVERS,
  statuses: MOCK_STATUSES,
  difficulties: MOCK_DIFFICULTIES,
  respawns: MOCK_RESPAWNS,
  slots: MOCK_SLOTS,
  periods: MOCK_PERIODS,
  requests: MOCK_REQUESTS,
  isLoading: false,
  useApi: false,

  getStatusName: (statusId: string) => {
    const state = get();
    const status = state.statuses.find(s => s.id === statusId);
    return status?.name || 'unknown';
  },

  getDifficultyName: (difficultyId: string) => {
    const state = get();
    const difficulty = state.difficulties.find(d => d.id === difficultyId);
    return difficulty?.name || 'unknown';
  },

  loadFromApi: async () => {
    set({ isLoading: true });
    try {
      const [users, servers, statuses, difficulties, respawns, slots, periods, requests] = await Promise.all([
        api.users.getAll(),
        api.servers.getAll(),
        api.statuses.getAll(),
        api.difficulties.getAll(),
        api.respawns.getAll(),
        api.slots.getAll(),
        api.periods.getAll(),
        api.requests.getAll(),
      ]);

      set({
        users: users.map(u => ({ ...u, id: String(u.id) })),
        servers: servers.map(s => ({ ...s, id: String(s.id) })),
        statuses: statuses.map(s => ({ ...s, id: String(s.id) })),
        difficulties: difficulties.map(d => ({ ...d, id: String(d.id) })),
        respawns: respawns.map(r => ({ 
          ...r, 
          id: String(r.id), 
          serverId: String(r.serverId),
          difficultyId: String(r.difficultyId),
          difficulty: r.difficulty?.name
        })),
        slots: slots.map(s => ({ ...s, id: String(s.id), serverId: String(s.serverId) })),
        periods: periods.map(p => ({ 
          ...p, 
          id: String(p.id),
          serverId: String(p.serverId),
          startDate: p.startDate.split('T')[0],
          endDate: p.endDate.split('T')[0]
        })),
        requests: requests.map(r => ({
          ...r,
          id: String(r.id),
          userId: String(r.userId),
          serverId: String(r.serverId),
          respawnId: String(r.respawnId),
          slotId: String(r.slotId),
          periodId: String(r.periodId),
          statusId: String(r.statusId),
          status: r.status?.name,
          createdAt: new Date(r.createdAt).getTime(),
        })),
        currentUser: users.length > 0 ? { ...users[0], id: String(users[0].id) } : null,
        useApi: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load from API, using mock data:', error);
      set({ isLoading: false, useApi: false });
    }
  },

  login: (userId) => set((state) => ({ 
    currentUser: state.users.find(u => u.id === userId) || null 
  })),
  
  logout: () => set({ currentUser: null }),

  addRequest: async (req) => {
    const state = get();
    if (state.useApi) {
      try {
        const newRequest = await api.requests.create({
          userId: parseInt(req.userId),
          serverId: parseInt(req.serverId),
          respawnId: parseInt(req.respawnId),
          slotId: parseInt(req.slotId),
          periodId: parseInt(req.periodId),
          partyMembers: req.partyMembers,
        });
        set((state) => ({
          requests: [...state.requests, {
            ...newRequest,
            id: String(newRequest.id),
            userId: String(newRequest.userId),
            serverId: String(newRequest.serverId),
            respawnId: String(newRequest.respawnId),
            slotId: String(newRequest.slotId),
            periodId: String(newRequest.periodId),
            statusId: String(newRequest.statusId),
            status: newRequest.status?.name,
            createdAt: new Date(newRequest.createdAt).getTime(),
          }]
        }));
      } catch (error) {
        console.error('Failed to add request:', error);
      }
    } else {
      set((state) => ({
        requests: [...state.requests, {
          ...req,
          id: Math.random().toString(36).substr(2, 9),
          statusId: '1',
          status: 'pending',
          createdAt: Date.now()
        }]
      }));
    }
  },

  updateRequestStatus: async (id, statusId, reason) => {
    const state = get();
    const statusName = state.getStatusName(statusId);
    
    if (state.useApi) {
      try {
        await api.requests.updateStatus(parseInt(id), parseInt(statusId), reason);
        await state.loadFromApi();
      } catch (error) {
        console.error('Failed to update request status:', error);
      }
    } else {
      set((state) => {
        const targetRequest = state.requests.find(r => r.id === id);
        if (!targetRequest) return state;

        const approvedStatusId = state.statuses.find(s => s.name === 'approved')?.id || '2';
        const rejectedStatusId = state.statuses.find(s => s.name === 'rejected')?.id || '3';
        const pendingStatusId = state.statuses.find(s => s.name === 'pending')?.id || '1';

        if (statusId === approvedStatusId) {
          const conflicts = state.requests.filter(r => 
            r.id !== id &&
            r.serverId === targetRequest.serverId &&
            r.respawnId === targetRequest.respawnId &&
            r.slotId === targetRequest.slotId &&
            r.periodId === targetRequest.periodId &&
            r.statusId === pendingStatusId
          );

          const newRequests = state.requests.map(r => {
            if (r.id === id) return { ...r, statusId, status: statusName, rejectionReason: reason };
            if (conflicts.find(c => c.id === r.id)) {
              return { ...r, statusId: rejectedStatusId, status: 'rejected', rejectionReason: `Conflict with approved request #${id}` };
            }
            return r;
          });
          return { requests: newRequests };
        }

        return {
          requests: state.requests.map(r => 
            r.id === id ? { ...r, statusId, status: statusName, rejectionReason: reason } : r
          )
        };
      });
    }
  },

  addPoints: async (userId, amount) => {
    const state = get();
    if (state.useApi) {
      try {
        await api.users.updatePoints(parseInt(userId), amount);
        await state.loadFromApi();
      } catch (error) {
        console.error('Failed to update points:', error);
      }
    } else {
      set((state) => ({
        users: state.users.map(u => 
          u.id === userId ? { ...u, points: u.points + amount } : u
        )
      }));
    }
  },

  addPeriod: async (period) => {
    const state = get();
    if (state.useApi) {
      try {
        await api.periods.create({
          serverId: parseInt(period.serverId),
          name: period.name,
          startDate: period.startDate,
          endDate: period.endDate,
          isActive: period.isActive,
        });
        await state.loadFromApi();
      } catch (error) {
        console.error('Failed to add period:', error);
      }
    } else {
      set((state) => ({
        periods: [...state.periods, { ...period, id: Math.random().toString(36).substr(2, 9) }]
      }));
    }
  },

  togglePeriod: async (id) => {
    const state = get();
    if (state.useApi) {
      try {
        await api.periods.toggle(parseInt(id));
        await state.loadFromApi();
      } catch (error) {
        console.error('Failed to toggle period:', error);
      }
    } else {
      set((state) => ({
        periods: state.periods.map(p => 
          p.id === id ? { ...p, isActive: !p.isActive } : p
        )
      }));
    }
  },

  addRespawn: async (respawn) => {
    const state = get();
    if (state.useApi) {
      try {
        await api.respawns.create({
          serverId: parseInt(respawn.serverId),
          name: respawn.name,
          difficultyId: parseInt(respawn.difficultyId),
          maxPlayers: respawn.maxPlayers,
        });
        await state.loadFromApi();
      } catch (error) {
        console.error('Failed to add respawn:', error);
      }
    } else {
      set((state) => ({
        respawns: [...state.respawns, { 
          ...respawn, 
          id: Math.random().toString(36).substr(2, 9),
          difficulty: state.getDifficultyName(respawn.difficultyId)
        }]
      }));
    }
  },

  updateRespawn: async (id, respawn) => {
    const state = get();
    if (state.useApi) {
      try {
        const existing = state.respawns.find(r => r.id === id);
        if (existing) {
          await api.respawns.update(parseInt(id), {
            id: parseInt(id),
            serverId: parseInt(respawn.serverId || existing.serverId),
            name: respawn.name || existing.name,
            difficultyId: parseInt(respawn.difficultyId || existing.difficultyId),
            maxPlayers: respawn.maxPlayers || existing.maxPlayers,
          });
          await state.loadFromApi();
        }
      } catch (error) {
        console.error('Failed to update respawn:', error);
      }
    } else {
      set((state) => ({
        respawns: state.respawns.map(r => r.id === id ? { 
          ...r, 
          ...respawn,
          difficulty: respawn.difficultyId ? state.getDifficultyName(respawn.difficultyId) : r.difficulty
        } : r)
      }));
    }
  },

  deleteRespawn: async (id) => {
    const state = get();
    if (state.useApi) {
      try {
        await api.respawns.delete(parseInt(id));
        await state.loadFromApi();
      } catch (error) {
        console.error('Failed to delete respawn:', error);
      }
    } else {
      set((state) => ({
        respawns: state.respawns.filter(r => r.id !== id)
      }));
    }
  }
}));
