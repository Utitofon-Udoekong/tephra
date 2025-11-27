<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const { user, isDemo } = useAuth()

// Portfolio data from API
const watchedAddresses = ref<any[]>([])
const loading = ref(true)
const totalBalance = ref('0.00')

const fetchPortfolio = async () => {
  loading.value = true
  try {
    const response = await $fetch<{ success: boolean; data: any }>('/api/portfolio/watched')
    if (response.success) {
      watchedAddresses.value = response.data.addresses
      totalBalance.value = response.data.totalBalance
    }
  } catch (e) {
    console.error('Failed to fetch portfolio:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPortfolio()
})

// Portfolio summary
const portfolio = computed(() => ({
  totalValue: `${totalBalance.value} BBN`,
  totalValueChange: 'Live',
  totalValueChangePercent: '',
  lastUpdated: 'now',
}))

// Token holdings from watched addresses (aggregate BBN)
const holdings = computed(() => {
  if (watchedAddresses.value.length === 0) return []
  
  return [{
    symbol: 'BBN',
    name: 'Babylon',
    icon: 'mdi:alpha-b-circle',
    iconColor: 'text-amber-400',
    balance: totalBalance.value,
    value: `${totalBalance.value} BBN`,
    price: 'Testnet',
    change24h: '-',
    changePositive: true,
    allocation: 100,
  }]
})

// Placeholder staking positions (would need real staking query)
const stakingPositions = ref<any[]>([])

// Placeholder BTC staking positions
const btcStaking = ref<any[]>([])

// Recent activity (placeholder)
const recentActivity = ref([
  {
    type: 'Wallet Added',
    amount: '-',
    value: '-',
    time: 'Recently',
    icon: 'mdi:wallet-plus',
    iconColor: 'text-green-400',
  },
  {
    type: 'Delegate',
    amount: '1,000 BBN',
    value: '$1,500.00',
    time: '1 day ago',
    icon: 'mdi:vote',
    iconColor: 'text-blue-400',
  },
  {
    type: 'BTC Stake',
    amount: '0.0512 BTC',
    value: '$4,096.00',
    time: '3 days ago',
    icon: 'mdi:bitcoin',
    iconColor: 'text-orange-400',
  },
  {
    type: 'Transfer In',
    amount: '+2,000 BBN',
    value: '+$3,000.00',
    time: '5 days ago',
    icon: 'mdi:arrow-down',
    iconColor: 'text-green-400',
  },
])

// Add wallet modal
const showAddWalletModal = ref(false)
const newWalletAddress = ref('')
const newWalletNickname = ref('')
const addingWallet = ref(false)
const newWalletLabel = ref('')

const addWallet = async () => {
  if (!newWalletAddress.value) return
  
  // Validate address format
  if (!newWalletAddress.value.startsWith('bbn1') && !newWalletAddress.value.startsWith('bbnvaloper1')) {
    alert('Invalid Babylon address format. Must start with bbn1 or bbnvaloper1')
    return
  }
  
  addingWallet.value = true
  try {
    const response = await $fetch<{ success: boolean; data: any }>('/api/portfolio/watched', {
      method: 'POST',
      body: {
        address: newWalletAddress.value,
        nickname: newWalletLabel.value || null,
      },
    })
    
    if (response.success) {
      // Refresh portfolio data
      await fetchPortfolio()
      showAddWalletModal.value = false
      newWalletAddress.value = ''
      newWalletLabel.value = ''
    }
  } catch (e) {
    console.error('Failed to add wallet:', e)
    alert('Failed to add wallet')
  } finally {
    addingWallet.value = false
  }
}

const removeWallet = async (id: number) => {
  try {
    await $fetch(`/api/portfolio/watched/${id}`, { method: 'DELETE' })
    await fetchPortfolio()
  } catch (e) {
    console.error('Failed to remove wallet:', e)
  }
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white mb-2">Portfolio</h1>
        <p class="text-slate-400">Track your holdings and staking positions</p>
      </div>
      
      <div class="flex items-center gap-3">
        <div v-if="isDemo" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <Icon name="mdi:database-off" class="w-4 h-4 text-yellow-400" />
          <span class="text-xs text-yellow-400 font-medium">Demo Data</span>
        </div>
        
        <UiButton variant="primary" size="sm" @click="showAddWalletModal = true">
          <Icon name="mdi:plus" class="w-4 h-4 mr-2" />
          Add Wallet
        </UiButton>
      </div>
    </div>
    
    <!-- Portfolio overview -->
    <UiCard variant="glass-primary" padding="lg" class="mb-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <p class="text-sm text-slate-400 mb-1">Total Portfolio Value</p>
          <div class="flex items-baseline gap-3">
            <span class="text-4xl font-bold text-white">{{ portfolio.totalValue }}</span>
            <span class="text-lg text-green-400 font-medium">{{ portfolio.totalValueChangePercent }}</span>
          </div>
          <p class="text-sm text-slate-500 mt-1">
            {{ portfolio.totalValueChange }} today • Updated {{ portfolio.lastUpdated }}
          </p>
        </div>
        
        <!-- Allocation pie visualization -->
        <div class="flex items-center gap-4">
          <div class="relative w-32 h-32">
            <!-- Simple pie chart using conic-gradient -->
            <div 
              v-if="holdings.length >= 2"
              class="w-full h-full rounded-full"
              :style="{
                background: `conic-gradient(
                  #f59e0b 0% ${holdings[0]?.allocation || 0}%, 
                  #f97316 ${holdings[0]?.allocation || 0}% ${(holdings[0]?.allocation || 0) + (holdings[1]?.allocation || 0)}%, 
                  #a855f7 ${(holdings[0]?.allocation || 0) + (holdings[1]?.allocation || 0)}% 100%
                )`
              }"
            >
              <div class="absolute inset-3 rounded-full bg-surface-900 flex items-center justify-center">
                <Icon name="mdi:wallet" class="w-8 h-8 text-primary-400" />
              </div>
            </div>
            <div v-else class="w-full h-full rounded-full bg-surface-800 flex items-center justify-center">
              <Icon name="mdi:wallet" class="w-8 h-8 text-primary-400" />
            </div>
              <div class="absolute inset-3 rounded-full bg-surface-900 flex items-center justify-center">
                <Icon name="mdi:wallet" class="w-8 h-8 text-primary-400" />
              </div>
            </div>
          </div>
          
          <div class="space-y-2">
            <div v-for="holding in holdings" :key="holding.symbol" class="flex items-center gap-2 text-sm">
              <div 
                :class="[
                  'w-3 h-3 rounded-full',
                  holding.symbol === 'BBN' ? 'bg-amber-500' :
                  holding.symbol === 'stBTC' ? 'bg-orange-500' : 'bg-purple-500'
                ]"
              />
              <span class="text-slate-300">{{ holding.symbol }}</span>
              <span class="text-slate-500">{{ holding.allocation }}%</span>
            </div>
          </div>
        </div>
      </div>
    </UiCard>
    
    <!-- Main content grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Holdings (2/3 width) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Token Holdings -->
        <UiCard variant="default" padding="none">
          <div class="p-6 border-b border-surface-700/50">
            <h2 class="text-lg font-semibold text-white">Token Holdings</h2>
          </div>
          
          <div class="divide-y divide-surface-700/50">
            <div
              v-for="holding in holdings"
              :key="holding.symbol"
              class="p-4 hover:bg-surface-800/30 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-xl bg-surface-700/50">
                    <Icon :name="holding.icon" :class="['w-6 h-6', holding.iconColor]" />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-white font-semibold">{{ holding.symbol }}</span>
                      <span class="text-sm text-slate-500">{{ holding.name }}</span>
                    </div>
                    <p class="text-sm text-slate-400">{{ holding.balance }} {{ holding.symbol }}</p>
                  </div>
                </div>
                
                <div class="text-right">
                  <p class="text-white font-semibold">{{ holding.value }}</p>
                  <p 
                    :class="[
                      'text-sm',
                      holding.changePositive ? 'text-green-400' : 'text-red-400'
                    ]"
                  >
                    {{ holding.change24h }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </UiCard>
        
        <!-- Staking Positions -->
        <UiCard variant="default" padding="none">
          <div class="p-6 border-b border-surface-700/50">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-white">BBN Staking</h2>
              <UiBadge variant="success" size="sm">{{ stakingPositions.length }} Active</UiBadge>
            </div>
          </div>
          
          <div class="divide-y divide-surface-700/50">
            <div
              v-for="position in stakingPositions"
              :key="position.validator"
              class="p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <Icon name="mdi:check-decagram" class="w-5 h-5 text-green-400" />
                  <span class="text-white font-medium">{{ position.validator }}</span>
                </div>
                <UiBadge variant="success" size="sm">{{ position.status }}</UiBadge>
              </div>
              
              <div class="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span class="text-slate-500">Staked</span>
                  <p class="text-white">{{ position.amount }}</p>
                </div>
                <div>
                  <span class="text-slate-500">Value</span>
                  <p class="text-white">{{ position.value }}</p>
                </div>
                <div>
                  <span class="text-slate-500">APR</span>
                  <p class="text-green-400">{{ position.apr }}</p>
                </div>
                <div>
                  <span class="text-slate-500">Rewards</span>
                  <p class="text-amber-400">{{ position.rewards }}</p>
                </div>
              </div>
            </div>
          </div>
        </UiCard>
        
        <!-- BTC Staking -->
        <UiCard variant="default" padding="none">
          <div class="p-6 border-b border-surface-700/50">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Icon name="mdi:bitcoin" class="w-5 h-5 text-orange-400" />
                <h2 class="text-lg font-semibold text-white">BTC Staking</h2>
              </div>
              <UiBadge variant="primary" size="sm">Babylon Native</UiBadge>
            </div>
          </div>
          
          <div class="divide-y divide-surface-700/50">
            <div
              v-for="position in btcStaking"
              :key="position.provider"
              class="p-4"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="text-white font-medium">{{ position.provider }}</span>
                </div>
                <UiBadge variant="success" size="sm">{{ position.status }}</UiBadge>
              </div>
              
              <div class="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span class="text-slate-500">Staked</span>
                  <p class="text-orange-400 font-medium">{{ position.amount }}</p>
                </div>
                <div>
                  <span class="text-slate-500">Value</span>
                  <p class="text-white">{{ position.value }}</p>
                </div>
                <div>
                  <span class="text-slate-500">Period</span>
                  <p class="text-white">{{ position.stakingPeriod }}</p>
                </div>
              </div>
            </div>
          </div>
        </UiCard>
      </div>
      
      <!-- Sidebar (1/3 width) -->
      <div class="space-y-6">
        <!-- Watched Addresses -->
        <UiCard variant="default" padding="none">
          <div class="p-6 border-b border-surface-700/50">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-semibold text-white">Watched Addresses</h2>
                <button 
                  class="p-1 rounded hover:bg-surface-700/50 transition-colors"
                  @click="fetchPortfolio"
                  :disabled="loading"
                >
                  <Icon name="mdi:refresh" :class="['w-4 h-4 text-slate-400', loading && 'animate-spin']" />
                </button>
              </div>
              <button 
                class="text-primary-400 hover:text-primary-300 text-sm"
                @click="showAddWalletModal = true"
              >
                + Add
              </button>
            </div>
          </div>
          
          <!-- Loading state -->
          <div v-if="loading" class="p-4">
            <div v-for="i in 2" :key="i" class="flex items-center gap-3 mb-4">
              <UiSkeleton variant="custom" width="100%" height="60px" rounded="lg" />
            </div>
          </div>
          
          <!-- Empty state -->
          <div v-else-if="watchedAddresses.length === 0" class="p-6 text-center">
            <Icon name="mdi:wallet-outline" class="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p class="text-slate-500 mb-2">No watched addresses</p>
            <button 
              class="text-primary-400 hover:text-primary-300 text-sm"
              @click="showAddWalletModal = true"
            >
              Add your first wallet
            </button>
          </div>
          
          <div v-else class="divide-y divide-surface-700/50">
            <div
              v-for="addr in watchedAddresses"
              :key="addr.id"
              class="p-4 hover:bg-surface-800/30 transition-colors group"
            >
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <span class="text-white font-medium">{{ addr.nickname }}</span>
                </div>
                <button 
                  class="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 transition-all"
                  @click.stop="removeWallet(addr.id)"
                  title="Remove wallet"
                >
                  <Icon name="mdi:close" class="w-4 h-4 text-red-400" />
                </button>
              </div>
              <code class="text-xs text-slate-500 font-mono">{{ addr.addressShort }}</code>
              <p class="text-sm text-primary-400 mt-1 font-medium">{{ addr.balance }} BBN</p>
            </div>
          </div>
        </UiCard>
        
        <!-- Recent Activity -->
        <UiCard variant="default" padding="none">
          <div class="p-6 border-b border-surface-700/50">
            <h2 class="text-lg font-semibold text-white">Recent Activity</h2>
          </div>
          
          <div class="divide-y divide-surface-700/50">
            <div
              v-for="activity in recentActivity"
              :key="activity.type + activity.time"
              class="p-4"
            >
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-surface-700/50">
                  <Icon :name="activity.icon" :class="['w-4 h-4', activity.iconColor]" />
                </div>
                <div class="flex-1">
                  <p class="text-sm text-white">{{ activity.type }}</p>
                  <p class="text-xs text-slate-500">{{ activity.time }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-white">{{ activity.amount }}</p>
                  <p class="text-xs text-slate-400">{{ activity.value }}</p>
                </div>
              </div>
            </div>
          </div>
        </UiCard>
        
        <!-- Quick Actions -->
        <UiCard variant="glass-primary" padding="md">
          <h3 class="text-white font-semibold mb-4">Quick Actions</h3>
          <div class="space-y-2">
            <NuxtLink to="/babylon/staking">
              <UiButton variant="outline" size="sm" full-width>
                <Icon name="mdi:bitcoin" class="w-4 h-4 mr-2" />
                Stake BTC
              </UiButton>
            </NuxtLink>
            <UiButton variant="outline" size="sm" full-width>
              <Icon name="mdi:gift" class="w-4 h-4 mr-2" />
              Claim Rewards
            </UiButton>
          </div>
        </UiCard>
      </div>
    </div>
    
    <!-- Add Wallet Modal -->
    <UiModal v-model:open="showAddWalletModal" title="Add Wallet">
      <div class="space-y-4">
        <div>
          <label class="block text-sm text-slate-400 mb-2">Label</label>
          <UiInput 
            v-model="newWalletLabel" 
            placeholder="e.g., Trading Wallet"
          />
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-2">Address</label>
          <UiInput 
            v-model="newWalletAddress" 
            placeholder="bbn1..."
          />
        </div>
        <div class="flex gap-3 pt-4">
          <UiButton variant="outline" @click="showAddWalletModal = false">
            Cancel
          </UiButton>
          <UiButton variant="primary" @click="addWallet">
            Add Wallet
          </UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>

