<script setup lang="ts">
// Dashboard layout with sidebar navigation

const { user, isAuthenticated, isDemo } = useAuth()

const sidebarCollapsed = ref(false)

const mainContentClass = computed(() => {
  return sidebarCollapsed.value ? 'ml-16' : 'ml-64'
})
</script>

<template>
  <div class="min-h-screen bg-surface-950">
    <!-- Background pattern -->
    <div class="fixed inset-0 bg-grid-pattern-dense opacity-50" />
    
    <!-- Header -->
    <LayoutHeader :show-nav="false">
      <template #actions>
        <div class="flex items-center gap-3">
          <!-- Demo mode banner -->
          <div v-if="isDemo" class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-500/10 border border-primary-500/20">
            <Icon name="mdi:test-tube" class="w-4 h-4 text-primary-400" />
            <span class="text-xs text-primary-400 font-medium">Demo Mode</span>
          </div>
          
          <!-- User menu -->
          <div v-if="isAuthenticated && user" class="relative">
            <NuxtLink 
              to="/settings"
              class="flex items-center gap-2 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-800/50 transition-colors"
            >
              <div class="w-7 h-7 rounded-full bg-primary-500/20 flex items-center justify-center ring-2 ring-primary-500/30">
                <span class="text-xs font-semibold text-primary-400 uppercase">
                  {{ user.username.charAt(0) }}
                </span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </template>
    </LayoutHeader>
    
    <!-- Sidebar -->
    <LayoutSidebar v-model:collapsed="sidebarCollapsed" />
    
    <!-- Main content -->
    <main 
      :class="[
        'relative pt-16 min-h-screen transition-all duration-300',
        mainContentClass
      ]"
    >
      <div class="p-6">
        <slot />
      </div>
    </main>
  </div>
</template>
