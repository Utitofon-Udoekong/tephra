import { defineStore } from 'pinia'

interface User {
  id: string
  username: string
  role: 'demo' | 'admin'
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  isInitialized: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isInitialized: false,
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
    isDemo: (state) => state.user?.role === 'demo',
    isAdmin: (state) => state.user?.role === 'admin',
    displayName: (state) => state.user?.username || 'Guest',
  },

  actions: {
    /**
     * Initialize auth state on app load
     * Checks for existing session and auto-logs in demo user if none exists
     */
    async initialize() {
      if (this.isInitialized) return
      
      this.isLoading = true
      this.error = null
      
      try {
        // Check for existing session
        const response = await $fetch('/api/auth/me')
        
        if (response.authenticated && response.user) {
          this.user = response.user
          this.isAuthenticated = true
        } else {
          // Auto-login as demo user for hackathon judges
          await this.autoLoginDemo()
        }
      } catch (error) {
        console.error('[Auth] Failed to initialize:', error)
        // On error, try auto-login
        await this.autoLoginDemo()
      } finally {
        this.isLoading = false
        this.isInitialized = true
      }
    },

    /**
     * Auto-login as demo user
     * This allows judges to explore without login friction
     */
    async autoLoginDemo() {
      try {
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: {
            username: 'demo',
            password: 'babylon2025',
          },
        })
        
        if (response.success && response.user) {
          this.user = response.user
          this.isAuthenticated = true
          console.log('[Auth] Auto-logged in as demo user')
        }
      } catch (error) {
        console.error('[Auth] Auto-login failed:', error)
        // Continue as guest - all routes are accessible anyway
        this.isAuthenticated = false
        this.user = null
      }
    },

    /**
     * Login with credentials
     */
    async login(username: string, password: string): Promise<boolean> {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: { username, password },
        })
        
        if (response.success && response.user) {
          this.user = response.user
          this.isAuthenticated = true
          return true
        }
        
        return false
      } catch (error: any) {
        this.error = error?.data?.message || 'Invalid username or password'
        return false
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Logout current user
     */
    async logout() {
      this.isLoading = true
      
      try {
        await $fetch('/api/auth/logout', { method: 'POST' })
      } catch (error) {
        console.error('[Auth] Logout error:', error)
      } finally {
        this.user = null
        this.isAuthenticated = false
        this.isLoading = false
      }
    },

    /**
     * Clear any error state
     */
    clearError() {
      this.error = null
    },
  },
})

