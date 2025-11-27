import { getDatabase } from '../utils/db'

export default defineNitroPlugin(() => {
  // Initialize database on server start
  try {
    const db = getDatabase()
    console.log('[Plugin] Database initialized successfully')
  } catch (error) {
    console.error('[Plugin] Failed to initialize database:', error)
  }
})

