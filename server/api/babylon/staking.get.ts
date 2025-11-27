import { getBabylonClient, shortenAddress } from '../../utils/babylon'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const status = query.status as string || ''
  
  try {
    const client = getBabylonClient()
    const [delegations, epoch] = await Promise.all([
      client.getBTCDelegations(status),
      client.getCurrentEpoch(),
    ])
    
    const formattedDelegations = delegations.btc_delegations.map(d => ({
      stakingTxHash: d.staking_tx_hash,
      stakingTxHashShort: shortenAddress(d.staking_tx_hash, 10),
      stakerAddress: d.staker_addr,
      stakerAddressShort: shortenAddress(d.staker_addr),
      finalityProviders: d.fp_btc_pk_list,
      stakingValue: d.staking_value,
      stakingValueBTC: (parseInt(d.staking_value) / 100000000).toFixed(8),
      stakingTime: d.staking_time,
      unbondingTime: d.unbonding_time,
      status: d.state,
    }))
    
    return {
      success: true,
      data: {
        delegations: formattedDelegations,
        totalDelegations: formattedDelegations.length,
        currentEpoch: epoch.epoch,
      },
    }
  } catch (error: any) {
    console.error('[API] Failed to get BTC staking data:', error)
    
    // Return mock data
    const mockDelegations = Array.from({ length: 10 }, (_, i) => ({
      stakingTxHash: `btctx${i}hash...`,
      stakingTxHashShort: `btctx${i}...hash`,
      stakerAddress: `bbn1staker${i}address`,
      stakerAddressShort: `bbn1sta...${i}ss`,
      finalityProviders: [`fp${i}pk`],
      stakingValue: String((i + 1) * 10000000),
      stakingValueBTC: ((i + 1) * 0.1).toFixed(8),
      stakingTime: 21600,
      unbondingTime: 1008,
      status: i % 3 === 0 ? 'ACTIVE' : i % 3 === 1 ? 'UNBONDING' : 'UNBONDED',
    }))
    
    return {
      success: true,
      data: {
        delegations: mockDelegations,
        totalDelegations: mockDelegations.length,
        currentEpoch: {
          epoch_number: '100',
          current_epoch_interval: '3600',
          first_block_height: '1800000',
        },
      },
      mock: true,
    }
  }
})

