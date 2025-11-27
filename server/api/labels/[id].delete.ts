import { getDatabase, addressLabels } from '../../utils/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Label ID is required',
    })
  }
  
  try {
    const db = getDatabase()
    
    // Delete the label
    const result = await db
      .delete(addressLabels)
      .where(eq(addressLabels.id, parseInt(id)))
      .returning()
    
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Label not found',
      })
    }
    
    return {
      success: true,
      data: result[0],
    }
  } catch (error: any) {
    console.error('[API] Failed to delete label:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to delete label: ' + error.message,
    })
  }
})

