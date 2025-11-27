<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const router = useRouter()
const searchQuery = ref('')
const isSearching = ref(false)
const searchError = ref('')

// Recent searches (stored in localStorage)
const recentSearches = ref<string[]>([])

onMounted(() => {
  const stored = localStorage.getItem('tephra_recent_searches')
  if (stored) {
    recentSearches.value = JSON.parse(stored)
  }
})

const saveRecentSearch = (address: string) => {
  const searches = recentSearches.value.filter(s => s !== address)
  searches.unshift(address)
  recentSearches.value = searches.slice(0, 5)
  localStorage.setItem('tephra_recent_searches', JSON.stringify(recentSearches.value))
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  isSearching.value = true
  searchError.value = ''
  
  try {
    // Validate address format (basic check)
    const address = searchQuery.value.trim()
    if (!address.startsWith('bbn1') && !address.startsWith('bbnvaloper1')) {
      searchError.value = 'Invalid address format. Babylon addresses start with "bbn1" or "bbnvaloper1"'
      return
    }
    
    // Save to recent searches
    saveRecentSearch(address)
    
    // Navigate to address detail page
    router.push(`/address/${address}`)
  } finally {
    isSearching.value = false
  }
}

const clearRecentSearches = () => {
  recentSearches.value = []
  localStorage.removeItem('tephra_recent_searches')
}

// Sample labeled addresses for the directory
const labeledAddresses = ref([
  { address: 'bbn1exchange...hot', label: 'Exchange Hot Wallet', category: 'exchange', balance: '2.5M BBN' },
  { address: 'bbn1whale...abc', label: 'Whale #1', category: 'whale', balance: '1.8M BBN' },
  { address: 'bbn1validator...xyz', label: 'Babylon Labs', category: 'validator', balance: '1.2M BBN' },
  { address: 'bbn1smart...def', label: 'Smart Money Alpha', category: 'smart_money', balance: '890K BBN' },
  { address: 'bbn1defi...ghi', label: 'DeFi Protocol', category: 'protocol', balance: '750K BBN' },
  { address: 'bbn1bridge...jkl', label: 'Bridge Contract', category: 'bridge', balance: '500K BBN' },
])

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  exchange: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  whale: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  validator: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  smart_money: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  protocol: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  bridge: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-white mb-2">Address Explorer</h1>
      <p class="text-slate-400">Search and analyze Babylon Genesis addresses</p>
    </div>
    
    <!-- Search section -->
    <UiCard variant="glass" padding="lg" class="mb-8">
      <form @submit.prevent="handleSearch" class="space-y-4">
        <div class="relative">
          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
            <Icon name="mdi:magnify" class="w-5 h-5" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Enter address (bbn1... or bbnvaloper1...)"
            class="w-full pl-12 pr-4 py-4 rounded-xl bg-surface-800/50 border border-surface-600/50 text-white placeholder-slate-500 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
            :disabled="isSearching"
          />
          <button
            type="submit"
            class="absolute right-2 top-1/2 -translate-y-1/2"
            :disabled="isSearching || !searchQuery.trim()"
          >
            <UiButton :loading="isSearching" size="md">
              Search
            </UiButton>
          </button>
        </div>
        
        <!-- Error message -->
        <div v-if="searchError" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p class="text-sm text-red-400 flex items-center gap-2">
            <Icon name="mdi:alert-circle" class="w-4 h-4" />
            {{ searchError }}
          </p>
        </div>
      </form>
    </UiCard>
    
    <!-- Content grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Labeled Addresses Directory -->
        <UiCard variant="default" padding="none">
          <div class="p-6 border-b border-surface-700/50">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-white">Labeled Addresses</h2>
                <p class="text-sm text-slate-500">Known addresses with labels</p>
              </div>
              <UiBadge variant="primary" size="sm">
                {{ labeledAddresses.length }} addresses
              </UiBadge>
            </div>
          </div>
          
          <div class="divide-y divide-surface-700/50">
            <div
              v-for="addr in labeledAddresses"
              :key="addr.address"
              class="p-4 hover:bg-surface-800/30 transition-colors cursor-pointer"
              @click="router.push(`/address/${addr.address}`)"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <div 
                    :class="[
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      categoryColors[addr.category]?.bg || 'bg-slate-500/10'
                    ]"
                  >
                    <Icon 
                      :name="addr.category === 'exchange' ? 'mdi:bank' :
                             addr.category === 'whale' ? 'mdi:fish' :
                             addr.category === 'validator' ? 'mdi:server' :
                             addr.category === 'smart_money' ? 'mdi:brain' :
                             addr.category === 'protocol' ? 'mdi:code-braces' : 'mdi:bridge'"
                      :class="['w-5 h-5', categoryColors[addr.category]?.text || 'text-slate-400']"
                    />
                  </div>
                  <div>
                    <p class="text-white font-medium">{{ addr.label }}</p>
                    <code class="text-xs text-slate-500 font-mono">{{ addr.address }}</code>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-white font-medium">{{ addr.balance }}</p>
                  <UiBadge 
                    :class="[categoryColors[addr.category]?.bg, categoryColors[addr.category]?.text, categoryColors[addr.category]?.border]"
                    size="sm"
                  >
                    {{ addr.category.replace('_', ' ') }}
                  </UiBadge>
                </div>
              </div>
            </div>
          </div>
        </UiCard>
      </div>
      
      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Recent Searches -->
        <UiCard variant="default" padding="md">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-white">Recent Searches</h3>
            <button 
              v-if="recentSearches.length > 0"
              class="text-xs text-slate-500 hover:text-slate-400"
              @click="clearRecentSearches"
            >
              Clear
            </button>
          </div>
          
          <div v-if="recentSearches.length > 0" class="space-y-2">
            <button
              v-for="search in recentSearches"
              :key="search"
              class="w-full flex items-center gap-2 p-2 rounded-lg bg-surface-800/50 hover:bg-surface-700/50 transition-colors text-left"
              @click="router.push(`/address/${search}`)"
            >
              <Icon name="mdi:history" class="w-4 h-4 text-slate-500" />
              <code class="text-sm text-slate-300 font-mono truncate">{{ search }}</code>
            </button>
          </div>
          
          <div v-else class="text-center py-4">
            <Icon name="mdi:history" class="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p class="text-sm text-slate-500">No recent searches</p>
          </div>
        </UiCard>
        
        <!-- Address Categories -->
        <UiCard variant="default" padding="md">
          <h3 class="text-sm font-semibold text-white mb-4">Address Categories</h3>
          
          <div class="space-y-2">
            <div 
              v-for="(colors, category) in categoryColors" 
              :key="category"
              class="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-800/30 transition-colors cursor-pointer"
            >
              <div :class="['w-3 h-3 rounded-full', colors.bg.replace('/10', '')]" />
              <span class="text-sm text-slate-300 capitalize">{{ category.replace('_', ' ') }}</span>
            </div>
          </div>
        </UiCard>
        
        <!-- Quick Stats -->
        <UiCard variant="glass-primary" padding="md">
          <h3 class="text-sm font-semibold text-white mb-4">Quick Stats</h3>
          
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-400">Total Labeled</span>
              <span class="text-sm text-white font-medium">{{ labeledAddresses.length }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-400">Exchanges</span>
              <span class="text-sm text-white font-medium">{{ labeledAddresses.filter(a => a.category === 'exchange').length }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-400">Whales</span>
              <span class="text-sm text-white font-medium">{{ labeledAddresses.filter(a => a.category === 'whale').length }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-400">Validators</span>
              <span class="text-sm text-white font-medium">{{ labeledAddresses.filter(a => a.category === 'validator').length }}</span>
            </div>
          </div>
        </UiCard>
      </div>
    </div>
  </div>
</template>

