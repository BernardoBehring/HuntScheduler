const API_BASE = '/api';

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
  points: number;
}

export interface Server {
  id: number;
  name: string;
  region: string;
}

export interface Respawn {
  id: number;
  serverId: number;
  server?: Server;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'nightmare';
  maxPlayers: number;
}

export interface Slot {
  id: number;
  startTime: string;
  endTime: string;
}

export interface SchedulePeriod {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Request {
  id: number;
  userId: number;
  user?: User;
  serverId: number;
  server?: Server;
  respawnId: number;
  respawn?: Respawn;
  slotId: number;
  slot?: Slot;
  periodId: number;
  period?: SchedulePeriod;
  status: 'pending' | 'approved' | 'rejected';
  partyMembers: string[];
  rejectionReason?: string;
  createdAt: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP Error: ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  users: {
    getAll: (): Promise<User[]> =>
      fetch(`${API_BASE}/users`).then(r => handleResponse(r)),
    get: (id: number): Promise<User> =>
      fetch(`${API_BASE}/users/${id}`).then(r => handleResponse(r)),
    create: (user: Omit<User, 'id'>): Promise<User> =>
      fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      }).then(r => handleResponse(r)),
    updatePoints: (id: number, amount: number): Promise<void> =>
      fetch(`${API_BASE}/users/${id}/points`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(amount),
      }).then(r => handleResponse(r)),
  },

  servers: {
    getAll: (): Promise<Server[]> =>
      fetch(`${API_BASE}/servers`).then(r => handleResponse(r)),
    get: (id: number): Promise<Server> =>
      fetch(`${API_BASE}/servers/${id}`).then(r => handleResponse(r)),
    create: (server: Omit<Server, 'id'>): Promise<Server> =>
      fetch(`${API_BASE}/servers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(server),
      }).then(r => handleResponse(r)),
    update: (id: number, server: Server): Promise<void> =>
      fetch(`${API_BASE}/servers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(server),
      }).then(r => handleResponse(r)),
    delete: (id: number): Promise<void> =>
      fetch(`${API_BASE}/servers/${id}`, { method: 'DELETE' }).then(r => handleResponse(r)),
  },

  respawns: {
    getAll: (): Promise<Respawn[]> =>
      fetch(`${API_BASE}/respawns`).then(r => handleResponse(r)),
    get: (id: number): Promise<Respawn> =>
      fetch(`${API_BASE}/respawns/${id}`).then(r => handleResponse(r)),
    create: (respawn: Omit<Respawn, 'id'>): Promise<Respawn> =>
      fetch(`${API_BASE}/respawns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(respawn),
      }).then(r => handleResponse(r)),
    update: (id: number, respawn: Respawn): Promise<void> =>
      fetch(`${API_BASE}/respawns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(respawn),
      }).then(r => handleResponse(r)),
    delete: (id: number): Promise<void> =>
      fetch(`${API_BASE}/respawns/${id}`, { method: 'DELETE' }).then(r => handleResponse(r)),
  },

  slots: {
    getAll: (): Promise<Slot[]> =>
      fetch(`${API_BASE}/slots`).then(r => handleResponse(r)),
    get: (id: number): Promise<Slot> =>
      fetch(`${API_BASE}/slots/${id}`).then(r => handleResponse(r)),
    create: (slot: Omit<Slot, 'id'>): Promise<Slot> =>
      fetch(`${API_BASE}/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slot),
      }).then(r => handleResponse(r)),
    delete: (id: number): Promise<void> =>
      fetch(`${API_BASE}/slots/${id}`, { method: 'DELETE' }).then(r => handleResponse(r)),
  },

  periods: {
    getAll: (): Promise<SchedulePeriod[]> =>
      fetch(`${API_BASE}/periods`).then(r => handleResponse(r)),
    get: (id: number): Promise<SchedulePeriod> =>
      fetch(`${API_BASE}/periods/${id}`).then(r => handleResponse(r)),
    create: (period: Omit<SchedulePeriod, 'id'>): Promise<SchedulePeriod> =>
      fetch(`${API_BASE}/periods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(period),
      }).then(r => handleResponse(r)),
    toggle: (id: number): Promise<void> =>
      fetch(`${API_BASE}/periods/${id}/toggle`, { method: 'PATCH' }).then(r => handleResponse(r)),
    delete: (id: number): Promise<void> =>
      fetch(`${API_BASE}/periods/${id}`, { method: 'DELETE' }).then(r => handleResponse(r)),
  },

  requests: {
    getAll: (): Promise<Request[]> =>
      fetch(`${API_BASE}/requests`).then(r => handleResponse(r)),
    get: (id: number): Promise<Request> =>
      fetch(`${API_BASE}/requests/${id}`).then(r => handleResponse(r)),
    create: (request: Omit<Request, 'id' | 'status' | 'createdAt'>): Promise<Request> =>
      fetch(`${API_BASE}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }).then(r => handleResponse(r)),
    updateStatus: (id: number, status: string, reason?: string): Promise<void> =>
      fetch(`${API_BASE}/requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }),
      }).then(r => handleResponse(r)),
    delete: (id: number): Promise<void> =>
      fetch(`${API_BASE}/requests/${id}`, { method: 'DELETE' }).then(r => handleResponse(r)),
  },
};
