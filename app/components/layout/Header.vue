<script setup lang="ts">
interface NavItem {
  label: string
  to: string
  icon?: string
}

interface Props {
  showNav?: boolean
  transparent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showNav: true,
  transparent: false,
})

const { user, isAuthenticated, isDemo, logout } = useAuth()

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: 'mdi:view-dashboard' },
  { label: 'Addresses', to: '/address', icon: 'mdi:wallet' },
  { label: 'Smart Money', to: '/smart-money', icon: 'mdi:trending-up' },
  { label: 'Analytics', to: '/dashboard/analytics', icon: 'mdi:chart-bar' },
]

const isScrolled = ref(false)
const showUserMenu = ref(false)

onMounted(() => {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 20
  }
  window.addEventListener('scroll', handleScroll)
  onUnmounted(() => window.removeEventListener('scroll', handleScroll))
})

const headerClasses = computed(() => {
  if (props.transparent && !isScrolled.value) {
    return 'bg-transparent'
  }
  return 'bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50'
})

const handleLogout = async () => {
  showUserMenu.value = false
  await logout('/')
}

// Close menu when clicking outside
const closeMenu = () => {
  showUserMenu.value = false
}
</script>

<template>
  <header 
    :class="[
      'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
      headerClasses
    ]"
  >
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex-shrink-0">
          <CommonLogo size="md" />
        </NuxtLink>
        
        <!-- Navigation -->
        <nav v-if="showNav" class="hidden md:flex items-center gap-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-surface-800/50 transition-colors"
            active-class="!text-primary-400 bg-primary-500/10"
          >
            <Icon v-if="item.icon" :name="item.icon" class="w-4 h-4" />
            {{ item.label }}
          </NuxtLink>
        </nav>
        
        <!-- Right side actions -->
        <div class="flex items-center gap-3">
          <!-- Network indicator -->
          <div class="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800/50 border border-surface-700/50">
            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span class="text-xs text-slate-400 font-medium">Testnet</span>
          </div>
          
          <!-- User menu / Login button -->
          <slot name="actions">
            <!-- Logged in state -->
            <div v-if="isAuthenticated && user" class="relative">
              <button 
                class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-surface-800/50 border border-surface-700/50 hover:border-surface-600/50 transition-colors"
                @click="showUserMenu = !showUserMenu"
              >
                <div class="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <Icon name="mdi:account" class="w-4 h-4 text-primary-400" />
                </div>
                <span class="hidden sm:inline text-slate-300">{{ user.username }}</span>
                <UiBadge v-if="isDemo" variant="primary" size="sm" class="hidden sm:inline-flex">
                  Demo
                </UiBadge>
                <Icon name="mdi:chevron-down" class="w-4 h-4 text-slate-500" />
              </button>
              
              <!-- Dropdown menu -->
              <Transition
                enter-active-class="transition-all duration-150"
                enter-from-class="opacity-0 scale-95 -translate-y-1"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition-all duration-100"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
              >
                <div 
                  v-if="showUserMenu"
                  class="absolute right-0 mt-2 w-48 rounded-xl bg-surface-900 border border-surface-700/50 shadow-xl overflow-hidden"
                  @click.outside="closeMenu"
                >
                  <div class="p-3 border-b border-surface-700/50">
                    <p class="text-sm font-medium text-white">{{ user.username }}</p>
                    <p class="text-xs text-slate-500">{{ user.role === 'demo' ? 'Demo Account' : 'Admin' }}</p>
                  </div>
                  
                  <div class="p-1">
                    <NuxtLink 
                      to="/dashboard"
                      class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-surface-800/50 transition-colors"
                      @click="closeMenu"
                    >
                      <Icon name="mdi:view-dashboard" class="w-4 h-4" />
                      Dashboard
                    </NuxtLink>
                    <NuxtLink 
                      to="/settings"
                      class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-surface-800/50 transition-colors"
                      @click="closeMenu"
                    >
                      <Icon name="mdi:cog" class="w-4 h-4" />
                      Settings
                    </NuxtLink>
                  </div>
                  
                  <div class="p-1 border-t border-surface-700/50">
                    <button 
                      class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      @click="handleLogout"
                    >
                      <Icon name="mdi:logout" class="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
            
            <!-- Not logged in state -->
            <NuxtLink v-else to="/login">
              <UiButton variant="primary" size="sm">
                <Icon name="mdi:login" class="w-4 h-4" />
                <span class="hidden sm:inline">Sign In</span>
              </UiButton>
            </NuxtLink>
          </slot>
          
          <!-- Mobile menu button -->
          <button 
            class="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-800/50 transition-colors"
          >
            <Icon name="mdi:menu" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
