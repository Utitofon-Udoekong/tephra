import { getBabylonClient } from '../../utils/babylon'

export default defineEventHandler(async (event) => {
  try {
    const client = getBabylonClient()
    
    // Fetch recent transactions to analyze
    const [stats, transactions, blocks] = await Promise.all([
      client.getNetworkStats(),
      client.getRecentTransactions(100),
      client.getRecentBlocks(20),
    ])
    
    // Aggregate transaction types
    const txTypeCounts: Record<string, number> = {}
    
    transactions.forEach((tx: any) => {
      if (tx.tx?.body?.messages?.length > 0) {
        const msg = tx.tx.body.messages[0]
        const typeUrl = msg['@type'] || ''
        let type = 'Unknown'
        
        if (typeUrl.includes('MsgSend')) type = 'Transfer'
        else if (typeUrl.includes('MsgDelegate')) type = 'Delegate'
        else if (typeUrl.includes('MsgUndelegate')) type = 'Undelegate'
        else if (typeUrl.includes('MsgCreateBTCDelegation')) type = 'BTC Stake'
        else if (typeUrl.includes('MsgVote')) type = 'Vote'
        else if (typeUrl.includes('MsgAddFinalitySig')) type = 'Finality Sig'
        else if (typeUrl.includes('MsgCommitPubRandList')) type = 'Pub Rand'
        else {
          const parts = typeUrl.split('.')
          type = parts[parts.length - 1]?.replace('Msg', '') || 'Unknown'
        }
        
        txTypeCounts[type] = (txTypeCounts[type] || 0) + 1
      }
    })
    
    // Calculate percentages
    const totalTxs = Object.values(txTypeCounts).reduce((a, b) => a + b, 0)
    const txTypes = Object.entries(txTypeCounts)
      .map(([type, count]) => ({
        type,
        count,
        percent: Math.round((count / totalTxs) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
    
    // Calculate block metrics
    const avgBlockTime = blocks.length > 1
      ? blocks.slice(0, -1).reduce((sum, block, i) => {
          const currentTime = new Date(block.block.header.time).getTime()
          const nextTime = new Date(blocks[i + 1].block.header.time).getTime()
          return sum + (currentTime - nextTime)
        }, 0) / (blocks.length - 1) / 1000
      : 6
    
    // Calculate average TPS from recent blocks
    const avgTxsPerBlock = blocks.reduce((sum, b) => sum + (b.block.data.txs?.length || 0), 0) / blocks.length
    const tps = (avgTxsPerBlock / avgBlockTime).toFixed(1)
    
    // Volume data from recent blocks (group by hour/day)
    const volumeByBlock = blocks.slice(0, 10).map(b => ({
      height: parseInt(b.block.header.height),
      txCount: b.block.data.txs?.length || 0,
      time: b.block.header.time,
    }))
    
    return {
      success: true,
      data: {
        metrics: {
          latestBlock: stats.latestBlock.height,
          totalValidators: stats.totalValidators,
          avgBlockTime: avgBlockTime.toFixed(1),
          tps,
          chainId: stats.chainId,
          bondedTokens: stats.bondedTokens,
        },
        txTypes,
        recentBlocks: volumeByBlock,
        totalTransactions: totalTxs,
      },
    }
  } catch (error: any) {
    console.error('[API] Failed to get analytics:', error)
    
    // Return mock data
    return {
      success: true,
      data: {
        metrics: {
          latestBlock: 409000,
          totalValidators: 36,
          avgBlockTime: '6.0',
          tps: '5.0',
          chainId: 'bbn-test-6',
          bondedTokens: '173557359134742',
        },
        txTypes: [
          { type: 'Finality Sig', count: 50, percent: 50 },
          { type: 'Transfer', count: 25, percent: 25 },
          { type: 'Delegate', count: 15, percent: 15 },
          { type: 'Other', count: 10, percent: 10 },
        ],
        recentBlocks: [],
        totalTransactions: 100,
      },
      mock: true,
    }
  }
})

