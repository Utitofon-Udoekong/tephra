<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const router = useRouter()
const { finalityProviders, transactions, fetchFinalityProviders, fetchTransactions, isLoading, isMock } = useBlockchain()

// Fetch data on mount
onMounted(async () => {
  await fetchFinalityProviders()
  await fetchTransactions(20)
})

// Transform finality providers into "smart money" format
const smartMoneyWallets = computed(() => {
  return finalityProviders.value.map((fp: any, index: number) => ({
    address: fp.addressShort,
    addressFull: fp.address,
    label: fp.moniker || 'Unknown Provider',
    btcPk: fp.btcPkShort,
    commission: fp.commissionPercent,
    bondedBTC: fp.totalBondedBTC,
    active: fp.active,
    website: fp.website,
    jailed: fp.jailed,
    highestVotedHeight: fp.highestVotedHeight,
    // For "smart money" display
    pnl: fp.active ? 'Active' : 'Inactive',
    pnlPercent: fp.active ? '+100%' : '0%',
    winRate: `${fp.commissionPercent}%`,
    trades: fp.highestVotedHeight || 0,
    avgHoldTime: 'N/A',
    lastActive: 'Recently',
    tags: [
      fp.active ? 'Active' : 'Inactive',
      'Finality Provider',
      index < 5 ? 'Top Provider' : '',
    ].filter(Boolean),
    trending: fp.active && index < 5,
  }))
})

// Recent whale movements from transactions
const whaleMovements = computed(() => {
  return transactions.value.slice(0, 5).map((tx: any) => ({
    address: tx.from || tx.to || 'Unknown',
    type: tx.type,
    amount: tx.amount || '-',
    value: 'N/A', // Not directly available from API
    time: tx.timeAgo,
    impact: tx.type === 'BTC Stake' || tx.type === 'Delegate' ? 'high' : 'medium',
    status: tx.status,
  }))
})

// Trading signals
const tradingSignals = ref([
  {
    signal: 'Strong Buy',
    confidence: 85,
    reason: 'Multiple whales accumulating',
    asset: 'BBN',
    time: '10 mins ago',
  },
  {
    signal: 'Hold',
    confidence: 72,
    reason: 'Consolidation phase detected',
    asset: 'stBTC',
    time: '30 mins ago',
  },
  {
    signal: 'Watch',
    confidence: 68,
    reason: 'Unusual activity from smart money',
    asset: 'BBN/BTC',
    time: '1 hour ago',
  },
])

const impactColors = {
  high: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  low: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
}

const signalColors = {
  'Strong Buy': { bg: 'bg-green-500/10', text: 'text-green-400' },
  'Buy': { bg: 'bg-green-500/10', text: 'text-green-400' },
  'Hold': { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  'Watch': { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  'Sell': { bg: 'bg-red-500/10', text: 'text-red-400' },
}

</script>

<template>
  <div>
    <!-- Page header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <h1 class="text-2xl font-bold text-white">Smart Money Tracking</h1>
          <UiBadge variant="primary" size="sm">
            <Icon name="mdi:server" class="w-3 h-3 mr-1" />
            Finality Providers
          </UiBadge>
          <div v-if="isMock" class="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <Icon name="mdi:database-off" class="w-3 h-3 text-yellow-400" />
            <span class="text-xs text-yellow-400">Demo</span>
          </div>
        </div>
        <p class="text-slate-400">Track Babylon finality providers and network activity</p>
      </div>
      
      <UiButton variant="outline" size="sm" @click="fetchFinalityProviders" :loading="isLoading">
        <Icon name="mdi:refresh" class="w-4 h-4 mr-2" />
        Refresh
      </UiButton>
    </div>
    
    <!-- Stats overview -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:server" class="w-6 h-6 text-primary-400 mx-auto mb-2" />
        <div class="text-2xl font-bold text-white">
          <UiSkeleton v-if="isLoading" variant="text" width="40px" class="mx-auto" />
          <span v-else>{{ smartMoneyWallets.length }}</span>
        </div>
        <div class="text-xs text-slate-500">Finality Providers</div>
      </UiCard>
      
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:check-circle" class="w-6 h-6 text-green-400 mx-auto mb-2" />
        <div class="text-2xl font-bold text-white">
          <UiSkeleton v-if="isLoading" variant="text" width="40px" class="mx-auto" />
          <span v-else>{{ smartMoneyWallets.filter(w => w.active).length }}</span>
        </div>
        <div class="text-xs text-slate-500">Active Providers</div>
      </UiCard>
      
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:chart-line" class="w-6 h-6 text-amber-400 mx-auto mb-2" />
        <div class="text-2xl font-bold text-white">
          <UiSkeleton v-if="isLoading" variant="text" width="40px" class="mx-auto" />
          <span v-else>{{ transactions.length }}</span>
        </div>
        <div class="text-xs text-slate-500">Recent Transactions</div>
      </UiCard>
      
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:alert-circle" class="w-6 h-6 text-blue-400 mx-auto mb-2" />
        <div class="text-2xl font-bold text-white">{{ whaleMovements.length }}</div>
        <div class="text-xs text-slate-500">Recent Movements</div>
      </UiCard>
    </div>
    
    <!-- Main content grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Smart Money Leaderboard -->
      <div class="lg:col-span-2">
        <UiCard variant="default" padding="none">
          <div class="p-6 border-b border-surface-700/50">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-white">Smart Money Leaderboard</h2>
              <div class="flex items-center gap-2">
                <UiBadge variant="success" size="sm" dot pulse>
                  Live
                </UiBadge>
              </div>
            </div>
          </div>
          
          <div class="divide-y divide-surface-700/50">
            <div
              v-for="(wallet, index) in smartMoneyWallets"
              :key="wallet.address"
              class="p-4 hover:bg-surface-800/30 transition-colors cursor-pointer"
              @click="router.push(`/address/${wallet.addressFull}`)"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <!-- Rank -->
                  <div 
                    :class="[
                      'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm',
                      index === 0 ? 'bg-amber-500/20 text-amber-400' :
                      index === 1 ? 'bg-slate-400/20 text-slate-300' :
                      index === 2 ? 'bg-orange-600/20 text-orange-400' :
                      'bg-surface-700/50 text-slate-500'
                    ]"
                  >
                    {{ index + 1 }}
                  </div>
                  
                  <!-- Wallet info -->
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-white font-medium">{{ wallet.label }}</span>
                      <Icon v-if="wallet.trending" name="mdi:fire" class="w-4 h-4 text-orange-400" />
                    </div>
                    <code class="text-xs text-slate-500 font-mono">{{ wallet.address }}</code>
                  </div>
                </div>
                
                <!-- PnL -->
                <div class="text-right">
                  <div class="text-green-400 font-bold">{{ wallet.pnl }}</div>
                  <div class="text-xs text-green-400/70">{{ wallet.pnlPercent }}</div>
                </div>
              </div>
              
              <!-- Stats row -->
              <div class="flex items-center justify-between text-sm pl-11">
                <div class="flex items-center gap-4">
                  <span class="text-slate-400">
                    Commission: <span class="text-white">{{ wallet.commission }}%</span>
                  </span>
                  <span class="text-slate-400">
                    Votes: <span class="text-white">{{ wallet.trades?.toLocaleString() || '0' }}</span>
                  </span>
                  <span v-if="wallet.website" class="text-slate-400">
                    <a :href="wallet.website" target="_blank" class="text-primary-400 hover:underline">
                      Website
                    </a>
                  </span>
                </div>
                <span class="text-xs text-slate-500">{{ wallet.lastActive }}</span>
              </div>
              
              <!-- Tags -->
              <div class="flex items-center gap-2 mt-2 pl-11">
                <UiBadge 
                  v-for="tag in wallet.tags" 
                  :key="tag"
                  variant="neutral"
                  size="sm"
                >
                  {{ tag }}
                </UiBadge>
              </div>
            </div>
          </div>
        </UiCard>
      </div>
      
      <!-- Right sidebar -->
      <div class="space-y-6">
        <!-- Whale Movements -->
        <UiCard variant="default" padding="none">
          <div class="p-6 border-b border-surface-700/50">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-white">Whale Movements</h2>
              <Icon name="mdi:whale" class="w-5 h-5 text-blue-400" />
            </div>
          </div>
          
          <div class="divide-y divide-surface-700/50">
            <div
              v-for="movement in whaleMovements"
              :key="movement.address + movement.time"
              class="p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div 
                    :class="[
                      'w-2 h-2 rounded-full',
                      impactColors[movement.impact as keyof typeof impactColors].bg.replace('/10', '')
                    ]"
                  />
                  <span class="text-white font-medium">{{ movement.type }}</span>
                </div>
                <UiBadge 
                  :class="[
                    impactColors[movement.impact as keyof typeof impactColors].bg,
                    impactColors[movement.impact as keyof typeof impactColors].text,
                    impactColors[movement.impact as keyof typeof impactColors].border,
                    'border'
                  ]"
                  size="sm"
                >
                  {{ movement.impact }}
                </UiBadge>
              </div>
              
              <div class="flex items-center justify-between text-sm">
                <code class="text-slate-500 font-mono">{{ movement.address }}</code>
                <span class="text-white">{{ movement.amount }}</span>
              </div>
              
              <div class="flex items-center justify-between text-xs mt-1">
                <span class="text-slate-500">{{ movement.time }}</span>
                <span class="text-slate-400">{{ movement.value }}</span>
              </div>
            </div>
          </div>
        </UiCard>
        
        <!-- Trading Signals -->
        <UiCard variant="glass-primary" padding="none">
          <div class="p-6 border-b border-primary-500/20">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-white">Trading Signals</h2>
              <Icon name="mdi:signal" class="w-5 h-5 text-primary-400" />
            </div>
          </div>
          
          <div class="divide-y divide-primary-500/10">
            <div
              v-for="signal in tradingSignals"
              :key="signal.asset + signal.time"
              class="p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-white font-medium">{{ signal.asset }}</span>
                <div 
                  :class="[
                    'px-2 py-1 rounded-lg text-xs font-medium',
                    signalColors[signal.signal as keyof typeof signalColors]?.bg || 'bg-slate-500/10',
                    signalColors[signal.signal as keyof typeof signalColors]?.text || 'text-slate-400'
                  ]"
                >
                  {{ signal.signal }}
                </div>
              </div>
              
              <p class="text-sm text-slate-400 mb-2">{{ signal.reason }}</p>
              
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-1">
                  <span class="text-slate-500">Confidence:</span>
                  <span class="text-primary-400">{{ signal.confidence }}%</span>
                </div>
                <span class="text-slate-500">{{ signal.time }}</span>
              </div>
            </div>
          </div>
        </UiCard>
        
        <!-- Copy Trading CTA -->
        <UiCard variant="default" padding="md" class="text-center">
          <Icon name="mdi:content-copy" class="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <h3 class="text-white font-semibold mb-2">Copy Trading</h3>
          <p class="text-sm text-slate-400 mb-4">
            Follow top traders and mirror their strategies automatically.
          </p>
          <UiButton variant="outline" size="sm" full-width>
            Coming Soon
          </UiButton>
        </UiCard>
      </div>
    </div>
  </div>
</template>

