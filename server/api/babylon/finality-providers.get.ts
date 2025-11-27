import { getBabylonClient, shortenAddress } from '../../utils/babylon'

export default defineEventHandler(async (event) => {
  try {
    const client = getBabylonClient()
    const result = await client.getFinalityProviders()
    
    const formattedProviders = result.finality_providers.map(fp => ({
      btcPk: fp.btc_pk,
      btcPkShort: shortenAddress(fp.btc_pk, 12),
      address: fp.addr,
      addressShort: shortenAddress(fp.addr),
      moniker: fp.description?.moniker || 'Unknown',
      website: fp.description?.website || '',
      commission: fp.commission,
      commissionPercent: (parseFloat(fp.commission) * 100).toFixed(2),
      totalBondedSat: fp.total_bonded_sat,
      totalBondedBTC: (parseInt(fp.total_bonded_sat) / 100000000).toFixed(8),
      active: fp.active,
    }))
    
    // Sort by total bonded (descending)
    formattedProviders.sort((a, b) => 
      parseInt(b.totalBondedSat) - parseInt(a.totalBondedSat)
    )
    
    return {
      success: true,
      data: {
        providers: formattedProviders,
        totalProviders: formattedProviders.length,
        activeProviders: formattedProviders.filter(p => p.active).length,
      },
    }
  } catch (error: any) {
    console.error('[API] Failed to get finality providers:', error)
    
    // Return mock data
    const mockProviders = [
      { btcPk: 'fp1pk123...', btcPkShort: 'fp1pk...123', address: 'bbn1fp1addr', addressShort: 'bbn1fp...1', moniker: 'Babylon Labs', website: 'https://babylonlabs.io', commission: '0.05', commissionPercent: '5.00', totalBondedSat: '500000000000', totalBondedBTC: '5000.00000000', active: true },
      { btcPk: 'fp2pk456...', btcPkShort: 'fp2pk...456', address: 'bbn1fp2addr', addressShort: 'bbn1fp...2', moniker: 'Stake Capital', website: 'https://stake.capital', commission: '0.08', commissionPercent: '8.00', totalBondedSat: '350000000000', totalBondedBTC: '3500.00000000', active: true },
      { btcPk: 'fp3pk789...', btcPkShort: 'fp3pk...789', address: 'bbn1fp3addr', addressShort: 'bbn1fp...3', moniker: 'Chorus One', website: 'https://chorus.one', commission: '0.10', commissionPercent: '10.00', totalBondedSat: '280000000000', totalBondedBTC: '2800.00000000', active: true },
      { btcPk: 'fp4pk012...', btcPkShort: 'fp4pk...012', address: 'bbn1fp4addr', addressShort: 'bbn1fp...4', moniker: 'Figment', website: 'https://figment.io', commission: '0.07', commissionPercent: '7.00', totalBondedSat: '220000000000', totalBondedBTC: '2200.00000000', active: true },
      { btcPk: 'fp5pk345...', btcPkShort: 'fp5pk...345', address: 'bbn1fp5addr', addressShort: 'bbn1fp...5', moniker: 'Staked', website: 'https://staked.us', commission: '0.06', commissionPercent: '6.00', totalBondedSat: '180000000000', totalBondedBTC: '1800.00000000', active: false },
    ]
    
    return {
      success: true,
      data: {
        providers: mockProviders,
        totalProviders: mockProviders.length,
        activeProviders: mockProviders.filter(p => p.active).length,
      },
      mock: true,
    }
  }
})

