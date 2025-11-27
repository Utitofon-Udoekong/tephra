<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const { 
  networkStats, 
  transactions, 
  finalityProviders,
  isLoading, 
  isMock,
  fetchDashboardData,
  formattedBlockHeight,
  formattedTotalValidators,
  formattedBondedTokens,
} = useBlockchain()

// Fetch data on mount
onMounted(() => {
  fetchDashboardData()
})

// Auto-refresh every 30 seconds
const refreshInterval = ref<NodeJS.Timeout | null>(null)

onMounted(() => {
  refreshInterval.value = setInterval(() => {
    fetchDashboardData()
  }, 30000)
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})

// Computed stats
const stats = computed(() => {
  if (!networkStats.value) {
    return {
      blockHeight: '...',
      avgBlockTime: '6.0s',
      totalTxs: '...',
      activeAddresses: '...',
      tps: '...',
      validators: '...',
    }
  }
  
  return {
    blockHeight: formattedBlockHeight.value,
    avgBlockTime: '6.0s', // Babylon target block time
    totalTxs: networkStats.value.latestBlock.txCount.toLocaleString(),
    activeAddresses: formattedBondedTokens.value,
    tps: (networkStats.value.latestBlock.txCount / 6).toFixed(1),
    validators: formattedTotalValidators.value,
  }
})

// Top addresses (from finality providers for now)
const topAddresses = computed(() => {
  return finalityProviders.value.slice(0, 4).map(fp => ({
    address: fp.addressShort,
    addressFull: fp.address,
    label: 'Finality Provider',
    balance: `${fp.totalBondedBTC} BTC`,
    txCount: 0,
  }))
})

const formatNumber = (num: number) => {
  return new Intl.NumberFormat().format(num)
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white mb-2">Dashboard</h1>
        <p class="text-slate-400">Overview of Babylon Genesis network activity</p>
      </div>
      
      <!-- Mock data indicator -->
      <div v-if="isMock" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
        <Icon name="mdi:database-off" class="w-4 h-4 text-yellow-400" />
        <span class="text-xs text-yellow-400 font-medium">Demo Data</span>
      </div>
    </div>
    
    <!-- Network stats grid -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <!-- Block Height -->
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:cube-outline" class="w-6 h-6 text-primary-400 mx-auto mb-2" />
        <div class="text-xl font-bold text-white font-mono-nums">
          <UiSkeleton v-if="isLoading" variant="text" class="mx-auto w-20" />
          <span v-else>{{ stats.blockHeight }}</span>
        </div>
        <div class="text-xs text-slate-500">Block Height</div>
      </UiCard>
      
      <!-- Block Time -->
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:clock-outline" class="w-6 h-6 text-amber-400 mx-auto mb-2" />
        <div class="text-xl font-bold text-white font-mono-nums">
          {{ stats.avgBlockTime }}
        </div>
        <div class="text-xs text-slate-500">Avg Block Time</div>
      </UiCard>
      
      <!-- Transactions in Block -->
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:swap-horizontal" class="w-6 h-6 text-orange-400 mx-auto mb-2" />
        <div class="text-xl font-bold text-white font-mono-nums">
          <UiSkeleton v-if="isLoading" variant="text" class="mx-auto w-16" />
          <span v-else>{{ stats.totalTxs }}</span>
        </div>
        <div class="text-xs text-slate-500">Block Txs</div>
      </UiCard>
      
      <!-- Bonded Tokens -->
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:wallet" class="w-6 h-6 text-green-400 mx-auto mb-2" />
        <div class="text-xl font-bold text-white font-mono-nums">
          <UiSkeleton v-if="isLoading" variant="text" class="mx-auto w-16" />
          <span v-else>{{ stats.activeAddresses }}</span>
        </div>
        <div class="text-xs text-slate-500">Bonded BBN</div>
      </UiCard>
      
      <!-- TPS -->
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:speedometer" class="w-6 h-6 text-blue-400 mx-auto mb-2" />
        <div class="text-xl font-bold text-white font-mono-nums">
          <UiSkeleton v-if="isLoading" variant="text" class="mx-auto w-12" />
          <span v-else>{{ stats.tps }}</span>
        </div>
        <div class="text-xs text-slate-500">TPS</div>
      </UiCard>
      
      <!-- Validators -->
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:server" class="w-6 h-6 text-purple-400 mx-auto mb-2" />
        <div class="text-xl font-bold text-white font-mono-nums">
          <UiSkeleton v-if="isLoading" variant="text" class="mx-auto w-12" />
          <span v-else>{{ stats.validators }}</span>
        </div>
        <div class="text-xs text-slate-500">Validators</div>
      </UiCard>
    </div>
    
    <!-- Main content grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Transactions -->
      <div class="lg:col-span-2">
        <UiCard variant="default" padding="none">
          <div class="p-6 border-b border-surface-700/50">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-white">Recent Transactions</h2>
              <NuxtLink to="/transactions" class="text-sm text-primary-400 hover:text-primary-300">
                View all
              </NuxtLink>
            </div>
          </div>
          
          <!-- Loading state -->
          <div v-if="isLoading" class="divide-y divide-surface-700/50">
            <div v-for="i in 5" :key="i" class="p-4">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <UiSkeleton variant="custom" width="36px" height="36px" rounded="lg" />
                  <div>
                    <UiSkeleton variant="text" width="120px" class="mb-1" />
                    <UiSkeleton variant="text" width="60px" height="12px" />
                  </div>
                </div>
                <UiSkeleton variant="text" width="60px" />
              </div>
            </div>
          </div>
          
          <!-- Transactions list -->
          <div v-else class="divide-y divide-surface-700/50">
            <div
              v-for="tx in transactions.slice(0, 8)"
              :key="tx.hash"
              class="p-4 hover:bg-surface-800/30 transition-colors cursor-pointer"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-surface-700/50">
                    <Icon 
                      :name="tx.type === 'Transfer' ? 'mdi:arrow-right' : 
                             tx.type === 'Delegate' ? 'mdi:vote' :
                             tx.type === 'BTC Stake' ? 'mdi:bitcoin' : 
                             tx.type === 'Vote' ? 'mdi:vote' : 'mdi:swap-horizontal'"
                      class="w-4 h-4 text-slate-400"
                    />
                  </div>
                  <div>
                    <code class="text-sm text-white font-mono">{{ tx.hash }}</code>
                    <div class="text-xs text-slate-500">{{ tx.type }}</div>
                  </div>
                </div>
                <UiBadge 
                  :variant="tx.status === 'success' ? 'success' : 'error'"
                  dot
                  size="sm"
                >
                  {{ tx.status }}
                </UiBadge>
              </div>
              
              <div class="flex items-center justify-between text-sm">
                <div class="text-slate-400">
                  <span class="font-mono">{{ tx.from }}</span>
                  <Icon name="mdi:arrow-right" class="w-4 h-4 mx-2 inline" />
                  <span class="font-mono">{{ tx.to }}</span>
                </div>
                <div class="text-right">
                  <div class="text-white font-medium">{{ tx.amount }}</div>
                  <div class="text-xs text-slate-500">{{ tx.timeAgo }}</div>
                </div>
              </div>
            </div>
            
            <!-- Empty state -->
            <div v-if="transactions.length === 0" class="p-8 text-center">
              <CommonEmptyState 
                title="No transactions yet" 
                message="Transactions will appear here once the network is active."
                compact
              />
            </div>
          </div>
        </UiCard>
      </div>
      
      <!-- Right column -->
      <div class="space-y-6">
        <!-- Top Finality Providers -->
        <UiCard variant="default" padding="none">
          <div class="p-6 border-b border-surface-700/50">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-white">Finality Providers</h2>
              <NuxtLink to="/babylon/finality" class="text-sm text-primary-400 hover:text-primary-300">
                View all
              </NuxtLink>
            </div>
          </div>
          
          <!-- Loading state -->
          <div v-if="isLoading" class="divide-y divide-surface-700/50">
            <div v-for="i in 4" :key="i" class="p-4">
              <UiSkeleton variant="text" width="80%" class="mb-2" />
              <UiSkeleton variant="text" width="60%" height="12px" />
            </div>
          </div>
          
          <!-- Providers list -->
          <div v-else class="divide-y divide-surface-700/50">
            <div
              v-for="fp in finalityProviders.slice(0, 5)"
              :key="fp.btcPk"
              class="p-4 hover:bg-surface-800/30 transition-colors cursor-pointer"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <span class="text-xs font-semibold text-primary-400">
                      {{ fp.moniker.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <span class="text-sm text-white font-medium">{{ fp.moniker }}</span>
                </div>
                <UiBadge :variant="fp.active ? 'success' : 'neutral'" size="sm" dot>
                  {{ fp.active ? 'Active' : 'Inactive' }}
                </UiBadge>
              </div>
              <div class="flex items-center justify-between text-sm pl-10">
                <span class="text-slate-400">Bonded</span>
                <span class="text-white font-mono">{{ fp.totalBondedBTC }} BTC</span>
              </div>
              <div class="flex items-center justify-between text-sm pl-10">
                <span class="text-slate-400">Commission</span>
                <span class="text-slate-300">{{ fp.commissionPercent }}%</span>
              </div>
            </div>
            
            <!-- Empty state -->
            <div v-if="finalityProviders.length === 0" class="p-8 text-center">
              <CommonEmptyState 
                title="No providers yet" 
                message="Finality providers will appear here."
                compact
              />
            </div>
          </div>
        </UiCard>
        
        <!-- Quick Actions -->
        <UiCard variant="glass-primary" padding="md">
          <h3 class="text-sm font-semibold text-white mb-4">Quick Actions</h3>
          <div class="space-y-2">
            <NuxtLink to="/address" class="flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 hover:bg-surface-700/50 transition-colors">
              <Icon name="mdi:magnify" class="w-5 h-5 text-primary-400" />
              <span class="text-sm text-slate-300">Search Address</span>
            </NuxtLink>
            <NuxtLink to="/smart-money" class="flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 hover:bg-surface-700/50 transition-colors">
              <Icon name="mdi:trending-up" class="w-5 h-5 text-amber-400" />
              <span class="text-sm text-slate-300">Track Smart Money</span>
            </NuxtLink>
            <NuxtLink to="/babylon/staking" class="flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 hover:bg-surface-700/50 transition-colors">
              <Icon name="mdi:bitcoin" class="w-5 h-5 text-orange-400" />
              <span class="text-sm text-slate-300">BTC Staking</span>
            </NuxtLink>
          </div>
        </UiCard>
      </div>
    </div>
  </div>
</template>
