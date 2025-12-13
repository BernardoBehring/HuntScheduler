import fs from 'fs';
import pg from 'pg';

const { Pool } = pg;

async function importRespawns() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const dataFile = fs.readFileSync('.local/state/memory/respawns_data.txt', 'utf-8');
  const lines = dataFile.trim().split('\n').slice(1);

  const serverId = 3;
  const difficultyId = 6;
  const defaultMaxPlayers = 4;
  const defaultMinPlayers = 1;

  let insertedCount = 0;

  for (const line of lines) {
    const parts = line.split('|');
    if (parts.length < 4) continue;

    const [tsCode, name, city, status] = parts;
    const isAvailable = status.trim() === 'FREE';

    try {
      await pool.query(
        `INSERT INTO respawns (server_id, name, difficulty_id, max_players, min_players, ts_code, city, is_available) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [serverId, name.trim(), difficultyId, defaultMaxPlayers, defaultMinPlayers, tsCode.trim(), city.trim(), isAvailable]
      );
      insertedCount++;
    } catch (err) {
      console.error(`Failed to insert: ${name}`, err);
    }
  }

  console.log(`Inserted ${insertedCount} respawns`);
  await pool.end();
}

importRespawns().catch(console.error);
