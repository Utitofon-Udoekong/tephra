import { getDatabase, watchedAddresses } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { address, nickname, alertsEnabled = false } = body
  
  if (!address) {
    throw createError({
      statusCode: 400,
      message: 'Address is required',
    })
  }
  
  // Basic validation
  if (!address.startsWith('bbn1') && !address.startsWith('bbnvaloper1')) {
    throw createError({
      statusCode: 400,
      message: 'Invalid Babylon address format',
    })
  }
  
  try {
    const db = getDatabase()
    
    // Insert watched address
    const result = await db.insert(watchedAddresses).values({
      address,
      nickname: nickname || null,
      alertsEnabled,
      createdAt: new Date().toISOString(),
    }).returning()
    
    return {
      success: true,
      data: result[0],
    }
  } catch (error: any) {
    console.error('[API] Failed to add watched address:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to add watched address: ' + error.message,
    })
  }
})

