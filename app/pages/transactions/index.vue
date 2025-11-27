<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const { transactions, fetchTransactions, isLoading, isMock } = useBlockchain()

// Filters
const typeFilter = ref('all')
const statusFilter = ref('all')

const txTypes = ['all', 'Transfer', 'Delegate', 'Undelegate', 'BTC Stake', 'Vote']
const statuses = ['all', 'success', 'failed']

onMounted(() => {
  fetchTransactions(50)
})

// Filtered transactions
const filteredTransactions = computed(() => {
  return transactions.value.filter(tx => {
    if (typeFilter.value !== 'all' && tx.type !== typeFilter.value) return false
    if (statusFilter.value !== 'all' && tx.status !== statusFilter.value) return false
    return true
  })
})

// Stats
const stats = computed(() => {
  const txs = transactions.value
  const successful = txs.filter(t => t.status === 'success').length
  const failed = txs.filter(t => t.status === 'failed').length
  
  return {
    total: txs.length,
    successful,
    failed,
    successRate: txs.length > 0 ? ((successful / txs.length) * 100).toFixed(1) : '0',
  }
})

const router = useRouter()

const copyHash = (hash: string) => {
  navigator.clipboard.writeText(hash)
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white mb-2">Transactions</h1>
        <p class="text-slate-400">Recent transactions on Babylon Genesis</p>
      </div>
      
      <div class="flex items-center gap-3">
        <div v-if="isMock" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <Icon name="mdi:database-off" class="w-4 h-4 text-yellow-400" />
          <span class="text-xs text-yellow-400 font-medium">Demo Data</span>
        </div>
        
        <UiButton variant="outline" size="sm" @click="fetchTransactions(50)">
          <Icon name="mdi:refresh" class="w-4 h-4 mr-2" />
          Refresh
        </UiButton>
      </div>
    </div>
    
    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:swap-horizontal" class="w-6 h-6 text-primary-400 mx-auto mb-2" />
        <div class="text-2xl font-bold text-white">{{ stats.total }}</div>
        <div class="text-xs text-slate-500">Total Shown</div>
      </UiCard>
      
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:check-circle" class="w-6 h-6 text-green-400 mx-auto mb-2" />
        <div class="text-2xl font-bold text-white">{{ stats.successful }}</div>
        <div class="text-xs text-slate-500">Successful</div>
      </UiCard>
      
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:close-circle" class="w-6 h-6 text-red-400 mx-auto mb-2" />
        <div class="text-2xl font-bold text-white">{{ stats.failed }}</div>
        <div class="text-xs text-slate-500">Failed</div>
      </UiCard>
      
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:percent" class="w-6 h-6 text-amber-400 mx-auto mb-2" />
        <div class="text-2xl font-bold text-white">{{ stats.successRate }}%</div>
        <div class="text-xs text-slate-500">Success Rate</div>
      </UiCard>
    </div>
    
    <!-- Filters -->
    <UiCard variant="default" padding="md" class="mb-6">
      <div class="flex flex-wrap items-center gap-4">
        <!-- Type filter -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-400">Type:</span>
          <div class="flex items-center gap-1 bg-surface-800/50 rounded-lg p-1">
            <button
              v-for="type in txTypes"
              :key="type"
              :class="[
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                typeFilter === type 
                  ? 'bg-primary-500 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-surface-700/50'
              ]"
              @click="typeFilter = type"
            >
              {{ type === 'all' ? 'All' : type }}
            </button>
          </div>
        </div>
        
        <!-- Status filter -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-400">Status:</span>
          <div class="flex items-center gap-1 bg-surface-800/50 rounded-lg p-1">
            <button
              v-for="status in statuses"
              :key="status"
              :class="[
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize',
                statusFilter === status 
                  ? 'bg-primary-500 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-surface-700/50'
              ]"
              @click="statusFilter = status"
            >
              {{ status }}
            </button>
          </div>
        </div>
        
        <div class="flex-1" />
        
        <!-- Results count -->
        <span class="text-sm text-slate-500">
          Showing {{ filteredTransactions.length }} of {{ transactions.length }}
        </span>
      </div>
    </UiCard>
    
    <!-- Transactions list -->
    <UiCard variant="default" padding="none">
      <!-- Loading state -->
      <div v-if="isLoading" class="divide-y divide-surface-700/50">
        <div v-for="i in 10" :key="i" class="p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <UiSkeleton variant="custom" width="40px" height="40px" rounded="lg" />
              <div>
                <UiSkeleton variant="text" width="180px" class="mb-2" />
                <UiSkeleton variant="text" width="100px" height="12px" />
              </div>
            </div>
            <UiSkeleton variant="text" width="80px" />
          </div>
        </div>
      </div>
      
      <!-- Transactions -->
      <div v-else class="divide-y divide-surface-700/50">
        <div
          v-for="tx in filteredTransactions"
          :key="tx.hash"
          class="p-4 hover:bg-surface-800/30 transition-colors"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <div 
                :class="[
                  'p-2.5 rounded-lg',
                  tx.type === 'Transfer' ? 'bg-blue-500/10' :
                  tx.type === 'Delegate' ? 'bg-green-500/10' :
                  tx.type === 'BTC Stake' ? 'bg-orange-500/10' :
                  tx.type === 'Undelegate' ? 'bg-red-500/10' :
                  'bg-purple-500/10'
                ]"
              >
                <Icon 
                  :name="tx.type === 'Transfer' ? 'mdi:arrow-right' :
                         tx.type === 'Delegate' ? 'mdi:vote' :
                         tx.type === 'BTC Stake' ? 'mdi:bitcoin' :
                         tx.type === 'Undelegate' ? 'mdi:arrow-left' : 'mdi:file-document'"
                  :class="[
                    'w-5 h-5',
                    tx.type === 'Transfer' ? 'text-blue-400' :
                    tx.type === 'Delegate' ? 'text-green-400' :
                    tx.type === 'BTC Stake' ? 'text-orange-400' :
                    tx.type === 'Undelegate' ? 'text-red-400' :
                    'text-purple-400'
                  ]"
                />
              </div>
              
              <div>
                <div class="flex items-center gap-2">
                  <code class="text-sm text-white font-mono">{{ tx.hash }}</code>
                  <button 
                    class="p-1 hover:bg-surface-700/50 rounded transition-colors"
                    @click="copyHash(tx.hash)"
                  >
                    <Icon name="mdi:content-copy" class="w-3 h-3 text-slate-500 hover:text-slate-300" />
                  </button>
                </div>
                <div class="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>{{ tx.type }}</span>
                  <span>•</span>
                  <span>Block {{ tx.height.toLocaleString() }}</span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="text-sm text-white font-medium">{{ tx.amount }}</div>
                <div class="text-xs text-slate-500">{{ tx.timeAgo }}</div>
              </div>
              
              <UiBadge 
                :variant="tx.status === 'success' ? 'success' : 'error'"
                size="sm"
                dot
              >
                {{ tx.status }}
              </UiBadge>
            </div>
          </div>
          
          <!-- From/To row -->
          <div class="flex items-center gap-4 text-sm pl-14">
            <div class="flex items-center gap-2">
              <span class="text-slate-500">From:</span>
              <code 
                class="text-slate-300 font-mono hover:text-primary-400 cursor-pointer"
                @click="router.push(`/address/${tx.fromFull}`)"
              >
                {{ tx.from }}
              </code>
            </div>
            <Icon name="mdi:arrow-right" class="w-4 h-4 text-slate-600" />
            <div class="flex items-center gap-2">
              <span class="text-slate-500">To:</span>
              <code 
                class="text-slate-300 font-mono hover:text-primary-400 cursor-pointer"
                @click="router.push(`/address/${tx.toFull}`)"
              >
                {{ tx.to }}
              </code>
            </div>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-if="filteredTransactions.length === 0" class="p-12">
          <CommonEmptyState 
            title="No transactions found" 
            :message="typeFilter !== 'all' || statusFilter !== 'all' 
              ? 'Try adjusting your filters.' 
              : 'Transactions will appear here.'"
            icon="mdi:swap-horizontal"
          />
        </div>
      </div>
    </UiCard>
  </div>
</template>

