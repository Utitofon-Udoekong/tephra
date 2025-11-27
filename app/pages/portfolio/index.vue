<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const { user, isDemo } = useAuth()

// Mock portfolio data
const portfolio = ref({
  totalValue: '$12,458.92',
  totalValueChange: '+$1,234.56',
  totalValueChangePercent: '+11.0%',
  lastUpdated: '2 mins ago',
})

// Token holdings
const holdings = ref([
  {
    symbol: 'BBN',
    name: 'Babylon',
    icon: 'mdi:alpha-b-circle',
    iconColor: 'text-amber-400',
    balance: '5,234.56',
    value: '$7,851.84',
    price: '$1.50',
    change24h: '+12.5%',
    changePositive: true,
    allocation: 63,
  },
  {
    symbol: 'stBTC',
    name: 'Staked BTC',
    icon: 'mdi:bitcoin',
    iconColor: 'text-orange-400',
    balance: '0.0512',
    value: '$4,096.00',
    price: '$80,000',
    change24h: '+2.1%',
    changePositive: true,
    allocation: 33,
  },
  {
    symbol: 'ATOM',
    name: 'Cosmos',
    icon: 'mdi:atom',
    iconColor: 'text-purple-400',
    balance: '45.23',
    value: '$511.08',
    price: '$11.30',
    change24h: '-1.8%',
    changePositive: false,
    allocation: 4,
  },
])

// Staking positions
const stakingPositions = ref([
  {
    validator: 'Babylon Foundation',
    amount: '2,500 BBN',
    value: '$3,750.00',
    apr: '12.5%',
    rewards: '28.45 BBN',
    rewardsValue: '$42.68',
    status: 'Active',
  },
  {
    validator: 'StakeLab',
    amount: '1,000 BBN',
    value: '$1,500.00',
    apr: '11.8%',
    rewards: '12.34 BBN',
    rewardsValue: '$18.51',
    status: 'Active',
  },
])

// BTC staking positions
const btcStaking = ref([
  {
    provider: 'FP-1 (Alpha)',
    amount: '0.0512 BTC',
    value: '$4,096.00',
    stakingPeriod: '21,600 blocks',
    status: 'Active',
    rewards: 'Pending',
  },
])

// Recent activity
const recentActivity = ref([
  {
    type: 'Reward Claim',
    amount: '+28.45 BBN',
    value: '+$42.68',
    time: '2 hours ago',
    icon: 'mdi:gift',
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

// Watched addresses
const watchedAddresses = ref([
  {
    label: 'My Main Wallet',
    address: 'bbn1abc...xyz',
    addressFull: 'bbn1abcdefghijklmnopqrstuvwxyz',
    balance: '5,234.56 BBN',
    isPrimary: true,
  },
  {
    label: 'Trading Wallet',
    address: 'bbn1def...uvw',
    addressFull: 'bbn1defghijklmnopqrstuvw',
    balance: '1,200.00 BBN',
    isPrimary: false,
  },
])

const showAddWalletModal = ref(false)
const newWalletAddress = ref('')
const newWalletLabel = ref('')

const addWallet = () => {
  if (newWalletAddress.value && newWalletLabel.value) {
    watchedAddresses.value.push({
      label: newWalletLabel.value,
      address: newWalletAddress.value.substring(0, 10) + '...' + newWalletAddress.value.slice(-3),
      addressFull: newWalletAddress.value,
      balance: '0.00 BBN',
      isPrimary: false,
    })
    showAddWalletModal.value = false
    newWalletAddress.value = ''
    newWalletLabel.value = ''
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
              class="w-full h-full rounded-full"
              :style="{
                background: `conic-gradient(
                  #f59e0b 0% ${holdings[0].allocation}%, 
                  #f97316 ${holdings[0].allocation}% ${holdings[0].allocation + holdings[1].allocation}%, 
                  #a855f7 ${holdings[0].allocation + holdings[1].allocation}% 100%
                )`
              }"
            >
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
              <h2 class="text-lg font-semibold text-white">Watched Addresses</h2>
              <button 
                class="text-primary-400 hover:text-primary-300 text-sm"
                @click="showAddWalletModal = true"
              >
                + Add
              </button>
            </div>
          </div>
          
          <div class="divide-y divide-surface-700/50">
            <div
              v-for="addr in watchedAddresses"
              :key="addr.addressFull"
              class="p-4 hover:bg-surface-800/30 transition-colors cursor-pointer"
            >
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <span class="text-white font-medium">{{ addr.label }}</span>
                  <Icon v-if="addr.isPrimary" name="mdi:star" class="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <code class="text-xs text-slate-500 font-mono">{{ addr.address }}</code>
              <p class="text-sm text-slate-300 mt-1">{{ addr.balance }}</p>
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

