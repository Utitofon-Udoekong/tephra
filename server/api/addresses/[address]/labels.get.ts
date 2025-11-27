import { getDatabase, addressLabels } from '../../../utils/db'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const address = getRouterParam(event, 'address')
  
  if (!address) {
    throw createError({
      statusCode: 400,
      message: 'Address is required',
    })
  }
  
  try {
    const db = getDatabase() as any
    
    // Get all labels for this address
    const labels = await db
      .select({
        id: addressLabels.id,
        label: addressLabels.label,
        category: addressLabels.category,
        confidence: addressLabels.confidence,
        source: addressLabels.source,
        createdAt: addressLabels.createdAt,
      })
      .from(addressLabels)
      .where(eq(addressLabels.address, address))
      .orderBy(desc(addressLabels.createdAt))
    
    return {
      success: true,
      data: labels,
    }
  } catch (error: any) {
    console.error('[API] Failed to get address labels:', error)
    return {
      success: true,
      data: [],
    }
  }
})

