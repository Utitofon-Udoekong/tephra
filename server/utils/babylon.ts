/**
 * Babylon Genesis LCD Client
 * 
 * Connects to Babylon Genesis chain (Cosmos SDK based) via REST/LCD API.
 * Provides methods to query blockchain data including:
 * - Blocks and transactions
 * - Account balances
 * - Validators and staking
 * - Babylon-specific: BTC staking, finality providers, epochs
 */

// ============================================
// Types
// ============================================

export interface BlockHeader {
  height: string
  time: string
  chain_id: string
  proposer_address: string
}

export interface BabylonBlock {
  block_id: {
    hash: string
  }
  block: {
    header: BlockHeader
    data: {
      txs: string[]
    }
  }
}

export interface BabylonTransaction {
  txhash: string
  height: string
  tx: any
  tx_response: {
    code: number
    logs: any[]
    gas_wanted: string
    gas_used: string
    timestamp: string
  }
}

export interface Coin {
  denom: string
  amount: string
}

export interface AccountBalance {
  balances: Coin[]
  pagination: {
    next_key: string | null
    total: string
  }
}

export interface Validator {
  operator_address: string
  consensus_pubkey: any
  jailed: boolean
  status: string
  tokens: string
  delegator_shares: string
  description: {
    moniker: string
    identity: string
    website: string
    details: string
  }
  commission: {
    commission_rates: {
      rate: string
      max_rate: string
      max_change_rate: string
    }
  }
}

export interface FinalityProvider {
  btc_pk: string
  addr: string
  description: {
    moniker: string
    identity: string
    website: string
    security_contact?: string
    details: string
  }
  commission: string
  total_bonded_sat?: string
  slashed_babylon_height: string
  slashed_btc_height: number
  height: string
  jailed: boolean
  highest_voted_height: number
  soft_deleted: boolean
}

export interface BTCDelegation {
  staking_tx_hash: string
  staker_addr: string
  fp_btc_pk_list: string[]
  staking_value: string
  staking_time: number
  unbonding_time: number
  state: string
}

export interface EpochInfo {
  epoch_number: string
  current_epoch_interval: string
  first_block_height: string
}

export interface NodeInfo {
  default_node_info: {
    network: string
    version: string
    moniker: string
  }
  application_version: {
    name: string
    version: string
  }
}

export interface NetworkStats {
  latestBlock: {
    height: number
    time: string
    hash: string
    txCount: number
    proposer: string
  }
  chainId: string
  nodeVersion: string
  totalValidators: number
  bondedTokens: string
}

// ============================================
// LCD Client
// ============================================

class BabylonLCDClient {
  private baseUrl: string
  private chainId: string
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTTL = 10000 // 10 seconds cache

  constructor() {
    const config = useRuntimeConfig()
    console.log('[Babylon LCD] Config:', JSON.stringify({
      babylonLcdUrl: config.babylonLcdUrl,
      babylonRpcUrl: config.babylonRpcUrl,
    }))
    this.baseUrl = config.babylonLcdUrl as string || 'https://babylon-testnet-api.polkachu.com'
    this.chainId = config.public?.babylonChainId || 'bbn-test-6'
  }

  getBaseUrl(): string {
    return this.baseUrl
  }

  async fetch<T>(path: string, useCache = true): Promise<T> {
    const cacheKey = path
    const now = Date.now()

    // Check cache
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      if (now - cached.timestamp < this.cacheTTL) {
        return cached.data as T
      }
    }

    try {
      const url = `${this.baseUrl}${path}`
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Cache the result
      if (useCache) {
        this.cache.set(cacheKey, { data, timestamp: now })
      }

      return data as T
    } catch (error) {
      console.error(`[Babylon LCD] Error fetching ${path}:`, error)
      throw error
    }
  }

  // ============================================
  // Node Info
  // ============================================

  async getNodeInfo(): Promise<NodeInfo> {
    return this.fetch<NodeInfo>('/cosmos/base/tendermint/v1beta1/node_info')
  }

  // ============================================
  // Blocks
  // ============================================

  async getLatestBlock(): Promise<BabylonBlock> {
    return this.fetch<BabylonBlock>('/cosmos/base/tendermint/v1beta1/blocks/latest', false)
  }

  async getBlockByHeight(height: number): Promise<BabylonBlock> {
    return this.fetch<BabylonBlock>(`/cosmos/base/tendermint/v1beta1/blocks/${height}`)
  }

  async getRecentBlocks(count = 10): Promise<BabylonBlock[]> {
    const latest = await this.getLatestBlock()
    const latestHeight = parseInt(latest.block.header.height)
    
    const blocks: BabylonBlock[] = [latest]
    const promises: Promise<BabylonBlock>[] = []
    
    for (let i = 1; i < count && latestHeight - i > 0; i++) {
      promises.push(this.getBlockByHeight(latestHeight - i))
    }
    
    const results = await Promise.allSettled(promises)
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        blocks.push(result.value)
      }
    })
    
    return blocks
  }

  // ============================================
  // Transactions
  // ============================================

  async getTransactionsByHeight(height: number): Promise<{ tx_responses: BabylonTransaction[] }> {
    return this.fetch(`/cosmos/tx/v1beta1/txs?events=tx.height=${height}`)
  }

  async getTransactionByHash(hash: string): Promise<{ tx_response: BabylonTransaction }> {
    return this.fetch(`/cosmos/tx/v1beta1/txs/${hash}`)
  }

  async getRecentTransactions(limit = 20): Promise<BabylonTransaction[]> {
    // Get transactions from recent blocks
    const blocks = await this.getRecentBlocks(5)
    const transactions: BabylonTransaction[] = []

    for (const block of blocks) {
      if (transactions.length >= limit) break
      
      try {
        const height = parseInt(block.block.header.height)
        const txsResult = await this.getTransactionsByHeight(height)
        
        if (txsResult.tx_responses) {
          transactions.push(...txsResult.tx_responses)
        }
      } catch (error) {
        // Skip blocks with errors
        continue
      }
    }

    return transactions.slice(0, limit)
  }

  // ============================================
  // Accounts & Balances
  // ============================================

  async getAccountBalance(address: string): Promise<AccountBalance> {
    return this.fetch<AccountBalance>(`/cosmos/bank/v1beta1/balances/${address}`)
  }

  async getAccountInfo(address: string): Promise<any> {
    return this.fetch(`/cosmos/auth/v1beta1/accounts/${address}`)
  }

  // ============================================
  // Validators & Staking
  // ============================================

  async getValidators(status = 'BOND_STATUS_BONDED'): Promise<{ validators: Validator[] }> {
    return this.fetch(`/cosmos/staking/v1beta1/validators?status=${status}`)
  }

  async getStakingPool(): Promise<{ pool: { bonded_tokens: string; not_bonded_tokens: string } }> {
    return this.fetch('/cosmos/staking/v1beta1/pool')
  }

  // ============================================
  // Babylon-Specific: BTC Staking
  // ============================================

  async getFinalityProviders(): Promise<{ finality_providers: FinalityProvider[] }> {
    try {
      return await this.fetch('/babylon/btcstaking/v1/finality_providers')
    } catch {
      // Return empty if endpoint not available
      return { finality_providers: [] }
    }
  }

  async getBTCDelegations(status = ''): Promise<{ btc_delegations: BTCDelegation[] }> {
    try {
      const path = status 
        ? `/babylon/btcstaking/v1/btc_delegations?status=${status}`
        : '/babylon/btcstaking/v1/btc_delegations'
      return await this.fetch(path)
    } catch {
      return { btc_delegations: [] }
    }
  }

  async getCurrentEpoch(): Promise<{ epoch: EpochInfo }> {
    try {
      return await this.fetch('/babylon/epoching/v1/current_epoch')
    } catch {
      return { epoch: { epoch_number: '0', current_epoch_interval: '0', first_block_height: '0' } }
    }
  }

  // ============================================
  // Network Stats (Aggregated)
  // ============================================

  async getNetworkStats(): Promise<NetworkStats> {
    const [latestBlock, nodeInfo, validators, stakingPool] = await Promise.all([
      this.getLatestBlock(),
      this.getNodeInfo().catch(() => null),
      this.getValidators().catch(() => ({ validators: [] })),
      this.getStakingPool().catch(() => ({ pool: { bonded_tokens: '0', not_bonded_tokens: '0' } })),
    ])

    return {
      latestBlock: {
        height: parseInt(latestBlock.block.header.height),
        time: latestBlock.block.header.time,
        hash: latestBlock.block_id.hash,
        txCount: latestBlock.block.data.txs?.length || 0,
        proposer: latestBlock.block.header.proposer_address,
      },
      chainId: latestBlock.block.header.chain_id,
      nodeVersion: nodeInfo?.application_version?.version || 'unknown',
      totalValidators: validators.validators.length,
      bondedTokens: stakingPool.pool.bonded_tokens,
    }
  }
}

// ============================================
// Singleton Instance
// ============================================

let _client: BabylonLCDClient | null = null

export function getBabylonClient(): BabylonLCDClient {
  if (!_client) {
    _client = new BabylonLCDClient()
    console.log('[Babylon LCD] Initialized client with baseUrl:', _client.getBaseUrl())
  }
  return _client
}

export function resetBabylonClient(): void {
  _client = null
}

// ============================================
// Helper Functions
// ============================================

export function formatBBNAmount(amount: string, decimals = 6): string {
  const value = parseInt(amount) / Math.pow(10, decimals)
  return value.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })
}

export function shortenAddress(address: string, chars = 8): string {
  if (!address) return ''
  if (address.length <= chars * 2 + 3) return address
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

export function getTimeAgo(timestamp: string): string {
  const now = Date.now()
  const time = new Date(timestamp).getTime()
  const diff = now - time

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return `${seconds}s ago`
}

