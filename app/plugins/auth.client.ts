import { useAuthStore } from '~/stores/auth'

/**
 * Auth plugin - initializes authentication on app load
 * Auto-logs in demo user for hackathon judges
 */
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  // Initialize auth (checks session, auto-login if needed)
  await authStore.initialize()
})

