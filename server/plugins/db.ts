import { getDatabase, initializeTursoSchema } from '../utils/db'

export default defineNitroPlugin(async () => {
  // Initialize database on server start
  try {
    const db = getDatabase()
    
    // If using Turso, initialize schema asynchronously
    await initializeTursoSchema()
    
    console.log('[Plugin] Database initialized successfully')
  } catch (error) {
    console.error('[Plugin] Failed to initialize database:', error)
  }
})

