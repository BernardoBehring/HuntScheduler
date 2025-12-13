const API_BASE = '/api';

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface Character {
  id: number;
  userId?: number;
  serverId: number;
  server?: Server;
  name: string;
  vocation?: string;
  level: number;
  isMain: boolean;
  isExternal?: boolean;
  externalVerifiedAt?: string;
}

export interface RequestPartyMember {
  id: number;
  requestId: number;
  characterId: number;
  character?: Character;
  roleInParty?: string;
  isLeader?: boolean;
}

export interface User {
  id: number;
  username: string;
  roleId: number;
  role?: Role;
  points: number;
  email?: string;
  whatsapp?: string;
  characters?: Character[];
}

export interface Server {
  id: number;
  name: string;
  region: string;
}

export interface RequestStatus {
  id: number;
  name: string;
  description?: string;
  color?: string;
}

export interface Difficulty {
  id: number;
  name: string;
  description?: string;
  color?: string;
  sortOrder: number;
}

export interface Respawn {
  id: number;
  serverId: number;
  server?: Server;
  name: string;
  difficultyId: number;
  difficulty?: Difficulty;
  maxPlayers: number;
}

export interface Slot {
  id: number;
  serverId: number;
  server?: Server;
  startTime: string;
  endTime: string;
}

export interface SchedulePeriod {
  id: number;
  serverId: number;
  server?: Server;
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
  statusId: number;
  status?: RequestStatus;
  leaderCharacterId?: number;
  leaderCharacter?: Character;
  partyMembers: RequestPartyMember[];
  rejectionReason?: string;
  createdAt: string;
}

export interface PointTransaction {
  id: number;
  userId: number;
  user?: User;
  adminId: number;
  admin?: User;
  amount: number;
  reason: string;
  balanceAfter: number;
  createdAt: string;
}

export interface CreatePointTransactionDto {
  userId: number;
  adminId: number;
  amount: number;
  reason: string;
}

export interface PointClaim {
  id: number;
  userId: number;
  user?: User;
  pointsAwarded?: number;
  note?: string;
  screenshotUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedByAdminId?: number;
  reviewedByAdmin?: User;
  adminResponse?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface CreatePointClaimDto {
  userId: number;
  note?: string;
  screenshotUrl?: string;
}

export interface ReviewPointClaimDto {
  adminId: number;
  adminResponse: string;
  pointsAwarded?: number;
}

export interface UpdateProfileDto {
  email?: string;
  whatsapp?: string;
}

export interface CharacterValidationResult {
  name: string;
  isValid: boolean;
  errorMessage?: string;
  world?: string;
  vocation?: string;
  level?: number;
}

export interface ValidateCharactersResponse {
  results: CharacterValidationResult[];
  allValid: boolean;
}

export interface CreateRequestDto {
  userId: number;
  serverId: number;
  respawnId: number;
  slotId: number;
  periodId: number;
  leaderCharacterId?: number;
  partyMembers: { characterId?: number; characterName?: string; roleInParty?: string; isLeader?: boolean }[];
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
    updateProfile: (id: number, data: UpdateProfileDto): Promise<void> =>
      fetch(`${API_BASE}/users/${id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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

  statuses: {
    getAll: (): Promise<RequestStatus[]> =>
      fetch(`${API_BASE}/statuses`).then(r => handleResponse(r)),
    get: (id: number): Promise<RequestStatus> =>
      fetch(`${API_BASE}/statuses/${id}`).then(r => handleResponse(r)),
  },

  difficulties: {
    getAll: (): Promise<Difficulty[]> =>
      fetch(`${API_BASE}/difficulties`).then(r => handleResponse(r)),
    get: (id: number): Promise<Difficulty> =>
      fetch(`${API_BASE}/difficulties/${id}`).then(r => handleResponse(r)),
  },

  respawns: {
    getAll: (): Promise<Respawn[]> =>
      fetch(`${API_BASE}/respawns`).then(r => handleResponse(r)),
    get: (id: number): Promise<Respawn> =>
      fetch(`${API_BASE}/respawns/${id}`).then(r => handleResponse(r)),
    create: (respawn: Omit<Respawn, 'id' | 'server' | 'difficulty'>): Promise<Respawn> =>
      fetch(`${API_BASE}/respawns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(respawn),
      }).then(r => handleResponse(r)),
    update: (id: number, respawn: Omit<Respawn, 'server' | 'difficulty'>): Promise<void> =>
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
    create: (slot: Omit<Slot, 'id' | 'server'>): Promise<Slot> =>
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
    create: (period: Omit<SchedulePeriod, 'id' | 'server'>): Promise<SchedulePeriod> =>
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
    create: (request: CreateRequestDto): Promise<Request> =>
      fetch(`${API_BASE}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }).then(r => handleResponse(r)),
    updateStatus: (id: number, statusId: number, reason?: string): Promise<void> =>
      fetch(`${API_BASE}/requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusId, reason }),
      }).then(r => handleResponse(r)),
    delete: (id: number): Promise<void> =>
      fetch(`${API_BASE}/requests/${id}`, { method: 'DELETE' }).then(r => handleResponse(r)),
  },

  roles: {
    getAll: (): Promise<Role[]> =>
      fetch(`${API_BASE}/roles`).then(r => handleResponse(r)),
    get: (id: number): Promise<Role> =>
      fetch(`${API_BASE}/roles/${id}`).then(r => handleResponse(r)),
  },

  characters: {
    getAll: (): Promise<Character[]> =>
      fetch(`${API_BASE}/characters`).then(r => handleResponse(r)),
    get: (id: number): Promise<Character> =>
      fetch(`${API_BASE}/characters/${id}`).then(r => handleResponse(r)),
    getByUser: (userId: number): Promise<Character[]> =>
      fetch(`${API_BASE}/characters/user/${userId}`).then(r => handleResponse(r)),
    create: (character: Omit<Character, 'id'>): Promise<Character> =>
      fetch(`${API_BASE}/characters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(character),
      }).then(r => handleResponse(r)),
    update: (id: number, character: Character): Promise<void> =>
      fetch(`${API_BASE}/characters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(character),
      }).then(r => handleResponse(r)),
    setMain: (id: number): Promise<void> =>
      fetch(`${API_BASE}/characters/${id}/set-main`, { method: 'PATCH' }).then(r => handleResponse(r)),
    delete: (id: number): Promise<void> =>
      fetch(`${API_BASE}/characters/${id}`, { method: 'DELETE' }).then(r => handleResponse(r)),
    validate: (characterNames: string[], expectedWorld?: string): Promise<ValidateCharactersResponse> =>
      fetch(`${API_BASE}/characters/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterNames, expectedWorld }),
      }).then(r => handleResponse(r)),
  },

  auth: {
    login: (username: string, password: string): Promise<User> =>
      fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      }).then(r => handleResponse(r)),
    logout: (): Promise<void> =>
      fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      }).then(r => handleResponse(r)),
    me: (): Promise<User> =>
      fetch(`${API_BASE}/auth/me`, {
        credentials: 'include',
      }).then(r => handleResponse(r)),
  },

  pointTransactions: {
    getAll: (): Promise<PointTransaction[]> =>
      fetch(`${API_BASE}/point-transactions`).then(r => handleResponse(r)),
    getByUser: (userId: number): Promise<PointTransaction[]> =>
      fetch(`${API_BASE}/point-transactions/user/${userId}`).then(r => handleResponse(r)),
    getByAdmin: (adminId: number): Promise<PointTransaction[]> =>
      fetch(`${API_BASE}/point-transactions/admin/${adminId}`).then(r => handleResponse(r)),
    create: (dto: CreatePointTransactionDto): Promise<PointTransaction> =>
      fetch(`${API_BASE}/point-transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      }).then(r => handleResponse(r)),
  },

  pointClaims: {
    getAll: (): Promise<PointClaim[]> =>
      fetch(`${API_BASE}/point-claims`).then(r => handleResponse(r)),
    getPending: (): Promise<PointClaim[]> =>
      fetch(`${API_BASE}/point-claims/pending`).then(r => handleResponse(r)),
    getByUser: (userId: number): Promise<PointClaim[]> =>
      fetch(`${API_BASE}/point-claims/user/${userId}`).then(r => handleResponse(r)),
    get: (id: number): Promise<PointClaim> =>
      fetch(`${API_BASE}/point-claims/${id}`).then(r => handleResponse(r)),
    create: (dto: CreatePointClaimDto): Promise<PointClaim> =>
      fetch(`${API_BASE}/point-claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      }).then(r => handleResponse(r)),
    approve: (id: number, dto: ReviewPointClaimDto): Promise<PointClaim> =>
      fetch(`${API_BASE}/point-claims/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      }).then(r => handleResponse(r)),
    reject: (id: number, dto: ReviewPointClaimDto): Promise<PointClaim> =>
      fetch(`${API_BASE}/point-claims/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      }).then(r => handleResponse(r)),
  },

  upload: {
    screenshot: async (file: File): Promise<{ url: string; fileName: string }> => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE}/upload/screenshot`, {
        method: 'POST',
        body: formData,
      });
      return handleResponse(response);
    },
  },
};
