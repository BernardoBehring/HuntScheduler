import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import crypto from "crypto";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

const SessionStore = MemoryStore(session);

function stripPassword(user: any) {
  if (!user) return user;
  const { password, ...safeUser } = user;
  return safeUser;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  const sessionSecret = process.env.SESSION_SECRET || 
    (process.env.NODE_ENV === 'production' 
      ? require('crypto').randomBytes(32).toString('hex')
      : 'dev-session-secret-not-for-production');

  app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
      checkPeriod: 86400000
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  }));

  await storage.seedData();

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
      }
      
      const user = await storage.verifyPassword(username, password);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      req.session.userId = user.id;
      const role = await storage.getRole(user.roleId);
      const characters = await storage.getCharactersByUser(user.id);
      
      res.json({ 
        id: user.id, 
        username: user.username, 
        roleId: user.roleId,
        role: role,
        points: user.points,
        characters 
      });
    } catch (error) {
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out' });
    });
  });

  app.get('/api/auth/me', async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    const role = await storage.getRole(user.roleId);
    const characters = await storage.getCharactersByUser(user.id);
    
    res.json({ 
      id: user.id, 
      username: user.username, 
      roleId: user.roleId,
      role: role,
      points: user.points,
      characters 
    });
  });

  app.get('/api/users', async (_req: Request, res: Response) => {
    const users = await storage.getUsers();
    const usersWithDetails = await Promise.all(users.map(async (user) => {
      const role = await storage.getRole(user.roleId);
      const characters = await storage.getCharactersByUser(user.id);
      return { ...stripPassword(user), role, characters };
    }));
    res.json(usersWithDetails);
  });

  app.get('/api/users/:id', async (req: Request, res: Response) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) return res.status(404).json({ message: 'User not found' });
    const role = await storage.getRole(user.roleId);
    const characters = await storage.getCharactersByUser(user.id);
    res.json({ ...stripPassword(user), role, characters });
  });

  app.patch('/api/users/:id/points', async (req: Request, res: Response) => {
    await storage.updateUserPoints(parseInt(req.params.id), req.body);
    res.status(204).send();
  });

  app.get('/api/roles', async (_req: Request, res: Response) => {
    res.json(await storage.getRoles());
  });

  app.get('/api/roles/:id', async (req: Request, res: Response) => {
    const role = await storage.getRole(parseInt(req.params.id));
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.json(role);
  });

  app.get('/api/servers', async (_req: Request, res: Response) => {
    res.json(await storage.getServers());
  });

  app.get('/api/servers/:id', async (req: Request, res: Response) => {
    const server = await storage.getServer(parseInt(req.params.id));
    if (!server) return res.status(404).json({ message: 'Server not found' });
    res.json(server);
  });

  app.post('/api/servers', async (req: Request, res: Response) => {
    const server = await storage.createServer(req.body);
    res.status(201).json(server);
  });

  app.put('/api/servers/:id', async (req: Request, res: Response) => {
    await storage.updateServer(parseInt(req.params.id), req.body);
    res.status(204).send();
  });

  app.delete('/api/servers/:id', async (req: Request, res: Response) => {
    await storage.deleteServer(parseInt(req.params.id));
    res.status(204).send();
  });

  app.get('/api/difficulties', async (_req: Request, res: Response) => {
    res.json(await storage.getDifficulties());
  });

  app.get('/api/difficulties/:id', async (req: Request, res: Response) => {
    const difficulty = await storage.getDifficulty(parseInt(req.params.id));
    if (!difficulty) return res.status(404).json({ message: 'Difficulty not found' });
    res.json(difficulty);
  });

  app.get('/api/ts-positions', async (_req: Request, res: Response) => {
    res.json(await storage.getTsPositions());
  });

  app.get('/api/ts-positions/:id', async (req: Request, res: Response) => {
    const position = await storage.getTsPosition(parseInt(req.params.id));
    if (!position) return res.status(404).json({ message: 'TS Position not found' });
    res.json(position);
  });

  app.post('/api/ts-positions', async (req: Request, res: Response) => {
    const position = await storage.createTsPosition(req.body);
    res.status(201).json(position);
  });

  app.put('/api/ts-positions/:id', async (req: Request, res: Response) => {
    await storage.updateTsPosition(parseInt(req.params.id), req.body);
    res.status(204).send();
  });

  app.delete('/api/ts-positions/:id', async (req: Request, res: Response) => {
    await storage.deleteTsPosition(parseInt(req.params.id));
    res.status(204).send();
  });

  app.get('/api/statuses', async (_req: Request, res: Response) => {
    res.json(await storage.getStatuses());
  });

  app.get('/api/statuses/:id', async (req: Request, res: Response) => {
    const status = await storage.getStatus(parseInt(req.params.id));
    if (!status) return res.status(404).json({ message: 'Status not found' });
    res.json(status);
  });

  app.get('/api/characters', async (_req: Request, res: Response) => {
    const characters = await storage.getCharacters();
    const charactersWithDetails = await Promise.all(characters.map(async (char) => {
      const server = await storage.getServer(char.serverId);
      return { ...char, server };
    }));
    res.json(charactersWithDetails);
  });

  app.get('/api/characters/:id', async (req: Request, res: Response) => {
    const character = await storage.getCharacter(parseInt(req.params.id));
    if (!character) return res.status(404).json({ message: 'Character not found' });
    const server = await storage.getServer(character.serverId);
    res.json({ ...character, server });
  });

  app.get('/api/characters/user/:userId', async (req: Request, res: Response) => {
    const characters = await storage.getCharactersByUser(parseInt(req.params.userId));
    res.json(characters);
  });

  app.post('/api/characters', async (req: Request, res: Response) => {
    const character = await storage.createCharacter(req.body);
    res.status(201).json(character);
  });

  app.put('/api/characters/:id', async (req: Request, res: Response) => {
    await storage.updateCharacter(parseInt(req.params.id), req.body);
    res.status(204).send();
  });

  app.patch('/api/characters/:id/set-main', async (req: Request, res: Response) => {
    await storage.setMainCharacter(parseInt(req.params.id));
    res.status(204).send();
  });

  app.delete('/api/characters/:id', async (req: Request, res: Response) => {
    await storage.deleteCharacter(parseInt(req.params.id));
    res.status(204).send();
  });

  app.get('/api/respawns', async (_req: Request, res: Response) => {
    const respawns = await storage.getRespawns();
    const respawnsWithDetails = await Promise.all(respawns.map(async (r) => {
      const server = await storage.getServer(r.serverId);
      const difficulty = await storage.getDifficulty(r.difficultyId);
      return { ...r, server, difficulty };
    }));
    res.json(respawnsWithDetails);
  });

  app.get('/api/respawns/:id', async (req: Request, res: Response) => {
    const respawn = await storage.getRespawn(parseInt(req.params.id));
    if (!respawn) return res.status(404).json({ message: 'Respawn not found' });
    const server = await storage.getServer(respawn.serverId);
    const difficulty = await storage.getDifficulty(respawn.difficultyId);
    res.json({ ...respawn, server, difficulty });
  });

  app.post('/api/respawns', async (req: Request, res: Response) => {
    const respawn = await storage.createRespawn(req.body);
    res.status(201).json(respawn);
  });

  app.put('/api/respawns/:id', async (req: Request, res: Response) => {
    await storage.updateRespawn(parseInt(req.params.id), req.body);
    res.status(204).send();
  });

  app.delete('/api/respawns/:id', async (req: Request, res: Response) => {
    await storage.deleteRespawn(parseInt(req.params.id));
    res.status(204).send();
  });

  app.get('/api/slots', async (_req: Request, res: Response) => {
    const slots = await storage.getSlots();
    const slotsWithDetails = await Promise.all(slots.map(async (s) => {
      const server = await storage.getServer(s.serverId);
      return { ...s, server };
    }));
    res.json(slotsWithDetails);
  });

  app.get('/api/slots/:id', async (req: Request, res: Response) => {
    const slot = await storage.getSlot(parseInt(req.params.id));
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    const server = await storage.getServer(slot.serverId);
    res.json({ ...slot, server });
  });

  app.post('/api/slots', async (req: Request, res: Response) => {
    const slot = await storage.createSlot(req.body);
    res.status(201).json(slot);
  });

  app.delete('/api/slots/:id', async (req: Request, res: Response) => {
    await storage.deleteSlot(parseInt(req.params.id));
    res.status(204).send();
  });

  app.get('/api/periods', async (_req: Request, res: Response) => {
    const periods = await storage.getPeriods();
    const periodsWithDetails = await Promise.all(periods.map(async (p) => {
      const server = await storage.getServer(p.serverId);
      return { ...p, server };
    }));
    res.json(periodsWithDetails);
  });

  app.get('/api/periods/:id', async (req: Request, res: Response) => {
    const period = await storage.getPeriod(parseInt(req.params.id));
    if (!period) return res.status(404).json({ message: 'Period not found' });
    const server = await storage.getServer(period.serverId);
    res.json({ ...period, server });
  });

  app.post('/api/periods', async (req: Request, res: Response) => {
    const period = await storage.createPeriod(req.body);
    res.status(201).json(period);
  });

  app.patch('/api/periods/:id/toggle', async (req: Request, res: Response) => {
    await storage.togglePeriod(parseInt(req.params.id));
    res.status(204).send();
  });

  app.delete('/api/periods/:id', async (req: Request, res: Response) => {
    await storage.deletePeriod(parseInt(req.params.id));
    res.status(204).send();
  });

  app.get('/api/requests', async (_req: Request, res: Response) => {
    const requests = await storage.getRequests();
    const requestsWithDetails = await Promise.all(requests.map(async (r) => {
      const user = await storage.getUser(r.userId);
      const server = await storage.getServer(r.serverId);
      const respawn = await storage.getRespawn(r.respawnId);
      const slot = await storage.getSlot(r.slotId);
      const period = await storage.getPeriod(r.periodId);
      const status = await storage.getStatus(r.statusId);
      const partyMembers = await storage.getRequestPartyMembers(r.id);
      
      const partyMembersWithDetails = await Promise.all(partyMembers.map(async (pm) => {
        const character = pm.characterId ? await storage.getCharacter(pm.characterId) : null;
        return { ...pm, character };
      }));
      
      return { 
        ...r, 
        user: stripPassword(user),
        server, 
        respawn, 
        slot, 
        period, 
        status,
        partyMembers: partyMembersWithDetails
      };
    }));
    res.json(requestsWithDetails);
  });

  app.get('/api/requests/:id', async (req: Request, res: Response) => {
    const request = await storage.getRequest(parseInt(req.params.id));
    if (!request) return res.status(404).json({ message: 'Request not found' });
    
    const user = await storage.getUser(request.userId);
    const server = await storage.getServer(request.serverId);
    const respawn = await storage.getRespawn(request.respawnId);
    const slot = await storage.getSlot(request.slotId);
    const period = await storage.getPeriod(request.periodId);
    const status = await storage.getStatus(request.statusId);
    const partyMembers = await storage.getRequestPartyMembers(request.id);
    
    res.json({ 
      ...request, 
      user: stripPassword(user),
      server, 
      respawn, 
      slot, 
      period, 
      status,
      partyMembers 
    });
  });

  app.post('/api/requests', async (req: Request, res: Response) => {
    const { partyMembers, ...requestData } = req.body;
    const request = await storage.createRequest(requestData, partyMembers || []);
    res.status(201).json(request);
  });

  app.patch('/api/requests/:id/status', async (req: Request, res: Response) => {
    const { statusId, reason } = req.body;
    await storage.updateRequestStatus(parseInt(req.params.id), statusId, reason);
    res.status(204).send();
  });

  app.delete('/api/requests/:id', async (req: Request, res: Response) => {
    await storage.deleteRequest(parseInt(req.params.id));
    res.status(204).send();
  });

  return httpServer;
}
