import { getDatabase, addressLabels, addresses } from '../../utils/db'
import { desc, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(parseInt(query.limit as string) || 50, 100)
  const category = query.category as string | undefined
  
  try {
    const db = getDatabase() as any
    
    // Get labels with optional category filter
    let labelsQuery = db
      .select({
        id: addressLabels.id,
        address: addressLabels.address,
        label: addressLabels.label,
        category: addressLabels.category,
        confidence: addressLabels.confidence,
        source: addressLabels.source,
        createdAt: addressLabels.createdAt,
      })
      .from(addressLabels)
      .orderBy(desc(addressLabels.createdAt))
      .limit(limit)
    
    const labels = await labelsQuery
    
    // Get unique categories for filter
    const categoriesResult = await (db as any)
      .selectDistinct({ category: addressLabels.category })
      .from(addressLabels)
    
    const categories = categoriesResult
      .map((c: { category: string | null }) => c.category)
      .filter(Boolean) as string[]
    
    return {
      success: true,
      data: {
        labels: category 
          ? labels.filter((l: any) => l.category === category)
          : labels,
        categories,
        total: labels.length,
      },
    }
  } catch (error: any) {
    console.error('[API] Failed to get labels:', error)
    return {
      success: false,
      error: error.message,
      data: { labels: [], categories: [], total: 0 },
    }
  }
})

