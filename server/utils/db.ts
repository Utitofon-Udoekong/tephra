import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

// ============================================
// Schema Definitions
// ============================================

// Blocks table
export const blocks = sqliteTable('blocks', {
  height: integer('height').primaryKey(),
  hash: text('hash').notNull(),
  time: text('time').notNull(), // ISO timestamp
  txCount: integer('tx_count').default(0),
  proposer: text('proposer'),
  chainId: text('chain_id'),
})

// Transactions table
export const transactions = sqliteTable('transactions', {
  hash: text('hash').primaryKey(),
  blockHeight: integer('block_height').references(() => blocks.height),
  sender: text('sender'),
  receiver: text('receiver'),
  type: text('type'), // transfer, delegate, undelegate, btc_stake, etc.
  amount: text('amount'), // Store as string to handle big numbers
  denom: text('denom'),
  fee: text('fee'),
  status: text('status').default('success'), // success, failed, pending
  time: text('time').notNull(),
  memo: text('memo'),
  rawData: text('raw_data'), // JSON string of full tx data
})

// Addresses table
export const addresses = sqliteTable('addresses', {
  address: text('address').primaryKey(),
  label: text('label'),
  labelSource: text('label_source'), // manual, heuristic, ml
  labelConfidence: real('label_confidence'),
  firstSeen: text('first_seen'),
  lastSeen: text('last_seen'),
  txCount: integer('tx_count').default(0),
  balance: text('balance'), // JSON string of balances
  isContract: integer('is_contract', { mode: 'boolean' }).default(false),
  isValidator: integer('is_validator', { mode: 'boolean' }).default(false),
  metadata: text('metadata'), // JSON string for extra data
})

// Address labels table (for multiple labels per address)
export const addressLabels = sqliteTable('address_labels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  address: text('address').notNull().references(() => addresses.address),
  label: text('label').notNull(),
  category: text('category'), // whale, exchange, validator, smart_money, bot, etc.
  confidence: real('confidence').default(1.0),
  source: text('source').default('manual'), // manual, heuristic, ml
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at'),
})

// User sessions (for auth)
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  username: text('username').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  expiresAt: text('expires_at').notNull(),
})

// Watched addresses (user feature)
export const watchedAddresses = sqliteTable('watched_addresses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id'),
  address: text('address').notNull(),
  nickname: text('nickname'),
  alertsEnabled: integer('alerts_enabled', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})

// Babylon-specific: Finality Providers
export const finalityProviders = sqliteTable('finality_providers', {
  btcPk: text('btc_pk').primaryKey(),
  address: text('address'),
  description: text('description'),
  commission: text('commission'),
  totalDelegations: text('total_delegations'),
  status: text('status'), // active, inactive, jailed
  lastUpdated: text('last_updated'),
})

// Babylon-specific: BTC Delegations
export const btcDelegations = sqliteTable('btc_delegations', {
  stakingTxHash: text('staking_tx_hash').primaryKey(),
  stakerAddress: text('staker_address'),
  fpBtcPk: text('fp_btc_pk').references(() => finalityProviders.btcPk),
  stakingValue: text('staking_value'),
  stakingTime: integer('staking_time'),
  unbondingTime: integer('unbonding_time'),
  status: text('status'), // active, unbonding, unbonded
  createdAt: text('created_at'),
})

// ============================================
// Database Connection
// ============================================

let _db: ReturnType<typeof drizzle> | null = null
let _sqlite: Database.Database | null = null

export function getDatabase() {
  if (!_db) {
    // Use in-memory database for development, file for production
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || ':memory:'
    
    try {
      _sqlite = new Database(dbPath)
      _db = drizzle(_sqlite)
      
      // Initialize schema
      initializeSchema(_sqlite)
      
      console.log(`[DB] Connected to SQLite: ${dbPath === ':memory:' ? 'in-memory' : dbPath}`)
    } catch (error) {
      console.error('[DB] Failed to connect:', error)
      // Fallback to in-memory
      _sqlite = new Database(':memory:')
      _db = drizzle(_sqlite)
      initializeSchema(_sqlite)
      console.log('[DB] Using in-memory database (fallback)')
    }
  }
  
  return _db
}

export function getSqlite() {
  if (!_sqlite) {
    getDatabase() // Initialize if not done
  }
  return _sqlite!
}

// ============================================
// Schema Initialization
// ============================================

function initializeSchema(sqlite: Database.Database) {
  // Create tables if they don't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS blocks (
      height INTEGER PRIMARY KEY,
      hash TEXT NOT NULL,
      time TEXT NOT NULL,
      tx_count INTEGER DEFAULT 0,
      proposer TEXT,
      chain_id TEXT
    );

    CREATE TABLE IF NOT EXISTS transactions (
      hash TEXT PRIMARY KEY,
      block_height INTEGER REFERENCES blocks(height),
      sender TEXT,
      receiver TEXT,
      type TEXT,
      amount TEXT,
      denom TEXT,
      fee TEXT,
      status TEXT DEFAULT 'success',
      time TEXT NOT NULL,
      memo TEXT,
      raw_data TEXT
    );

    CREATE TABLE IF NOT EXISTS addresses (
      address TEXT PRIMARY KEY,
      label TEXT,
      label_source TEXT,
      label_confidence REAL,
      first_seen TEXT,
      last_seen TEXT,
      tx_count INTEGER DEFAULT 0,
      balance TEXT,
      is_contract INTEGER DEFAULT 0,
      is_validator INTEGER DEFAULT 0,
      metadata TEXT
    );

    CREATE TABLE IF NOT EXISTS address_labels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      address TEXT NOT NULL REFERENCES addresses(address),
      label TEXT NOT NULL,
      category TEXT,
      confidence REAL DEFAULT 1.0,
      source TEXT DEFAULT 'manual',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS watched_addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      address TEXT NOT NULL,
      nickname TEXT,
      alerts_enabled INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS finality_providers (
      btc_pk TEXT PRIMARY KEY,
      address TEXT,
      description TEXT,
      commission TEXT,
      total_delegations TEXT,
      status TEXT,
      last_updated TEXT
    );

    CREATE TABLE IF NOT EXISTS btc_delegations (
      staking_tx_hash TEXT PRIMARY KEY,
      staker_address TEXT,
      fp_btc_pk TEXT REFERENCES finality_providers(btc_pk),
      staking_value TEXT,
      staking_time INTEGER,
      unbonding_time INTEGER,
      status TEXT,
      created_at TEXT
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_transactions_block ON transactions(block_height);
    CREATE INDEX IF NOT EXISTS idx_transactions_sender ON transactions(sender);
    CREATE INDEX IF NOT EXISTS idx_transactions_receiver ON transactions(receiver);
    CREATE INDEX IF NOT EXISTS idx_transactions_time ON transactions(time);
    CREATE INDEX IF NOT EXISTS idx_address_labels_address ON address_labels(address);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_btc_delegations_staker ON btc_delegations(staker_address);
  `)
}

// ============================================
// Type Exports
// ============================================

export type Block = typeof blocks.$inferSelect
export type NewBlock = typeof blocks.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type Address = typeof addresses.$inferSelect
export type NewAddress = typeof addresses.$inferInsert
export type AddressLabel = typeof addressLabels.$inferSelect
export type NewAddressLabel = typeof addressLabels.$inferInsert
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert

