import { getBabylonClient, shortenAddress, formatBBNAmount } from '../../utils/babylon'
import { getDatabase, addressLabels, addresses } from '../../utils/db'
import { eq } from 'drizzle-orm'

interface RiskAnalysis {
  address: string
  addressShort: string
  riskScore: number
  riskLevel: string
  riskColor: { bg: string; text: string }
  lastChecked: string
  flags: Array<{ type: 'warning' | 'danger' | 'info'; message: string }>
  labels: string[]
  metrics: {
    balance: string
    balanceRaw: string
    accountType: string
    sequence: number
    accountNumber: string
  }
  analysis: {
    isValidator: boolean
    isFinalityProvider: boolean
    hasLabels: boolean
    balanceLevel: 'low' | 'medium' | 'high' | 'whale'
    activityLevel: 'new' | 'low' | 'medium' | 'high'
  }
}

function getRiskColor(score: number) {
  if (score >= 80) return { bg: 'bg-red-500', text: 'text-red-400' }
  if (score >= 50) return { bg: 'bg-yellow-500', text: 'text-yellow-400' }
  if (score >= 20) return { bg: 'bg-blue-500', text: 'text-blue-400' }
  return { bg: 'bg-green-500', text: 'text-green-400' }
}

function getRiskLevel(score: number) {
  if (score >= 80) return 'High Risk'
  if (score >= 50) return 'Medium Risk'
  if (score >= 20) return 'Low Risk'
  return 'Clean'
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { address } = body
  
  if (!address) {
    throw createError({
      statusCode: 400,
      message: 'Address is required',
    })
  }
  
  try {
    const client = getBabylonClient()
    const db = getDatabase()
    
    // Fetch address data from blockchain
    const [balanceResult, accountInfo, finalityProviders] = await Promise.all([
      client.getAccountBalance(address).catch(() => ({ balances: [] })),
      client.getAccountInfo(address).catch(() => null),
      client.getFinalityProviders().catch(() => ({ finality_providers: [] })),
    ])
    
    // Get labels from database
    const dbLabels = await db
      .select()
      .from(addressLabels)
      .where(eq(addressLabels.address, address))
    
    // Check if it's a finality provider
    const isFinalityProvider = finalityProviders.finality_providers.some(
      (fp: any) => fp.addr === address
    )
    
    // Check if it's a validator (has bbnvaloper prefix)
    const isValidator = address.startsWith('bbnvaloper')
    
    // Get BBN balance
    const bbnBalance = balanceResult.balances.find((b: any) => b.denom === 'ubbn')
    const balanceRaw = bbnBalance?.amount || '0'
    const balanceValue = parseInt(balanceRaw) / 1000000
    
    // Determine balance level
    let balanceLevel: 'low' | 'medium' | 'high' | 'whale' = 'low'
    if (balanceValue >= 1000000) balanceLevel = 'whale'
    else if (balanceValue >= 100000) balanceLevel = 'high'
    else if (balanceValue >= 1000) balanceLevel = 'medium'
    
    // Get sequence (tx count proxy)
    const sequence = parseInt(accountInfo?.account?.sequence || '0')
    
    // Determine activity level
    let activityLevel: 'new' | 'low' | 'medium' | 'high' = 'new'
    if (sequence >= 100) activityLevel = 'high'
    else if (sequence >= 20) activityLevel = 'medium'
    else if (sequence >= 1) activityLevel = 'low'
    
    // Calculate risk score
    let riskScore = 30 // Base score
    const flags: Array<{ type: 'warning' | 'danger' | 'info'; message: string }> = []
    
    // Lower risk for known entities
    if (isFinalityProvider) {
      riskScore -= 25
      flags.push({ type: 'info', message: 'Verified Finality Provider' })
    }
    
    if (isValidator) {
      riskScore -= 20
      flags.push({ type: 'info', message: 'Verified Validator Address' })
    }
    
    // Lower risk if has labels
    if (dbLabels.length > 0) {
      riskScore -= 10
      const labelCategories = dbLabels.map(l => l.category).filter(Boolean)
      if (labelCategories.includes('exchange')) {
        riskScore -= 5
        flags.push({ type: 'info', message: 'Labeled as Exchange' })
      }
      if (labelCategories.includes('foundation')) {
        riskScore -= 10
        flags.push({ type: 'info', message: 'Labeled as Foundation' })
      }
    }
    
    // Adjust based on balance
    if (balanceLevel === 'whale') {
      riskScore += 10 // Higher scrutiny for large balances
      flags.push({ type: 'warning', message: 'Whale-sized balance detected' })
    }
    
    // Adjust based on activity
    if (activityLevel === 'new') {
      riskScore += 15 // New accounts are higher risk
      flags.push({ type: 'warning', message: 'New or inactive account' })
    } else if (activityLevel === 'high') {
      riskScore += 5 // Very active might be bot
    }
    
    // Clamp score
    riskScore = Math.max(0, Math.min(100, riskScore))
    
    const result: RiskAnalysis = {
      address,
      addressShort: shortenAddress(address),
      riskScore,
      riskLevel: getRiskLevel(riskScore),
      riskColor: getRiskColor(riskScore),
      lastChecked: new Date().toISOString(),
      flags,
      labels: dbLabels.map(l => l.label),
      metrics: {
        balance: formatBBNAmount(balanceRaw),
        balanceRaw,
        accountType: accountInfo?.account?.['@type']?.split('.').pop() || 'Unknown',
        sequence,
        accountNumber: accountInfo?.account?.account_number || '0',
      },
      analysis: {
        isValidator,
        isFinalityProvider,
        hasLabels: dbLabels.length > 0,
        balanceLevel,
        activityLevel,
      },
    }
    
    return {
      success: true,
      data: result,
    }
  } catch (error: any) {
    console.error('[API] Failed to analyze address:', error)
    
    // Return a basic analysis with unknown status
    return {
      success: true,
      data: {
        address,
        addressShort: shortenAddress(address),
        riskScore: 50,
        riskLevel: 'Unknown',
        riskColor: getRiskColor(50),
        lastChecked: new Date().toISOString(),
        flags: [{ type: 'warning', message: 'Unable to fetch complete data' }],
        labels: [],
        metrics: {
          balance: '0.00',
          balanceRaw: '0',
          accountType: 'Unknown',
          sequence: 0,
          accountNumber: '0',
        },
        analysis: {
          isValidator: false,
          isFinalityProvider: false,
          hasLabels: false,
          balanceLevel: 'low',
          activityLevel: 'new',
        },
      },
      mock: true,
    }
  }
})

