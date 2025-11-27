import { getDatabase, addressLabels, addresses } from '../../utils/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const { address, label, category, confidence = 1.0, source = 'manual' } = body
  
  if (!address || !label) {
    throw createError({
      statusCode: 400,
      message: 'Address and label are required',
    })
  }
  
  try {
    const db = getDatabase()
    
    // Ensure the address exists in addresses table
    const existingAddress = await db
      .select()
      .from(addresses)
      .where(eq(addresses.address, address))
      .limit(1)
    
    if (existingAddress.length === 0) {
      // Create address entry
      await db.insert(addresses).values({
        address,
        label: label,
        labelSource: source,
        labelConfidence: confidence,
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        txCount: 0,
      })
    }
    
    // Check if this exact label already exists for this address
    const existingLabel = await db
      .select()
      .from(addressLabels)
      .where(eq(addressLabels.address, address))
      .limit(100)
    
    const duplicateLabel = existingLabel.find(l => l.label === label)
    if (duplicateLabel) {
      return {
        success: true,
        data: duplicateLabel,
        message: 'Label already exists',
      }
    }
    
    // Insert the new label
    const result = await db.insert(addressLabels).values({
      address,
      label,
      category: category || 'custom',
      confidence,
      source,
      createdAt: new Date().toISOString(),
    }).returning()
    
    return {
      success: true,
      data: result[0],
    }
  } catch (error: any) {
    console.error('[API] Failed to add label:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to add label: ' + error.message,
    })
  }
})

