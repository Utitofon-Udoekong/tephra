<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

// Time range selection
const timeRange = ref('7d')
const timeRanges = [
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
]

// Mock chart data - transactions over time
const transactionData = computed(() => {
  const days = timeRange.value === '24h' ? 24 : 
               timeRange.value === '7d' ? 7 :
               timeRange.value === '30d' ? 30 : 90
  
  return Array.from({ length: days }, (_, i) => ({
    label: timeRange.value === '24h' ? `${i}:00` : `Day ${i + 1}`,
    value: Math.floor(Math.random() * 5000) + 1000,
  }))
})

// Mock metrics
const metrics = ref([
  {
    title: 'Total Transactions',
    value: '2.84M',
    change: '+12.5%',
    positive: true,
    icon: 'mdi:swap-horizontal',
    color: 'primary',
  },
  {
    title: 'Active Addresses',
    value: '125.8K',
    change: '+8.2%',
    positive: true,
    icon: 'mdi:wallet',
    color: 'green',
  },
  {
    title: 'Avg Block Time',
    value: '6.2s',
    change: '-0.3s',
    positive: true,
    icon: 'mdi:clock',
    color: 'amber',
  },
  {
    title: 'Network TPS',
    value: '42.5',
    change: '+5.1%',
    positive: true,
    icon: 'mdi:speedometer',
    color: 'blue',
  },
])

// Top transaction types
const txTypes = ref([
  { type: 'Transfer', count: 1250000, percent: 44 },
  { type: 'Delegate', count: 850000, percent: 30 },
  { type: 'BTC Stake', count: 420000, percent: 15 },
  { type: 'Undelegate', count: 200000, percent: 7 },
  { type: 'Vote', count: 120000, percent: 4 },
])

// Volume data
const volumeData = ref([
  { label: 'Mon', value: 12500000 },
  { label: 'Tue', value: 15800000 },
  { label: 'Wed', value: 11200000 },
  { label: 'Thu', value: 18900000 },
  { label: 'Fri', value: 22100000 },
  { label: 'Sat', value: 16700000 },
  { label: 'Sun', value: 14300000 },
])

const colorMap = {
  primary: 'text-primary-400',
  green: 'text-green-400',
  amber: 'text-amber-400',
  blue: 'text-blue-400',
}

const bgColorMap = {
  primary: 'bg-primary-500',
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
}

const typeColors = ['bg-primary-500', 'bg-amber-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500']
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white mb-2">Analytics</h1>
        <p class="text-slate-400">On-chain metrics and network analysis</p>
      </div>
      
      <!-- Time range selector -->
      <div class="flex items-center gap-2 bg-surface-800/50 rounded-xl p-1">
        <button
          v-for="range in timeRanges"
          :key="range.value"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            timeRange === range.value 
              ? 'bg-primary-500 text-white' 
              : 'text-slate-400 hover:text-white hover:bg-surface-700/50'
          ]"
          @click="timeRange = range.value"
        >
          {{ range.label }}
        </button>
      </div>
    </div>
    
    <!-- Metrics grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <UiCard
        v-for="metric in metrics"
        :key="metric.title"
        variant="default"
        padding="md"
      >
        <div class="flex items-center justify-between mb-3">
          <Icon 
            :name="metric.icon" 
            :class="['w-5 h-5', colorMap[metric.color as keyof typeof colorMap]]" 
          />
          <div 
            :class="[
              'text-xs font-medium px-2 py-0.5 rounded',
              metric.positive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            ]"
          >
            {{ metric.change }}
          </div>
        </div>
        <div class="text-2xl font-bold text-white mb-1">{{ metric.value }}</div>
        <div class="text-xs text-slate-500">{{ metric.title }}</div>
      </UiCard>
    </div>
    
    <!-- Charts row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Transaction volume chart -->
      <UiCard variant="default" padding="md">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-white">Transaction Volume</h3>
          <UiBadge variant="primary" size="sm">{{ timeRange }}</UiBadge>
        </div>
        
        <!-- Simple bar chart visualization -->
        <div class="h-48 flex items-end gap-1">
          <div
            v-for="(item, index) in transactionData.slice(-14)"
            :key="index"
            class="flex-1 bg-primary-500/20 hover:bg-primary-500/30 rounded-t transition-colors relative group"
            :style="{ height: `${(item.value / 6000) * 100}%` }"
          >
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-surface-800 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {{ item.value.toLocaleString() }} txs
            </div>
          </div>
        </div>
        
        <!-- X-axis labels -->
        <div class="flex justify-between mt-2 text-xs text-slate-500">
          <span>{{ transactionData[0]?.label }}</span>
          <span>{{ transactionData[Math.floor(transactionData.length / 2)]?.label }}</span>
          <span>{{ transactionData[transactionData.length - 1]?.label }}</span>
        </div>
      </UiCard>
      
      <!-- Volume by day -->
      <UiCard variant="default" padding="md">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-white">Weekly Volume (BBN)</h3>
          <Icon name="mdi:chart-bar" class="w-5 h-5 text-slate-500" />
        </div>
        
        <!-- Bar chart -->
        <div class="h-48 flex items-end gap-2">
          <div
            v-for="(item, index) in volumeData"
            :key="index"
            class="flex-1 flex flex-col items-center"
          >
            <div 
              class="w-full bg-gradient-to-t from-amber-500/50 to-amber-500/20 hover:from-amber-500/70 hover:to-amber-500/30 rounded-t transition-colors"
              :style="{ height: `${(item.value / 25000000) * 100}%` }"
            />
            <span class="text-xs text-slate-500 mt-2">{{ item.label }}</span>
          </div>
        </div>
      </UiCard>
    </div>
    
    <!-- Bottom row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Transaction types breakdown -->
      <UiCard variant="default" padding="md">
        <h3 class="text-lg font-semibold text-white mb-6">Transaction Types</h3>
        
        <div class="space-y-4">
          <div
            v-for="(tx, index) in txTypes"
            :key="tx.type"
            class="space-y-2"
          >
            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-300">{{ tx.type }}</span>
              <span class="text-white font-medium">{{ tx.percent }}%</span>
            </div>
            <div class="h-2 bg-surface-700 rounded-full overflow-hidden">
              <div 
                :class="['h-full rounded-full transition-all', typeColors[index % typeColors.length]]"
                :style="{ width: `${tx.percent}%` }"
              />
            </div>
          </div>
        </div>
      </UiCard>
      
      <!-- Network health -->
      <UiCard variant="default" padding="md">
        <h3 class="text-lg font-semibold text-white mb-6">Network Health</h3>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <span class="text-sm text-slate-300">Block Production</span>
            </div>
            <span class="text-sm text-green-400 font-medium">Healthy</span>
          </div>
          
          <div class="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <span class="text-sm text-slate-300">Validator Set</span>
            </div>
            <span class="text-sm text-green-400 font-medium">42 Active</span>
          </div>
          
          <div class="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <span class="text-sm text-slate-300">Finality</span>
            </div>
            <span class="text-sm text-green-400 font-medium">Normal</span>
          </div>
          
          <div class="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-yellow-400 rounded-full" />
              <span class="text-sm text-slate-300">Mempool</span>
            </div>
            <span class="text-sm text-yellow-400 font-medium">Moderate</span>
          </div>
        </div>
      </UiCard>
      
      <!-- Quick insights -->
      <UiCard variant="glass-primary" padding="md">
        <h3 class="text-lg font-semibold text-white mb-6">Quick Insights</h3>
        
        <div class="space-y-4">
          <div class="p-3 rounded-lg bg-surface-800/50">
            <div class="flex items-center gap-2 text-primary-400 mb-2">
              <Icon name="mdi:trending-up" class="w-4 h-4" />
              <span class="text-sm font-medium">Trending Up</span>
            </div>
            <p class="text-sm text-slate-400">
              Transaction volume increased by 23% compared to last week.
            </p>
          </div>
          
          <div class="p-3 rounded-lg bg-surface-800/50">
            <div class="flex items-center gap-2 text-amber-400 mb-2">
              <Icon name="mdi:account-group" class="w-4 h-4" />
              <span class="text-sm font-medium">Active Users</span>
            </div>
            <p class="text-sm text-slate-400">
              New address creation rate is 15% above average.
            </p>
          </div>
          
          <div class="p-3 rounded-lg bg-surface-800/50">
            <div class="flex items-center gap-2 text-green-400 mb-2">
              <Icon name="mdi:bitcoin" class="w-4 h-4" />
              <span class="text-sm font-medium">BTC Staking</span>
            </div>
            <p class="text-sm text-slate-400">
              Total BTC staked reached a new ATH of 15,000 BTC.
            </p>
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>

