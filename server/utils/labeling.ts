import { getDatabase, addressLabels, addresses } from './db'
import { getBabylonClient } from './babylon'
import { eq } from 'drizzle-orm'

/**
 * Upsert a label for an address (insert or update if exists)
 */
async function upsertLabel(
  address: string,
  label: string,
  category: string,
  confidence: number,
  source: 'manual' | 'auto' | 'heuristic' | 'curated' | 'ml'
) {
  const db = getDatabase() as any
  
  // Check if this exact label already exists
  const existing = await db
    .select()
    .from(addressLabels)
    .where(eq(addressLabels.address, address))
    .limit(100)
  
  const duplicate = existing.find((l: any) => l.label === label && l.category === category)
  if (duplicate) {
    // Update confidence if higher
    if (confidence > (duplicate.confidence || 0)) {
      await db
        .update(addressLabels)
        .set({ confidence, updatedAt: new Date().toISOString() })
        .where(eq(addressLabels.id, duplicate.id))
    }
    return duplicate
  }
  
  // Ensure address exists in addresses table
  const addrExists = await db
    .select()
    .from(addresses)
    .where(eq(addresses.address, address))
    .limit(1)
  
  if (addrExists.length === 0) {
    await db.insert(addresses).values({
      address,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      txCount: 0,
    })
  }
  
  // Insert new label
  const result = await db.insert(addressLabels).values({
    address,
    label,
    category,
    confidence,
    source,
    createdAt: new Date().toISOString(),
  }).returning()
  
  return result[0]
}

/**
 * Auto-label validators
 */
export async function autoLabelValidators() {
  try {
    const client = getBabylonClient()
    const validators = await client.getValidators()
    
    let labeled = 0
    for (const val of validators.validators) {
      const moniker = val.description?.moniker || 'Unknown Validator'
      await upsertLabel(
        val.operator_address,
        moniker,
        'validator',
        0.95,
        'auto'
      )
      labeled++
    }
    
    console.log(`[Labeling] Auto-labeled ${labeled} validators`)
    return labeled
  } catch (error) {
    console.error('[Labeling] Failed to auto-label validators:', error)
    return 0
  }
}

/**
 * Auto-label finality providers
 */
export async function autoLabelFinalityProviders() {
  try {
    const client = getBabylonClient()
    const fps = await client.getFinalityProviders()
    
    let labeled = 0
    for (const fp of fps.finality_providers) {
      const moniker = fp.description?.moniker || 'Unknown FP'
      await upsertLabel(
        fp.addr,
        moniker,
        'smart-money', // Finality providers are smart money
        0.95,
        'auto'
      )
      labeled++
    }
    
    console.log(`[Labeling] Auto-labeled ${labeled} finality providers`)
    return labeled
  } catch (error) {
    console.error('[Labeling] Failed to auto-label finality providers:', error)
    return 0
  }
}

/**
 * Auto-label whales based on balance threshold
 */
export async function autoLabelWhales(threshold = 1_000_000) {
  try {
    const client = getBabylonClient()
    const db = getDatabase() as any
    
    // Get all addresses from database
    const allAddresses = await db.select().from(addresses)
    
    let labeled = 0
    for (const addr of allAddresses) {
      try {
        // Fetch current balance
        const balance = await client.getAccountBalance(addr.address)
        const bbnBalance = balance.balances.find((b: any) => b.denom === 'ubbn')
        
        if (bbnBalance) {
          const balanceValue = parseInt(bbnBalance.amount) / 1_000_000 // Convert to BBN
          
          if (balanceValue >= threshold) {
            await upsertLabel(
              addr.address,
              `Whale (${balanceValue.toFixed(0)} BBN)`,
              'whale',
              0.85,
              'heuristic'
            )
            labeled++
          }
        }
      } catch {
        // Skip addresses that fail
        continue
      }
    }
    
    console.log(`[Labeling] Auto-labeled ${labeled} whales`)
    return labeled
  } catch (error) {
    console.error('[Labeling] Failed to auto-label whales:', error)
    return 0
  }
}

/**
 * Auto-label an address when it's first analyzed (compliance check)
 */
export async function autoLabelOnAnalysis(address: string, analysis: any) {
  const labels: Array<{ label: string; category: string; confidence: number }> = []
  
  // Label validators
  if (analysis.isValidator) {
    labels.push({
      label: 'Validator',
      category: 'validator',
      confidence: 0.95,
    })
  }
  
  // Label finality providers
  if (analysis.isFinalityProvider) {
    labels.push({
      label: 'Finality Provider',
      category: 'smart-money',
      confidence: 0.95,
    })
  }
  
  // Label whales
  if (analysis.balanceLevel === 'whale') {
    labels.push({
      label: 'Whale',
      category: 'whale',
      confidence: 0.85,
    })
  }
  
  // Apply labels
  for (const label of labels) {
    await upsertLabel(address, label.label, label.category, label.confidence, 'heuristic')
  }
  
  return labels.length
}

/**
 * Run all auto-labeling tasks
 */
export async function runAutoLabeling() {
  console.log('[Labeling] Starting auto-labeling job...')
  
  const [validators, fps, whales] = await Promise.all([
    autoLabelValidators(),
    autoLabelFinalityProviders(),
    autoLabelWhales().catch(() => 0), // Whale detection is slower, don't fail on error
  ])
  
  console.log(`[Labeling] Auto-labeling complete: ${validators} validators, ${fps} FPs, ${whales} whales`)
  
  return { validators, fps, whales }
}

