import { getDatabase, watchedAddresses } from '../../../utils/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID is required',
    })
  }
  
  try {
    const db = getDatabase()
    
    const result = await db
      .delete(watchedAddresses)
      .where(eq(watchedAddresses.id, parseInt(id)))
      .returning()
    
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Watched address not found',
      })
    }
    
    return {
      success: true,
      data: result[0],
    }
  } catch (error: any) {
    console.error('[API] Failed to remove watched address:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to remove watched address: ' + error.message,
    })
  }
})

