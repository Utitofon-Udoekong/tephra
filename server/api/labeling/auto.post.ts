import { runAutoLabeling } from '../../utils/labeling'

export default defineEventHandler(async (event) => {
  try {
    const result = await runAutoLabeling()
    
    return {
      success: true,
      data: result,
      message: `Auto-labeled ${result.validators + result.fps + result.whales} addresses`,
    }
  } catch (error: any) {
    console.error('[API] Failed to run auto-labeling:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to run auto-labeling: ' + error.message,
    })
  }
})

