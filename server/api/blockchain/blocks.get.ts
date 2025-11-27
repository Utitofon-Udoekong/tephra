import { getBabylonClient, getTimeAgo } from '../../utils/babylon'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(parseInt(query.limit as string) || 10, 50)
  
  try {
    const client = getBabylonClient()
    const blocks = await client.getRecentBlocks(limit)
    
    const formattedBlocks = blocks.map(block => ({
      height: parseInt(block.block.header.height),
      hash: block.block_id.hash,
      time: block.block.header.time,
      timeAgo: getTimeAgo(block.block.header.time),
      txCount: block.block.data.txs?.length || 0,
      proposer: block.block.header.proposer_address,
      chainId: block.block.header.chain_id,
    }))
    
    return {
      success: true,
      data: formattedBlocks,
    }
  } catch (error: any) {
    console.error('[API] Failed to get blocks:', error)
    
    // Return mock data
    const now = Date.now()
    const mockBlocks = Array.from({ length: limit }, (_, i) => ({
      height: 1847293 - i,
      hash: `BLOCK${1847293 - i}HASH`,
      time: new Date(now - i * 6000).toISOString(),
      timeAgo: `${i * 6}s ago`,
      txCount: Math.floor(Math.random() * 10),
      proposer: 'bbnvaloper1...',
      chainId: 'bbn-test-6',
    }))
    
    return {
      success: true,
      data: mockBlocks,
      mock: true,
    }
  }
})

