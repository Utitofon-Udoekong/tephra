import { getBabylonClient, getTimeAgo, shortenAddress } from '../../utils/babylon'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(parseInt(query.limit as string) || 20, 100)
  
  try {
    const client = getBabylonClient()
    const transactions = await client.getRecentTransactions(limit)
    
    const formattedTxs = transactions.map(tx => {
      // Parse transaction type from messages
      let type = 'Unknown'
      let from = ''
      let to = ''
      let amount = ''
      let denom = 'ubbn'
      
      if (tx.tx?.body?.messages?.length > 0) {
        const msg = tx.tx.body.messages[0]
        const typeUrl = msg['@type'] || ''
        
        if (typeUrl.includes('MsgSend')) {
          type = 'Transfer'
          from = msg.from_address || ''
          to = msg.to_address || ''
          if (msg.amount?.length > 0) {
            amount = msg.amount[0].amount
            denom = msg.amount[0].denom
          }
        } else if (typeUrl.includes('MsgDelegate')) {
          type = 'Delegate'
          from = msg.delegator_address || ''
          to = msg.validator_address || ''
          amount = msg.amount?.amount || ''
          denom = msg.amount?.denom || 'ubbn'
        } else if (typeUrl.includes('MsgUndelegate')) {
          type = 'Undelegate'
          from = msg.delegator_address || ''
          to = msg.validator_address || ''
          amount = msg.amount?.amount || ''
        } else if (typeUrl.includes('MsgCreateBTCDelegation')) {
          type = 'BTC Stake'
          from = msg.staker_addr || ''
        } else if (typeUrl.includes('MsgVote')) {
          type = 'Vote'
          from = msg.voter || ''
        } else {
          // Extract type from URL
          const parts = typeUrl.split('.')
          type = parts[parts.length - 1]?.replace('Msg', '') || 'Unknown'
        }
      }
      
      return {
        hash: tx.txhash,
        height: parseInt(tx.height),
        type,
        from: shortenAddress(from),
        fromFull: from,
        to: shortenAddress(to),
        toFull: to,
        amount: amount ? formatAmount(amount, denom) : '-',
        denom,
        status: tx.tx_response?.code === 0 ? 'success' : 'failed',
        time: tx.tx_response?.timestamp || '',
        timeAgo: tx.tx_response?.timestamp ? getTimeAgo(tx.tx_response.timestamp) : '',
        gasUsed: tx.tx_response?.gas_used || '0',
        gasWanted: tx.tx_response?.gas_wanted || '0',
      }
    })
    
    return {
      success: true,
      data: formattedTxs,
    }
  } catch (error: any) {
    console.error('[API] Failed to get transactions:', error)
    
    // Return mock data
    const txTypes = ['Transfer', 'Delegate', 'Undelegate', 'BTC Stake', 'Vote']
    const now = Date.now()
    
    const mockTxs = Array.from({ length: limit }, (_, i) => ({
      hash: `TX${Date.now()}${i}HASH`.substring(0, 20) + '...',
      height: 1847293 - Math.floor(i / 3),
      type: txTypes[i % txTypes.length],
      from: `bbn1abc...${i}xyz`,
      fromFull: `bbn1abcdefghijk${i}xyz`,
      to: `bbn1def...${i}uvw`,
      toFull: `bbn1defghijklmn${i}uvw`,
      amount: `${(Math.random() * 1000).toFixed(2)} BBN`,
      denom: 'ubbn',
      status: Math.random() > 0.1 ? 'success' : 'failed',
      time: new Date(now - i * 30000).toISOString(),
      timeAgo: `${Math.floor(i / 2)}m ago`,
      gasUsed: String(Math.floor(Math.random() * 100000)),
      gasWanted: String(Math.floor(Math.random() * 150000)),
    }))
    
    return {
      success: true,
      data: mockTxs,
      mock: true,
    }
  }
})

function formatAmount(amount: string, denom: string): string {
  const value = parseInt(amount)
  if (denom === 'ubbn') {
    return `${(value / 1000000).toLocaleString('en-US', { maximumFractionDigits: 2 })} BBN`
  }
  return `${value.toLocaleString()} ${denom}`
}

