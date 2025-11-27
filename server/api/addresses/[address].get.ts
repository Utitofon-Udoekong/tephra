import { getBabylonClient, shortenAddress, formatBBNAmount } from '../../utils/babylon'

export default defineEventHandler(async (event) => {
  const address = getRouterParam(event, 'address')
  
  if (!address) {
    throw createError({
      statusCode: 400,
      message: 'Address is required',
    })
  }
  
  try {
    const client = getBabylonClient()
    const [balance, accountInfo] = await Promise.all([
      client.getAccountBalance(address),
      client.getAccountInfo(address).catch(() => null),
    ])
    
    // Format balances
    const balances = balance.balances.map(b => ({
      denom: b.denom,
      amount: b.amount,
      formatted: b.denom === 'ubbn' 
        ? `${formatBBNAmount(b.amount)} BBN`
        : `${parseInt(b.amount).toLocaleString()} ${b.denom}`,
    }))
    
    // Calculate total value in BBN
    const bbnBalance = balance.balances.find(b => b.denom === 'ubbn')
    const totalBBN = bbnBalance ? formatBBNAmount(bbnBalance.amount) : '0.00'
    
    return {
      success: true,
      data: {
        address,
        addressShort: shortenAddress(address),
        balances,
        totalBBN,
        accountType: accountInfo?.account?.['@type']?.split('.').pop() || 'BaseAccount',
        accountNumber: accountInfo?.account?.account_number || '0',
        sequence: accountInfo?.account?.sequence || '0',
      },
    }
  } catch (error: any) {
    console.error('[API] Failed to get address info:', error)
    
    // Return mock data
    return {
      success: true,
      data: {
        address,
        addressShort: shortenAddress(address),
        balances: [
          { denom: 'ubbn', amount: '1000000000', formatted: '1,000.00 BBN' },
        ],
        totalBBN: '1,000.00',
        accountType: 'BaseAccount',
        accountNumber: '12345',
        sequence: '10',
      },
      mock: true,
    }
  }
})

