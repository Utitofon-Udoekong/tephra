<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const { user, isAuthenticated, logout, isDemo } = useAuth()

const handleLogout = async () => {
  await logout('/')
}

// Settings sections
const networkOptions = [
  { value: 'testnet', label: 'Testnet (bbn-test-6)', active: true },
  { value: 'mainnet', label: 'Mainnet (bbn-1)', active: false },
]

const selectedNetwork = ref('testnet')

// Theme options
const themes = [
  { value: 'dark', label: 'Dark', icon: 'mdi:weather-night' },
  { value: 'light', label: 'Light', icon: 'mdi:weather-sunny', disabled: true },
  { value: 'system', label: 'System', icon: 'mdi:laptop', disabled: true },
]

const selectedTheme = ref('dark')
</script>

<template>
  <div class="max-w-3xl">
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-white mb-2">Settings</h1>
      <p class="text-slate-400">Manage your preferences and account</p>
    </div>
    
    <!-- Account section -->
    <UiCard variant="default" padding="md" class="mb-6">
      <h2 class="text-lg font-semibold text-white mb-4">Account</h2>
      
      <div v-if="isAuthenticated && user" class="flex items-center justify-between p-4 rounded-xl bg-surface-800/50">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl bg-primary-500/20 flex items-center justify-center ring-2 ring-primary-500/30">
            <span class="text-xl font-bold text-primary-400 uppercase">
              {{ user.username.charAt(0) }}
            </span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-lg font-semibold text-white">{{ user.username }}</span>
              <UiBadge v-if="isDemo" variant="primary" size="sm">Demo</UiBadge>
            </div>
            <span class="text-sm text-slate-500">{{ user.role === 'demo' ? 'Demo Account' : 'Administrator' }}</span>
          </div>
        </div>
        
        <UiButton variant="outline" size="sm" @click="handleLogout">
          <Icon name="mdi:logout" class="w-4 h-4 mr-2" />
          Sign Out
        </UiButton>
      </div>
      
      <div v-else class="text-center py-8">
        <Icon name="mdi:account-off" class="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p class="text-slate-400 mb-4">Not signed in</p>
        <NuxtLink to="/login">
          <UiButton>Sign In</UiButton>
        </NuxtLink>
      </div>
    </UiCard>
    
    <!-- Network section -->
    <UiCard variant="default" padding="md" class="mb-6">
      <h2 class="text-lg font-semibold text-white mb-4">Network</h2>
      
      <div class="space-y-3">
        <button
          v-for="network in networkOptions"
          :key="network.value"
          :class="[
            'w-full flex items-center justify-between p-4 rounded-xl border transition-colors',
            selectedNetwork === network.value 
              ? 'border-primary-500/50 bg-primary-500/10' 
              : 'border-surface-700/50 hover:border-surface-600/50 hover:bg-surface-800/30'
          ]"
          @click="selectedNetwork = network.value"
        >
          <div class="flex items-center gap-3">
            <div 
              :class="[
                'w-3 h-3 rounded-full',
                network.active ? 'bg-green-400' : 'bg-slate-500'
              ]"
            />
            <span class="text-white">{{ network.label }}</span>
          </div>
          
          <div v-if="selectedNetwork === network.value">
            <Icon name="mdi:check-circle" class="w-5 h-5 text-primary-400" />
          </div>
          <UiBadge v-else-if="!network.active" variant="neutral" size="sm">
            Coming Soon
          </UiBadge>
        </button>
      </div>
    </UiCard>
    
    <!-- Appearance section -->
    <UiCard variant="default" padding="md" class="mb-6">
      <h2 class="text-lg font-semibold text-white mb-4">Appearance</h2>
      
      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="theme in themes"
          :key="theme.value"
          :disabled="theme.disabled"
          :class="[
            'flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors',
            theme.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            selectedTheme === theme.value && !theme.disabled
              ? 'border-primary-500/50 bg-primary-500/10' 
              : 'border-surface-700/50 hover:border-surface-600/50 hover:bg-surface-800/30'
          ]"
          @click="!theme.disabled && (selectedTheme = theme.value)"
        >
          <Icon :name="theme.icon" class="w-6 h-6 text-slate-400" />
          <span class="text-sm text-slate-300">{{ theme.label }}</span>
        </button>
      </div>
    </UiCard>
    
    <!-- Data & Privacy section -->
    <UiCard variant="default" padding="md" class="mb-6">
      <h2 class="text-lg font-semibold text-white mb-4">Data & Privacy</h2>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 rounded-xl bg-surface-800/30">
          <div>
            <p class="text-white font-medium">Clear Recent Searches</p>
            <p class="text-sm text-slate-500">Remove your search history</p>
          </div>
          <UiButton variant="outline" size="sm">
            Clear
          </UiButton>
        </div>
        
        <div class="flex items-center justify-between p-4 rounded-xl bg-surface-800/30">
          <div>
            <p class="text-white font-medium">Export Data</p>
            <p class="text-sm text-slate-500">Download your watched addresses and labels</p>
          </div>
          <UiButton variant="outline" size="sm">
            Export
          </UiButton>
        </div>
      </div>
    </UiCard>
    
    <!-- About section -->
    <UiCard variant="glass-primary" padding="md">
      <h2 class="text-lg font-semibold text-white mb-4">About Tephra</h2>
      
      <div class="space-y-3 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-slate-400">Version</span>
          <span class="text-white font-mono">1.0.0-hackathon</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-slate-400">Network</span>
          <span class="text-white">Babylon Genesis (Testnet)</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-slate-400">Chain ID</span>
          <span class="text-white font-mono">bbn-test-6</span>
        </div>
      </div>
      
      <div class="mt-6 pt-4 border-t border-primary-500/20">
        <p class="text-sm text-slate-400">
          Built for AWS Global Vibe: AI Coding Hackathon 2025
        </p>
        <p class="text-sm text-slate-500 mt-1">
          On-Chain Analytics Track • Sponsored by Babylon
        </p>
      </div>
    </UiCard>
  </div>
</template>

