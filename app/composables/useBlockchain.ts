/**
 * Composable for fetching blockchain data
 */

interface NetworkStats {
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

interface Block {
  height: number
  hash: string
  time: string
  timeAgo: string
  txCount: number
  proposer: string
  chainId: string
}

interface Transaction {
  hash: string
  height: number
  type: string
  from: string
  fromFull: string
  to: string
  toFull: string
  amount: string
  denom: string
  status: 'success' | 'failed'
  time: string
  timeAgo: string
  gasUsed: string
  gasWanted: string
}

interface FinalityProvider {
  btcPk: string
  btcPkShort: string
  address: string
  addressShort: string
  moniker: string
  website: string
  commission: string
  commissionPercent: string
  totalBondedSat: string
  totalBondedBTC: string
  active: boolean
}

interface BTCDelegation {
  stakingTxHash: string
  stakingTxHashShort: string
  stakerAddress: string
  stakerAddressShort: string
  finalityProviders: string[]
  stakingValue: string
  stakingValueBTC: string
  stakingTime: number
  unbondingTime: number
  status: string
}

export function useBlockchain() {
  // State
  const networkStats = ref<NetworkStats | null>(null)
  const blocks = ref<Block[]>([])
  const transactions = ref<Transaction[]>([])
  const finalityProviders = ref<FinalityProvider[]>([])
  const btcDelegations = ref<BTCDelegation[]>([])
  
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isMock = ref(false)

  /**
   * Fetch network stats
   */
  async function fetchNetworkStats() {
    try {
      const response = await $fetch<{ success: boolean; data: NetworkStats; mock?: boolean }>('/api/blockchain/stats')
      if (response.success) {
        networkStats.value = response.data
        isMock.value = response.mock || false
      }
    } catch (e: any) {
      console.error('Failed to fetch network stats:', e)
      error.value = e.message
    }
  }

  /**
   * Fetch recent blocks
   */
  async function fetchBlocks(limit = 10) {
    try {
      const response = await $fetch<{ success: boolean; data: Block[]; mock?: boolean }>('/api/blockchain/blocks', {
        query: { limit },
      })
      if (response.success) {
        blocks.value = response.data
        isMock.value = response.mock || false
      }
    } catch (e: any) {
      console.error('Failed to fetch blocks:', e)
      error.value = e.message
    }
  }

  /**
   * Fetch recent transactions
   */
  async function fetchTransactions(limit = 20) {
    try {
      const response = await $fetch<{ success: boolean; data: Transaction[]; mock?: boolean }>('/api/blockchain/transactions', {
        query: { limit },
      })
      if (response.success) {
        transactions.value = response.data
        isMock.value = response.mock || false
      }
    } catch (e: any) {
      console.error('Failed to fetch transactions:', e)
      error.value = e.message
    }
  }

  /**
   * Fetch finality providers
   */
  async function fetchFinalityProviders() {
    try {
      const response = await $fetch<{ 
        success: boolean
        data: { providers: FinalityProvider[]; totalProviders: number; activeProviders: number }
        mock?: boolean 
      }>('/api/babylon/finality-providers')
      
      if (response.success) {
        finalityProviders.value = response.data.providers
        isMock.value = response.mock || false
      }
    } catch (e: any) {
      console.error('Failed to fetch finality providers:', e)
      error.value = e.message
    }
  }

  /**
   * Fetch BTC delegations
   */
  async function fetchBTCDelegations(status = '') {
    try {
      const response = await $fetch<{
        success: boolean
        data: { delegations: BTCDelegation[]; totalDelegations: number; currentEpoch: any }
        mock?: boolean
      }>('/api/babylon/staking', {
        query: status ? { status } : {},
      })
      
      if (response.success) {
        btcDelegations.value = response.data.delegations
        isMock.value = response.mock || false
      }
    } catch (e: any) {
      console.error('Failed to fetch BTC delegations:', e)
      error.value = e.message
    }
  }

  /**
   * Fetch all dashboard data
   */
  async function fetchDashboardData() {
    isLoading.value = true
    error.value = null
    
    try {
      await Promise.all([
        fetchNetworkStats(),
        fetchTransactions(10),
        fetchFinalityProviders(),
      ])
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Refresh data
   */
  function refresh() {
    fetchDashboardData()
  }

  // Computed
  const formattedBlockHeight = computed(() => {
    if (!networkStats.value) return '...'
    return networkStats.value.latestBlock.height.toLocaleString()
  })

  const formattedTotalValidators = computed(() => {
    if (!networkStats.value) return '...'
    return networkStats.value.totalValidators.toLocaleString()
  })

  const formattedBondedTokens = computed(() => {
    if (!networkStats.value) return '...'
    const value = parseInt(networkStats.value.bondedTokens) / 1000000
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toFixed(0)
  })

  return {
    // State
    networkStats,
    blocks,
    transactions,
    finalityProviders,
    btcDelegations,
    isLoading,
    error,
    isMock,
    
    // Actions
    fetchNetworkStats,
    fetchBlocks,
    fetchTransactions,
    fetchFinalityProviders,
    fetchBTCDelegations,
    fetchDashboardData,
    refresh,
    
    // Computed
    formattedBlockHeight,
    formattedTotalValidators,
    formattedBondedTokens,
  }
}

