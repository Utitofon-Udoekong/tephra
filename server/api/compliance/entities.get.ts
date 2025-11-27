import { getBabylonClient, shortenAddress } from '../../utils/babylon'
import { getDatabase, addressLabels } from '../../utils/db'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const client = getBabylonClient()
    const db = getDatabase()
    
    // Fetch finality providers as known entities
    const [providersResult, validators] = await Promise.all([
      client.getFinalityProviders().catch(() => ({ finality_providers: [] })),
      client.getValidators().catch(() => ({ validators: [] })),
    ])
    
    // Get label statistics from database
    const labelStatsRaw = await (db as any)
      .select({
        category: addressLabels.category,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(addressLabels)
      .groupBy(addressLabels.category)
    
    // Type assertion for count property
    const labelStats = labelStatsRaw.map((l: any) => ({
      category: l.category,
      count: Number(l.count || 0),
    }))
    
    // Format finality providers as entities
    const fpEntities = providersResult.finality_providers.slice(0, 10).map((fp: any) => ({
      name: fp.description?.moniker || 'Unknown Provider',
      type: 'Finality Provider',
      address: fp.addr,
      addressShort: shortenAddress(fp.addr),
      riskLevel: fp.jailed ? 'Suspended' : 'Verified',
      icon: 'mdi:server',
      iconColor: fp.jailed ? 'text-red-400' : 'text-green-400',
      website: fp.description?.website || '',
      active: !fp.jailed && fp.slashed_babylon_height === '0',
    }))
    
    // Format validators as entities
    const validatorEntities = validators.validators.slice(0, 5).map((v: any) => ({
      name: v.description?.moniker || 'Unknown Validator',
      type: 'Validator',
      address: v.operator_address,
      addressShort: shortenAddress(v.operator_address),
      riskLevel: v.jailed ? 'Jailed' : 'Verified',
      icon: 'mdi:shield-check',
      iconColor: v.jailed ? 'text-red-400' : 'text-purple-400',
      website: v.description?.website || '',
      active: !v.jailed,
    }))
    
    // Combine entities
    const entities = [...fpEntities, ...validatorEntities]
    
    // Calculate stats
    const totalLabeled = labelStats.reduce((sum: number, l: { category: string | null; count: number }) => sum + l.count, 0)
    const totalEntities = entities.length
    const activeEntities = entities.filter(e => e.active).length
    
    return {
      success: true,
      data: {
        entities,
        stats: {
          totalEntities,
          activeEntities,
          totalLabeled,
          labelsByCategory: Object.fromEntries(
            labelStats.map((l: { category: string | null; count: number }) => [l.category || 'unknown', l.count])
          ),
        },
      },
    }
  } catch (error: any) {
    console.error('[API] Failed to get entities:', error)
    
    return {
      success: true,
      data: {
        entities: [
          {
            name: 'Babylon Foundation',
            type: 'Foundation',
            address: 'bbn1foundation...',
            addressShort: 'bbn1fou...ion',
            riskLevel: 'Verified',
            icon: 'mdi:shield-check',
            iconColor: 'text-green-400',
            active: true,
          },
        ],
        stats: {
          totalEntities: 1,
          activeEntities: 1,
          totalLabeled: 0,
          labelsByCategory: {},
        },
      },
      mock: true,
    }
  }
})

