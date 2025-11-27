/**
 * Background job to auto-label addresses periodically
 * Runs on server startup and can be triggered manually
 */
export default defineNitroPlugin(async () => {
  // Run auto-labeling on server startup (after a delay to let DB initialize)
  setTimeout(async () => {
    try {
      const { runAutoLabeling } = await import('../utils/labeling')
      console.log('[Labeling] Running initial auto-labeling on startup...')
      await runAutoLabeling()
    } catch (error) {
      console.error('[Labeling] Failed to run initial auto-labeling:', error)
    }
  }, 5000) // Wait 5 seconds for DB to be ready
  
  // Optional: Run periodically (every 6 hours)
  // Uncomment for production:
  /*
  setInterval(async () => {
    try {
      const { runAutoLabeling } = await import('../utils/labeling')
      console.log('[Labeling] Running periodic auto-labeling...')
      await runAutoLabeling()
    } catch (error) {
      console.error('[Labeling] Failed to run periodic auto-labeling:', error)
    }
  }, 6 * 60 * 60 * 1000) // 6 hours
  */
})

