import { create } from 'zustand';
import { api } from './api';

export type Role = 'admin' | 'user';
export type Status = 'pending' | 'approved' | 'rejected';

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

export interface Respawn {
  id: string;
  serverId: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'nightmare';
  maxPlayers: number;
}

export interface Slot {
  id: string;
  startTime: string;
  endTime: string;
}

export interface SchedulePeriod {
  id: string;
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
  status: Status;
  partyMembers: string[];
  rejectionReason?: string;
  createdAt: number;
}

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
  { id: 'r1', serverId: 's1', name: 'Library - Fire', difficulty: 'hard', maxPlayers: 5 },
  { id: 'r2', serverId: 's1', name: 'Soul War - Crater', difficulty: 'nightmare', maxPlayers: 5 },
  { id: 'r3', serverId: 's1', name: 'Cobras', difficulty: 'medium', maxPlayers: 4 },
  { id: 'r4', serverId: 's2', name: 'Rotten Blood - Jaded', difficulty: 'nightmare', maxPlayers: 5 },
];

const MOCK_SLOTS: Slot[] = [
  { id: 'sl1', startTime: '18:00', endTime: '20:00' },
  { id: 'sl2', startTime: '20:00', endTime: '22:00' },
  { id: 'sl3', startTime: '22:00', endTime: '00:00' },
];

const MOCK_PERIODS: SchedulePeriod[] = [
  { id: 'p1', name: 'Week 48 - Nov Rotation', startDate: '2024-11-27', endDate: '2024-12-04', isActive: true },
  { id: 'p2', name: 'Week 49 - Dec Rotation', startDate: '2024-12-04', endDate: '2024-12-11', isActive: false },
];

const MOCK_REQUESTS: Request[] = [
  { 
    id: 'req1', userId: '2', serverId: 's1', respawnId: 'r1', slotId: 'sl1', 
    periodId: 'p1', status: 'approved', 
    partyMembers: ['HunterElite', 'DruidHealer', 'SorcBlaster', 'KnightTank'],
    createdAt: Date.now() - 100000
  },
  { 
    id: 'req2', userId: '3', serverId: 's1', respawnId: 'r1', slotId: 'sl1', 
    periodId: 'p1', status: 'rejected', 
    rejectionReason: 'Slot already taken by higher priority team',
    partyMembers: ['PaladinMaster', 'RandomDruid'],
    createdAt: Date.now() - 50000
  },
  { 
    id: 'req3', userId: '2', serverId: 's1', respawnId: 'r2', slotId: 'sl2', 
    periodId: 'p1', status: 'pending', 
    partyMembers: ['HunterElite', 'DruidHealer'],
    createdAt: Date.now()
  },
];

interface AppState {
  currentUser: User | null;
  users: User[];
  servers: Server[];
  respawns: Respawn[];
  slots: Slot[];
  periods: SchedulePeriod[];
  requests: Request[];
  isLoading: boolean;
  useApi: boolean;
  
  login: (userId: string) => void;
  logout: () => void;
  addRequest: (req: Omit<Request, 'id' | 'status' | 'createdAt'>) => void;
  updateRequestStatus: (id: string, status: Status, reason?: string) => void;
  addPoints: (userId: string, amount: number) => void;
  addPeriod: (period: Omit<SchedulePeriod, 'id'>) => void;
  togglePeriod: (id: string) => void;
  addRespawn: (respawn: Omit<Respawn, 'id'>) => void;
  updateRespawn: (id: string, respawn: Partial<Omit<Respawn, 'id'>>) => void;
  deleteRespawn: (id: string) => void;
  loadFromApi: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: MOCK_USERS[0],
  users: MOCK_USERS,
  servers: MOCK_SERVERS,
  respawns: MOCK_RESPAWNS,
  slots: MOCK_SLOTS,
  periods: MOCK_PERIODS,
  requests: MOCK_REQUESTS,
  isLoading: false,
  useApi: false,

  loadFromApi: async () => {
    set({ isLoading: true });
    try {
      const [users, servers, respawns, slots, periods, requests] = await Promise.all([
        api.users.getAll(),
        api.servers.getAll(),
        api.respawns.getAll(),
        api.slots.getAll(),
        api.periods.getAll(),
        api.requests.getAll(),
      ]);

      set({
        users: users.map(u => ({ ...u, id: String(u.id) })),
        servers: servers.map(s => ({ ...s, id: String(s.id) })),
        respawns: respawns.map(r => ({ ...r, id: String(r.id), serverId: String(r.serverId) })),
        slots: slots.map(s => ({ ...s, id: String(s.id) })),
        periods: periods.map(p => ({ 
          ...p, 
          id: String(p.id),
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
          status: 'pending',
          createdAt: Date.now()
        }]
      }));
    }
  },

  updateRequestStatus: async (id, status, reason) => {
    const state = get();
    if (state.useApi) {
      try {
        await api.requests.updateStatus(parseInt(id), status, reason);
        await state.loadFromApi();
      } catch (error) {
        console.error('Failed to update request status:', error);
      }
    } else {
      set((state) => {
        const targetRequest = state.requests.find(r => r.id === id);
        if (!targetRequest) return state;

        if (status === 'approved') {
          const conflicts = state.requests.filter(r => 
            r.id !== id &&
            r.serverId === targetRequest.serverId &&
            r.respawnId === targetRequest.respawnId &&
            r.slotId === targetRequest.slotId &&
            r.periodId === targetRequest.periodId &&
            r.status === 'pending'
          );

          const newRequests = state.requests.map(r => {
            if (r.id === id) return { ...r, status, rejectionReason: reason };
            if (conflicts.find(c => c.id === r.id)) {
              return { ...r, status: 'rejected' as Status, rejectionReason: `Conflict with approved request #${id}` };
            }
            return r;
          });
          return { requests: newRequests };
        }

        return {
          requests: state.requests.map(r => 
            r.id === id ? { ...r, status, rejectionReason: reason } : r
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
          difficulty: respawn.difficulty,
          maxPlayers: respawn.maxPlayers,
        });
        await state.loadFromApi();
      } catch (error) {
        console.error('Failed to add respawn:', error);
      }
    } else {
      set((state) => ({
        respawns: [...state.respawns, { ...respawn, id: Math.random().toString(36).substr(2, 9) }]
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
            difficulty: respawn.difficulty || existing.difficulty,
            maxPlayers: respawn.maxPlayers || existing.maxPlayers,
          });
          await state.loadFromApi();
        }
      } catch (error) {
        console.error('Failed to update respawn:', error);
      }
    } else {
      set((state) => ({
        respawns: state.respawns.map(r => r.id === id ? { ...r, ...respawn } : r)
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
