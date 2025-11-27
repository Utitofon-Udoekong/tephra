<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const { blocks, fetchBlocks, isLoading, isMock } = useBlockchain()

onMounted(() => {
  fetchBlocks(20)
})

// Auto-refresh
const refreshInterval = ref<NodeJS.Timeout | null>(null)

onMounted(() => {
  refreshInterval.value = setInterval(() => {
    fetchBlocks(20)
  }, 15000) // Refresh every 15 seconds
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})

// Stats
const stats = computed(() => {
  if (blocks.value.length < 2) return { avgBlockTime: '6.0s', avgTxPerBlock: 0 }
  
  const totalTx = blocks.value.reduce((sum, b) => sum + b.txCount, 0)
  const avgTx = totalTx / blocks.value.length
  
  return {
    avgBlockTime: '6.0s',
    avgTxPerBlock: avgTx.toFixed(1),
  }
})

const latestBlock = computed(() => blocks.value[0] || null)
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white mb-2">Blocks</h1>
        <p class="text-slate-400">Recent blocks on Babylon Genesis</p>
      </div>
      
      <div class="flex items-center gap-3">
        <div v-if="isMock" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <Icon name="mdi:database-off" class="w-4 h-4 text-yellow-400" />
          <span class="text-xs text-yellow-400 font-medium">Demo Data</span>
        </div>
        
        <UiBadge variant="success" size="sm" dot pulse>
          Auto-refresh
        </UiBadge>
        
        <UiButton variant="outline" size="sm" @click="fetchBlocks(20)">
          <Icon name="mdi:refresh" class="w-4 h-4 mr-2" />
          Refresh
        </UiButton>
      </div>
    </div>
    
    <!-- Latest block highlight -->
    <UiCard v-if="latestBlock" variant="glass-primary" padding="md" class="mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-xl bg-primary-500/20">
            <Icon name="mdi:cube" class="w-8 h-8 text-primary-400" />
          </div>
          <div>
            <div class="text-sm text-primary-400 font-medium mb-1">Latest Block</div>
            <div class="text-2xl font-bold text-white">
              #{{ latestBlock.height.toLocaleString() }}
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-3 gap-8 text-center">
          <div>
            <div class="text-2xl font-bold text-white">{{ latestBlock.txCount }}</div>
            <div class="text-xs text-slate-400">Transactions</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-white">{{ stats.avgBlockTime }}</div>
            <div class="text-xs text-slate-400">Block Time</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-white">{{ latestBlock.timeAgo }}</div>
            <div class="text-xs text-slate-400">Age</div>
          </div>
        </div>
      </div>
    </UiCard>
    
    <!-- Blocks list -->
    <UiCard variant="default" padding="none">
      <div class="p-6 border-b border-surface-700/50">
        <h2 class="text-lg font-semibold text-white">Recent Blocks</h2>
      </div>
      
      <!-- Loading state -->
      <div v-if="isLoading" class="divide-y divide-surface-700/50">
        <div v-for="i in 10" :key="i" class="p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <UiSkeleton variant="custom" width="48px" height="48px" rounded="xl" />
              <div>
                <UiSkeleton variant="text" width="120px" class="mb-2" />
                <UiSkeleton variant="text" width="200px" height="12px" />
              </div>
            </div>
            <UiSkeleton variant="text" width="60px" />
          </div>
        </div>
      </div>
      
      <!-- Blocks -->
      <div v-else class="divide-y divide-surface-700/50">
        <div
          v-for="(block, index) in blocks"
          :key="block.height"
          class="p-4 hover:bg-surface-800/30 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <!-- Block number -->
              <div 
                :class="[
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  index === 0 ? 'bg-primary-500/20' : 'bg-surface-700/50'
                ]"
              >
                <Icon 
                  name="mdi:cube-outline" 
                  :class="[
                    'w-6 h-6',
                    index === 0 ? 'text-primary-400' : 'text-slate-500'
                  ]" 
                />
              </div>
              
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-lg font-bold text-white">
                    #{{ block.height.toLocaleString() }}
                  </span>
                  <UiBadge v-if="index === 0" variant="primary" size="sm">Latest</UiBadge>
                </div>
                <div class="flex items-center gap-3 text-sm text-slate-500 mt-1">
                  <span class="font-mono">{{ block.hash.substring(0, 16) }}...</span>
                  <span>•</span>
                  <span>{{ block.chainId }}</span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center gap-6">
              <!-- Transactions -->
              <div class="text-center">
                <div class="text-lg font-bold text-white">{{ block.txCount }}</div>
                <div class="text-xs text-slate-500">Txs</div>
              </div>
              
              <!-- Time -->
              <div class="text-right min-w-[80px]">
                <div class="text-sm text-white">{{ block.timeAgo }}</div>
                <div class="text-xs text-slate-500">ago</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-if="blocks.length === 0" class="p-12">
          <CommonEmptyState 
            title="No blocks found" 
            message="Blocks will appear here once the network is active."
            icon="mdi:cube-outline"
          />
        </div>
      </div>
    </UiCard>
  </div>
</template>

