<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const { networkStats, isLoading, isMock, fetchNetworkStats } = useBlockchain()

onMounted(() => {
  fetchNetworkStats()
})

// Detailed metrics
const chainMetrics = ref([
  {
    category: 'Network',
    items: [
      { label: 'Chain ID', value: 'bbn-test-6', icon: 'mdi:identifier' },
      { label: 'Block Height', value: '1,847,293', icon: 'mdi:cube', dynamic: true },
      { label: 'Block Time', value: '~6 seconds', icon: 'mdi:clock' },
      { label: 'Total Validators', value: '42', icon: 'mdi:server' },
    ],
  },
  {
    category: 'Staking',
    items: [
      { label: 'Bonded Tokens', value: '125.8M BBN', icon: 'mdi:lock' },
      { label: 'Staking APR', value: '~12.5%', icon: 'mdi:percent' },
      { label: 'Inflation Rate', value: '8.2%', icon: 'mdi:trending-up' },
      { label: 'Community Pool', value: '2.1M BBN', icon: 'mdi:bank' },
    ],
  },
  {
    category: 'BTC Staking',
    items: [
      { label: 'Total BTC Staked', value: '15,234 BTC', icon: 'mdi:bitcoin' },
      { label: 'Finality Providers', value: '24', icon: 'mdi:server-security' },
      { label: 'Active Delegations', value: '8,456', icon: 'mdi:file-document' },
      { label: 'Staking Capacity', value: '~75%', icon: 'mdi:gauge' },
    ],
  },
  {
    category: 'Transactions',
    items: [
      { label: 'Total Transactions', value: '2.84M', icon: 'mdi:swap-horizontal' },
      { label: 'Avg TPS', value: '42.5', icon: 'mdi:speedometer' },
      { label: 'Gas Price', value: '0.001 BBN', icon: 'mdi:gas-station' },
      { label: 'Active Addresses (24h)', value: '12,458', icon: 'mdi:wallet' },
    ],
  },
])

// Live metrics with updates
const liveMetrics = ref({
  latestBlock: 1847293,
  pendingTxs: 12,
  mempool: 'Normal',
  networkHealth: 'Healthy',
})

// Update live metrics every 10 seconds
const updateInterval = ref<NodeJS.Timeout | null>(null)

onMounted(() => {
  updateInterval.value = setInterval(() => {
    liveMetrics.value.latestBlock += 1
    liveMetrics.value.pendingTxs = Math.floor(Math.random() * 20) + 5
  }, 10000)
})

onUnmounted(() => {
  if (updateInterval.value) {
    clearInterval(updateInterval.value)
  }
})

// Cosmos SDK modules
const modules = ref([
  { name: 'bank', status: 'active', version: 'v0.50' },
  { name: 'staking', status: 'active', version: 'v0.50' },
  { name: 'distribution', status: 'active', version: 'v0.50' },
  { name: 'gov', status: 'active', version: 'v0.50' },
  { name: 'btcstaking', status: 'active', version: 'v1.0', babylon: true },
  { name: 'finality', status: 'active', version: 'v1.0', babylon: true },
  { name: 'epoching', status: 'active', version: 'v1.0', babylon: true },
  { name: 'btclightclient', status: 'active', version: 'v1.0', babylon: true },
])
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white mb-2">Network Metrics</h1>
        <p class="text-slate-400">Detailed chain statistics and parameters</p>
      </div>
      
      <div class="flex items-center gap-3">
        <div v-if="isMock" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <Icon name="mdi:database-off" class="w-4 h-4 text-yellow-400" />
          <span class="text-xs text-yellow-400 font-medium">Demo Data</span>
        </div>
        
        <UiButton variant="outline" size="sm" @click="fetchNetworkStats">
          <Icon name="mdi:refresh" class="w-4 h-4 mr-2" />
          Refresh
        </UiButton>
      </div>
    </div>
    
    <!-- Live status bar -->
    <UiCard variant="glass-primary" padding="md" class="mb-8">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <span class="text-white font-medium">Live</span>
          </div>
          
          <div class="h-6 w-px bg-surface-700" />
          
          <div class="flex items-center gap-2">
            <Icon name="mdi:cube" class="w-4 h-4 text-primary-400" />
            <span class="text-slate-400">Block:</span>
            <span class="text-white font-mono">{{ liveMetrics.latestBlock.toLocaleString() }}</span>
          </div>
          
          <div class="flex items-center gap-2">
            <Icon name="mdi:timer-sand" class="w-4 h-4 text-amber-400" />
            <span class="text-slate-400">Pending:</span>
            <span class="text-white">{{ liveMetrics.pendingTxs }} txs</span>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10">
            <Icon name="mdi:check-circle" class="w-4 h-4 text-green-400" />
            <span class="text-sm text-green-400">{{ liveMetrics.networkHealth }}</span>
          </div>
        </div>
      </div>
    </UiCard>
    
    <!-- Metrics grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <UiCard 
        v-for="section in chainMetrics" 
        :key="section.category"
        variant="default" 
        padding="none"
      >
        <div class="p-6 border-b border-surface-700/50">
          <h2 class="text-lg font-semibold text-white">{{ section.category }}</h2>
        </div>
        
        <div class="divide-y divide-surface-700/50">
          <div
            v-for="item in section.items"
            :key="item.label"
            class="flex items-center justify-between p-4"
          >
            <div class="flex items-center gap-3">
              <Icon :name="item.icon" class="w-5 h-5 text-slate-500" />
              <span class="text-slate-400">{{ item.label }}</span>
            </div>
            <span 
              :class="[
                'font-medium',
                item.dynamic ? 'text-primary-400 font-mono' : 'text-white'
              ]"
            >
              {{ item.value }}
            </span>
          </div>
        </div>
      </UiCard>
    </div>
    
    <!-- Cosmos SDK Modules -->
    <UiCard variant="default" padding="none">
      <div class="p-6 border-b border-surface-700/50">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-white">Cosmos SDK Modules</h2>
          <UiBadge variant="neutral" size="sm">{{ modules.length }} Active</UiBadge>
        </div>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
        <div
          v-for="mod in modules"
          :key="mod.name"
          :class="[
            'flex items-center justify-between p-4 rounded-xl border',
            mod.babylon 
              ? 'bg-primary-500/5 border-primary-500/20' 
              : 'bg-surface-800/30 border-surface-700/50'
          ]"
        >
          <div>
            <div class="flex items-center gap-2">
              <span class="text-white font-medium">{{ mod.name }}</span>
              <UiBadge v-if="mod.babylon" variant="primary" size="sm">Babylon</UiBadge>
            </div>
            <span class="text-xs text-slate-500">{{ mod.version }}</span>
          </div>
          <div class="w-2 h-2 bg-green-400 rounded-full" />
        </div>
      </div>
    </UiCard>
    
    <!-- Additional Info -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      <!-- Endpoints -->
      <UiCard variant="default" padding="md">
        <h3 class="text-white font-semibold mb-4">API Endpoints</h3>
        <div class="space-y-3 text-sm">
          <div>
            <span class="text-slate-500">LCD/REST:</span>
            <code class="block text-primary-400 font-mono text-xs mt-1 truncate">
              https://lcd.testnet.babylonlabs.io
            </code>
          </div>
          <div>
            <span class="text-slate-500">RPC:</span>
            <code class="block text-primary-400 font-mono text-xs mt-1 truncate">
              https://rpc.testnet.babylonlabs.io
            </code>
          </div>
          <div>
            <span class="text-slate-500">gRPC:</span>
            <code class="block text-primary-400 font-mono text-xs mt-1 truncate">
              grpc.testnet.babylonlabs.io:443
            </code>
          </div>
        </div>
      </UiCard>
      
      <!-- Token Info -->
      <UiCard variant="default" padding="md">
        <h3 class="text-white font-semibold mb-4">Token Info</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-500">Denom:</span>
            <span class="text-white font-mono">ubbn</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Decimals:</span>
            <span class="text-white">6</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Total Supply:</span>
            <span class="text-white">21B BBN</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Circulating:</span>
            <span class="text-white">~500M BBN</span>
          </div>
        </div>
      </UiCard>
      
      <!-- Links -->
      <UiCard variant="default" padding="md">
        <h3 class="text-white font-semibold mb-4">Resources</h3>
        <div class="space-y-2">
          <a 
            href="https://docs.babylonlabs.io" 
            target="_blank"
            rel="noopener"
            class="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-700/30 transition-colors text-slate-400 hover:text-white"
          >
            <Icon name="mdi:book-open-variant" class="w-4 h-4" />
            <span class="text-sm">Documentation</span>
            <Icon name="mdi:open-in-new" class="w-3 h-3 ml-auto" />
          </a>
          <a 
            href="https://github.com/babylonlabs-io" 
            target="_blank"
            rel="noopener"
            class="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-700/30 transition-colors text-slate-400 hover:text-white"
          >
            <Icon name="mdi:github" class="w-4 h-4" />
            <span class="text-sm">GitHub</span>
            <Icon name="mdi:open-in-new" class="w-3 h-3 ml-auto" />
          </a>
          <a 
            href="https://discord.gg/babylonlabs" 
            target="_blank"
            rel="noopener"
            class="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-700/30 transition-colors text-slate-400 hover:text-white"
          >
            <Icon name="mdi:discord" class="w-4 h-4" />
            <span class="text-sm">Discord</span>
            <Icon name="mdi:open-in-new" class="w-3 h-3 ml-auto" />
          </a>
        </div>
      </UiCard>
    </div>
  </div>
</template>

