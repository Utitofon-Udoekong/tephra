import { getBabylonClient } from '../../utils/babylon'

export default defineEventHandler(async (event) => {
  try {
    const client = getBabylonClient()
    const stats = await client.getNetworkStats()
    
    return {
      success: true,
      data: stats,
    }
  } catch (error: any) {
    console.error('[API] Failed to get network stats:', error)
    
    // Return mock data if API fails
    return {
      success: true,
      data: {
        latestBlock: {
          height: 1847293,
          time: new Date().toISOString(),
          hash: 'ABCD1234...',
          txCount: 5,
          proposer: 'bbnvaloper1...',
        },
        chainId: 'bbn-test-6',
        nodeVersion: '0.1.0',
        totalValidators: 42,
        bondedTokens: '1000000000000',
      },
      mock: true,
    }
  }
})

