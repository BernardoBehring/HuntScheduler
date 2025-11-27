import { create } from 'zustand';

// Types
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
  startTime: string; // "14:00"
  endTime: string;   // "16:00"
}

export interface Request {
  id: string;
  userId: string;
  serverId: string;
  respawnId: string;
  slotId: string;
  date: string; // ISO date string
  status: Status;
  partyMembers: string[]; // List of character names
  rejectionReason?: string;
  createdAt: number;
}

// Mock Data
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

const MOCK_REQUESTS: Request[] = [
  { 
    id: 'req1', userId: '2', serverId: 's1', respawnId: 'r1', slotId: 'sl1', 
    date: new Date().toISOString().split('T')[0], status: 'approved', 
    partyMembers: ['HunterElite', 'DruidHealer', 'SorcBlaster', 'KnightTank'],
    createdAt: Date.now() - 100000
  },
  { 
    id: 'req2', userId: '3', serverId: 's1', respawnId: 'r1', slotId: 'sl1', 
    date: new Date().toISOString().split('T')[0], status: 'rejected', 
    rejectionReason: 'Slot already taken by higher priority team',
    partyMembers: ['PaladinMaster', 'RandomDruid'],
    createdAt: Date.now() - 50000
  },
  { 
    id: 'req3', userId: '2', serverId: 's1', respawnId: 'r2', slotId: 'sl2', 
    date: new Date().toISOString().split('T')[0], status: 'pending', 
    partyMembers: ['HunterElite', 'DruidHealer'],
    createdAt: Date.now()
  },
];

// Store
interface AppState {
  currentUser: User | null;
  users: User[];
  servers: Server[];
  respawns: Respawn[];
  slots: Slot[];
  requests: Request[];
  
  login: (userId: string) => void;
  logout: () => void;
  addRequest: (req: Omit<Request, 'id' | 'status' | 'createdAt'>) => void;
  updateRequestStatus: (id: string, status: Status, reason?: string) => void;
  addPoints: (userId: string, amount: number) => void;
}

export const useStore = create<AppState>((set) => ({
  currentUser: MOCK_USERS[0], // Default logged in as Admin for demo
  users: MOCK_USERS,
  servers: MOCK_SERVERS,
  respawns: MOCK_RESPAWNS,
  slots: MOCK_SLOTS,
  requests: MOCK_REQUESTS,

  login: (userId) => set((state) => ({ 
    currentUser: state.users.find(u => u.id === userId) || null 
  })),
  
  logout: () => set({ currentUser: null }),

  addRequest: (req) => set((state) => ({
    requests: [...state.requests, {
      ...req,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: Date.now()
    }]
  })),

  updateRequestStatus: (id, status, reason) => set((state) => {
    const targetRequest = state.requests.find(r => r.id === id);
    if (!targetRequest) return state;

    // If approving, check for conflicts (same server, respawn, slot, date)
    if (status === 'approved') {
      const conflicts = state.requests.filter(r => 
        r.id !== id &&
        r.serverId === targetRequest.serverId &&
        r.respawnId === targetRequest.respawnId &&
        r.slotId === targetRequest.slotId &&
        r.date === targetRequest.date &&
        r.status === 'pending'
      );

      // Auto-reject conflicts
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
  }),

  addPoints: (userId, amount) => set((state) => ({
    users: state.users.map(u => 
      u.id === userId ? { ...u, points: u.points + amount } : u
    )
  }))
}));
