const mysql = require('mysql2/promise');

const DB_NAME = process.env.DB_NAME || 'conference_db';
let realPool = null;

async function createDatabaseIfMissing() {
  const setupConnection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    await setupConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  } finally {
    await setupConnection.end();
  }
}

async function getPool() {
  if (realPool) return realPool;

  await createDatabaseIfMissing();

  realPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return realPool;
}

module.exports = {
  async getConnection() {
    const pool = await getPool();
    return pool.getConnection();
  },

  async query(sql, params) {
    const pool = await getPool();
    return pool.query(sql, params);
  },

  async execute(sql, params) {
    const pool = await getPool();
    return pool.execute(sql, params);
  },

  async end() {
    if (realPool) {
      await realPool.end();
      realPool = null;
    }
  }
};
