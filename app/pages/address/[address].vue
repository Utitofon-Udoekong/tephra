<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const route = useRoute()
const address = computed(() => route.params.address as string)

// Fetch address data
const { data: addressData, pending, error } = await useFetch(`/api/addresses/${address.value}`)

// Fetch transactions for this address
const transactions = ref<any[]>([])
const txLoading = ref(true)
const txMock = ref(false)

const fetchTransactions = async () => {
  txLoading.value = true
  try {
    const response = await $fetch<{ success: boolean; data: any[]; mock?: boolean }>(`/api/addresses/${address.value}/transactions`, {
      query: { limit: 20 }
    })
    if (response.success) {
      transactions.value = response.data
      txMock.value = response.mock || false
    }
  } catch (e) {
    console.error('Failed to fetch transactions:', e)
  } finally {
    txLoading.value = false
  }
}

onMounted(() => {
  fetchTransactions()
})

// Labels for this address
const labels = ref([
  { id: '1', label: 'Active Staker', source: 'heuristic', confidence: 0.95, color: 'primary' },
])

// Label categories for dropdown
const labelCategories = [
  { value: 'whale', label: 'Whale', icon: 'mdi:fish', color: 'blue' },
  { value: 'exchange', label: 'Exchange', icon: 'mdi:bank', color: 'purple' },
  { value: 'validator', label: 'Validator', icon: 'mdi:server', color: 'green' },
  { value: 'smart-money', label: 'Smart Money', icon: 'mdi:trending-up', color: 'amber' },
  { value: 'bot', label: 'Bot', icon: 'mdi:robot', color: 'red' },
  { value: 'contract', label: 'Contract', icon: 'mdi:file-code', color: 'cyan' },
  { value: 'foundation', label: 'Foundation', icon: 'mdi:shield-check', color: 'emerald' },
  { value: 'custom', label: 'Custom', icon: 'mdi:label', color: 'slate' },
]

// Add label modal
const showAddLabelModal = ref(false)
const selectedCategory = ref('')
const customLabel = ref('')
const labelNotes = ref('')

const addLabel = () => {
  const category = labelCategories.find(c => c.value === selectedCategory.value)
  if (!category) return
  
  const labelText = selectedCategory.value === 'custom' ? customLabel.value : category.label
  
  if (labelText) {
    labels.value.push({
      id: Date.now().toString(),
      label: labelText,
      source: 'manual',
      confidence: 1.0,
      color: category.color,
    })
    
    // Reset form
    showAddLabelModal.value = false
    selectedCategory.value = ''
    customLabel.value = ''
    labelNotes.value = ''
  }
}

const removeLabel = (id: string) => {
  labels.value = labels.value.filter(l => l.id !== id)
}

const copyAddress = () => {
  navigator.clipboard.writeText(address.value)
  // Could add toast notification here
}

const shortenAddress = (addr: string, chars = 8) => {
  if (!addr || addr.length <= chars * 2 + 3) return addr
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`
}

// Label color mapping
const getLabelColorClass = (color: string) => {
  const colors: Record<string, string> = {
    primary: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  }
  return colors[color] || colors.primary
}
</script>

<template>
  <div>
    <!-- Back button -->
    <NuxtLink 
      to="/address" 
      class="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-primary-400 mb-6 transition-colors"
    >
      <Icon name="mdi:arrow-left" class="w-4 h-4" />
      Back to Explorer
    </NuxtLink>
    
    <!-- Loading state -->
    <div v-if="pending" class="space-y-6">
      <UiCard variant="default" padding="lg">
        <div class="flex items-center gap-4">
          <UiSkeleton variant="avatar" width="64px" height="64px" />
          <div class="flex-1">
            <UiSkeleton variant="title" class="mb-2" />
            <UiSkeleton variant="text" width="200px" />
          </div>
        </div>
      </UiCard>
    </div>
    
    <!-- Error state -->
    <CommonErrorState 
      v-else-if="error"
      title="Failed to load address"
      :message="error.message"
      @retry="$router.go(0)"
    />
    
    <!-- Address content -->
    <div v-else-if="addressData?.data" class="space-y-6">
      <!-- Address header -->
      <UiCard variant="glass" padding="lg">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <!-- Avatar -->
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-amber-500/20 flex items-center justify-center ring-2 ring-primary-500/30">
              <Icon name="mdi:wallet" class="w-8 h-8 text-primary-400" />
            </div>
            
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h1 class="text-xl font-bold text-white font-mono">
                  {{ addressData.data.addressShort }}
                </h1>
                <button 
                  class="p-1 rounded hover:bg-surface-700/50 transition-colors"
                  @click="copyAddress"
                  title="Copy address"
                >
                  <Icon name="mdi:content-copy" class="w-4 h-4 text-slate-500 hover:text-slate-300" />
                </button>
              </div>
              <code class="text-sm text-slate-500 font-mono break-all">{{ address }}</code>
            </div>
          </div>
          
          <!-- Labels -->
          <div class="flex flex-wrap gap-2">
            <UiBadge 
              v-for="label in labels" 
              :key="label.label"
              variant="primary"
              size="md"
            >
              <Icon name="mdi:label" class="w-3 h-3 mr-1" />
              {{ label.label }}
            </UiBadge>
            <UiBadge variant="neutral" size="md">
              {{ addressData.data?.accountType || 'Account' }}
            </UiBadge>
          </div>
        </div>
      </UiCard>
      
      <!-- Stats grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <UiCard variant="default" padding="md" class="text-center">
          <Icon name="mdi:wallet" class="w-6 h-6 text-primary-400 mx-auto mb-2" />
          <div class="text-2xl font-bold text-white">{{ addressData.data.totalBBN }}</div>
          <div class="text-xs text-slate-500">BBN Balance</div>
        </UiCard>
        
        <UiCard variant="default" padding="md" class="text-center">
          <Icon name="mdi:swap-horizontal" class="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <div class="text-2xl font-bold text-white">{{ transactions.length }}</div>
          <div class="text-xs text-slate-500">Transactions</div>
        </UiCard>
        
        <UiCard variant="default" padding="md" class="text-center">
          <Icon name="mdi:counter" class="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div class="text-2xl font-bold text-white">{{ addressData.data?.sequence || '0' }}</div>
          <div class="text-xs text-slate-500">Sequence</div>
        </UiCard>
        
        <UiCard variant="default" padding="md" class="text-center">
          <Icon name="mdi:identifier" class="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <div class="text-2xl font-bold text-white">#{{ addressData.data?.accountNumber || '0' }}</div>
          <div class="text-xs text-slate-500">Account Number</div>
        </UiCard>
      </div>
      
      <!-- Content grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Transaction History -->
        <div class="lg:col-span-2">
          <UiCard variant="default" padding="none">
            <div class="p-6 border-b border-surface-700/50">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-white">Transaction History</h2>
                <div class="flex items-center gap-2">
                  <div v-if="txMock" class="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <Icon name="mdi:database-off" class="w-3 h-3 text-yellow-400" />
                    <span class="text-xs text-yellow-400">Demo</span>
                  </div>
                  <button 
                    class="p-1.5 rounded-lg hover:bg-surface-700/50 transition-colors"
                    @click="fetchTransactions"
                    :disabled="txLoading"
                  >
                    <Icon name="mdi:refresh" :class="['w-4 h-4 text-slate-400', txLoading && 'animate-spin']" />
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Loading state -->
            <div v-if="txLoading" class="divide-y divide-surface-700/50">
              <div v-for="i in 5" :key="i" class="p-4">
                <div class="flex items-center gap-3">
                  <UiSkeleton variant="custom" width="32px" height="32px" rounded="lg" />
                  <div class="flex-1">
                    <UiSkeleton variant="text" width="180px" class="mb-2" />
                    <UiSkeleton variant="text" width="100px" height="12px" />
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="divide-y divide-surface-700/50">
              <div
                v-for="tx in transactions"
                :key="tx.hash"
                class="p-4 hover:bg-surface-800/30 transition-colors"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-3">
                    <div 
                      :class="[
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        tx.direction === 'in' ? 'bg-green-500/10' : 'bg-red-500/10'
                      ]"
                    >
                      <Icon 
                        :name="tx.direction === 'in' ? 'mdi:arrow-down' : 'mdi:arrow-up'"
                        :class="tx.direction === 'in' ? 'text-green-400' : 'text-red-400'"
                        class="w-4 h-4"
                      />
                    </div>
                    <div>
                      <code class="text-sm text-white font-mono">{{ tx.hashShort || tx.hash }}</code>
                      <div class="text-xs text-slate-500">{{ tx.type }} • Block {{ tx.height?.toLocaleString() }}</div>
                    </div>
                  </div>
                  <UiBadge :variant="tx.status === 'success' ? 'success' : 'error'" size="sm">
                    {{ tx.status }}
                  </UiBadge>
                </div>
                
                <div class="flex items-center justify-between text-sm pl-11">
                  <div class="text-slate-400">
                    {{ tx.direction === 'in' ? 'From' : 'To' }}: 
                    <span class="font-mono">{{ tx.direction === 'in' ? tx.from : tx.to }}</span>
                  </div>
                  <div class="text-right">
                    <div :class="tx.direction === 'in' ? 'text-green-400' : 'text-red-400'" class="font-medium">
                      {{ tx.direction === 'in' ? '+' : '-' }}{{ tx.amount }}
                    </div>
                    <div class="text-xs text-slate-500">{{ tx.timeAgo || tx.time }}</div>
                  </div>
                </div>
              </div>
              
              <!-- Empty state -->
              <div v-if="transactions.length === 0" class="p-8 text-center">
                <Icon name="mdi:swap-horizontal" class="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p class="text-slate-500">No transactions found</p>
              </div>
            </div>
          </UiCard>
        </div>
        
        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Balances -->
          <UiCard variant="default" padding="md">
            <h3 class="text-sm font-semibold text-white mb-4">Token Balances</h3>
            
            <div class="space-y-3">
              <div 
                v-for="balance in addressData.data.balances" 
                :key="balance.denom"
                class="flex items-center justify-between p-3 rounded-lg bg-surface-800/30"
              >
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <span class="text-xs font-bold text-primary-400">
                      {{ balance.denom === 'ubbn' ? 'BBN' : balance.denom.slice(0, 3).toUpperCase() }}
                    </span>
                  </div>
                  <span class="text-sm text-slate-300">{{ balance.denom === 'ubbn' ? 'BBN' : balance.denom }}</span>
                </div>
                <span class="text-sm text-white font-mono">{{ balance.formatted }}</span>
              </div>
            </div>
          </UiCard>
          
          <!-- Labels -->
          <UiCard variant="default" padding="md">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-semibold text-white">Address Labels</h3>
              <button 
                class="text-xs text-primary-400 hover:text-primary-300"
                @click="showAddLabelModal = true"
              >
                + Add Label
              </button>
            </div>
            
            <div v-if="labels.length > 0" class="space-y-2">
              <div 
                v-for="label in labels" 
                :key="label.id"
                :class="[
                  'flex items-center justify-between p-2 rounded-lg border',
                  getLabelColorClass(label.color || 'primary')
                ]"
              >
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium">{{ label.label }}</span>
                  <span class="text-xs opacity-70">({{ label.source }})</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs opacity-70">{{ (label.confidence * 100).toFixed(0) }}%</span>
                  <button 
                    v-if="label.source === 'manual'"
                    class="p-1 hover:bg-white/10 rounded transition-colors"
                    @click="removeLabel(label.id)"
                  >
                    <Icon name="mdi:close" class="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <Icon name="mdi:label-off" class="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p class="text-sm text-slate-500">No labels assigned</p>
            </div>
          </UiCard>
          
          <!-- Actions -->
          <UiCard variant="glass-primary" padding="md">
            <h3 class="text-sm font-semibold text-white mb-4">Actions</h3>
            
            <div class="space-y-2">
              <button class="w-full flex items-center gap-2 p-3 rounded-lg bg-surface-800/50 hover:bg-surface-700/50 transition-colors text-left">
                <Icon name="mdi:eye" class="w-5 h-5 text-primary-400" />
                <span class="text-sm text-slate-300">Watch Address</span>
              </button>
              <button class="w-full flex items-center gap-2 p-3 rounded-lg bg-surface-800/50 hover:bg-surface-700/50 transition-colors text-left">
                <Icon name="mdi:file-export" class="w-5 h-5 text-amber-400" />
                <span class="text-sm text-slate-300">Export Data</span>
              </button>
              <button class="w-full flex items-center gap-2 p-3 rounded-lg bg-surface-800/50 hover:bg-surface-700/50 transition-colors text-left">
                <Icon name="mdi:share-variant" class="w-5 h-5 text-green-400" />
                <span class="text-sm text-slate-300">Share</span>
              </button>
            </div>
          </UiCard>
        </div>
      </div>
    </div>
    
    <!-- Add Label Modal -->
    <UiModal v-model:open="showAddLabelModal" title="Add Label" size="md">
      <div class="space-y-4">
        <div>
          <label class="block text-sm text-slate-400 mb-2">Label Category</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="category in labelCategories"
              :key="category.value"
              :class="[
                'flex items-center gap-2 p-3 rounded-lg border transition-colors text-left',
                selectedCategory === category.value
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-surface-700/50 hover:border-surface-600/50 hover:bg-surface-800/30'
              ]"
              @click="selectedCategory = category.value"
            >
              <Icon :name="category.icon" :class="['w-4 h-4', `text-${category.color}-400`]" />
              <span class="text-sm text-slate-300">{{ category.label }}</span>
            </button>
          </div>
        </div>
        
        <div v-if="selectedCategory === 'custom'">
          <label class="block text-sm text-slate-400 mb-2">Custom Label</label>
          <UiInput 
            v-model="customLabel" 
            placeholder="Enter custom label..."
          />
        </div>
        
        <div>
          <label class="block text-sm text-slate-400 mb-2">Notes (optional)</label>
          <textarea 
            v-model="labelNotes"
            class="w-full p-3 rounded-lg bg-surface-800/50 border border-surface-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 resize-none"
            rows="2"
            placeholder="Add notes about this label..."
          />
        </div>
        
        <div class="flex gap-3 pt-4 border-t border-surface-700/50">
          <UiButton variant="outline" @click="showAddLabelModal = false">
            Cancel
          </UiButton>
          <UiButton 
            variant="primary" 
            :disabled="!selectedCategory || (selectedCategory === 'custom' && !customLabel)"
            @click="addLabel"
          >
            <Icon name="mdi:label" class="w-4 h-4 mr-2" />
            Add Label
          </UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>

