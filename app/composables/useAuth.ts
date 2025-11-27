import { useAuthStore } from '~/stores/auth'

/**
 * Composable for authentication functionality
 * Provides reactive access to auth state and actions
 */
export function useAuth() {
  const store = useAuthStore()
  const router = useRouter()
  
  // Computed properties
  const user = computed(() => store.user)
  const isAuthenticated = computed(() => store.isAuthenticated)
  const isLoading = computed(() => store.isLoading)
  const error = computed(() => store.error)
  const isDemo = computed(() => store.isDemo)
  const displayName = computed(() => store.displayName)
  
  /**
   * Initialize auth on app load
   */
  async function initialize() {
    await store.initialize()
  }
  
  /**
   * Login with credentials
   */
  async function login(username: string, password: string, redirectTo?: string) {
    const success = await store.login(username, password)
    
    if (success && redirectTo) {
      await router.push(redirectTo)
    }
    
    return success
  }
  
  /**
   * Logout and optionally redirect
   */
  async function logout(redirectTo?: string) {
    await store.logout()
    
    if (redirectTo) {
      await router.push(redirectTo)
    }
  }
  
  /**
   * Clear any auth errors
   */
  function clearError() {
    store.clearError()
  }
  
  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    isDemo,
    displayName,
    
    // Actions
    initialize,
    login,
    logout,
    clearError,
  }
}

