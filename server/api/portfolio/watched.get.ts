import { getDatabase, watchedAddresses } from '../../utils/db'
import { getBabylonClient, formatBBNAmount, shortenAddress } from '../../utils/babylon'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const db = getDatabase()
    const client = getBabylonClient()
    
    // Get watched addresses from database
    const addresses = await db
      .select()
      .from(watchedAddresses)
      .orderBy(desc(watchedAddresses.createdAt))
    
    // Fetch balances for each address
    const addressesWithBalances = await Promise.all(
      addresses.map(async (addr) => {
        try {
          const balance = await client.getAccountBalance(addr.address)
          const bbnBalance = balance.balances.find((b: any) => b.denom === 'ubbn')
          
          return {
            id: addr.id,
            address: addr.address,
            addressShort: shortenAddress(addr.address),
            nickname: addr.nickname || `Wallet ${addr.id}`,
            alertsEnabled: addr.alertsEnabled,
            createdAt: addr.createdAt,
            balance: bbnBalance ? formatBBNAmount(bbnBalance.amount) : '0.00',
            balanceRaw: bbnBalance?.amount || '0',
          }
        } catch {
          return {
            id: addr.id,
            address: addr.address,
            addressShort: shortenAddress(addr.address),
            nickname: addr.nickname || `Wallet ${addr.id}`,
            alertsEnabled: addr.alertsEnabled,
            createdAt: addr.createdAt,
            balance: '0.00',
            balanceRaw: '0',
          }
        }
      })
    )
    
    // Calculate total portfolio value
    const totalBalanceRaw = addressesWithBalances.reduce(
      (sum, addr) => sum + parseInt(addr.balanceRaw || '0'),
      0
    )
    
    return {
      success: true,
      data: {
        addresses: addressesWithBalances,
        totalAddresses: addressesWithBalances.length,
        totalBalance: formatBBNAmount(totalBalanceRaw.toString()),
        totalBalanceRaw: totalBalanceRaw.toString(),
      },
    }
  } catch (error: any) {
    console.error('[API] Failed to get watched addresses:', error)
    return {
      success: false,
      error: error.message,
      data: {
        addresses: [],
        totalAddresses: 0,
        totalBalance: '0.00',
        totalBalanceRaw: '0',
      },
    }
  }
})

