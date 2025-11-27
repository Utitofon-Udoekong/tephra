<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const { btcDelegations, fetchBTCDelegations, isLoading, isMock } = useBlockchain()

onMounted(() => {
  fetchBTCDelegations()
})

// Stats
const stats = computed(() => {
  const delegations = btcDelegations.value
  const activeDelegations = delegations.filter(d => d.status === 'ACTIVE')
  const totalStaked = delegations.reduce((sum, d) => sum + parseFloat(d.stakingValueBTC), 0)
  
  return {
    totalDelegations: delegations.length,
    activeDelegations: activeDelegations.length,
    totalStakedBTC: totalStaked.toFixed(4),
    avgStakingTime: '21,600 blocks',
  }
})

const statusColors = {
  ACTIVE: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  UNBONDING: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  UNBONDED: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
}

const shortenHash = (hash: string, chars = 8) => {
  if (!hash || hash.length <= chars * 2 + 3) return hash
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <Icon name="mdi:bitcoin" class="w-8 h-8 text-orange-400" />
          <h1 class="text-2xl font-bold text-white">BTC Staking</h1>
        </div>
        <p class="text-slate-400">Bitcoin staking delegations on Babylon Genesis</p>
      </div>
      
      <div class="flex items-center gap-3">
        <div v-if="isMock" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <Icon name="mdi:database-off" class="w-4 h-4 text-yellow-400" />
          <span class="text-xs text-yellow-400 font-medium">Demo Data</span>
        </div>
        
        <UiButton variant="outline" size="sm" @click="fetchBTCDelegations()">
          <Icon name="mdi:refresh" class="w-4 h-4 mr-2" />
          Refresh
        </UiButton>
      </div>
    </div>
    
    <!-- Stats overview -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:file-document" class="w-6 h-6 text-primary-400 mx-auto mb-2" />
        <div class="text-2xl font-bold text-white">
          <UiSkeleton v-if="isLoading" variant="text" class="mx-auto w-12" />
          <span v-else>{{ stats.totalDelegations }}</span>
        </div>
        <div class="text-xs text-slate-500">Total Delegations</div>
      </UiCard>
      
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:check-circle" class="w-6 h-6 text-green-400 mx-auto mb-2" />
        <div class="text-2xl font-bold text-white">
          <UiSkeleton v-if="isLoading" variant="text" class="mx-auto w-12" />
          <span v-else>{{ stats.activeDelegations }}</span>
        </div>
        <div class="text-xs text-slate-500">Active</div>
      </UiCard>
      
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:bitcoin" class="w-6 h-6 text-orange-400 mx-auto mb-2" />
        <div class="text-2xl font-bold text-white">
          <UiSkeleton v-if="isLoading" variant="text" class="mx-auto w-16" />
          <span v-else>{{ stats.totalStakedBTC }}</span>
        </div>
        <div class="text-xs text-slate-500">Total Staked (BTC)</div>
      </UiCard>
      
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:clock" class="w-6 h-6 text-blue-400 mx-auto mb-2" />
        <div class="text-xl font-bold text-white">{{ stats.avgStakingTime }}</div>
        <div class="text-xs text-slate-500">Staking Period</div>
      </UiCard>
    </div>
    
    <!-- Delegations table -->
    <UiCard variant="default" padding="none">
      <div class="p-6 border-b border-surface-700/50">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-white">BTC Delegations</h2>
          <div class="flex items-center gap-2">
            <UiBadge variant="success" size="sm" dot>
              Active: {{ stats.activeDelegations }}
            </UiBadge>
          </div>
        </div>
      </div>
      
      <!-- Loading state -->
      <div v-if="isLoading" class="divide-y divide-surface-700/50">
        <div v-for="i in 5" :key="i" class="p-4">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <UiSkeleton variant="text" width="200px" class="mb-2" />
              <UiSkeleton variant="text" width="150px" height="12px" />
            </div>
            <UiSkeleton variant="text" width="80px" />
          </div>
        </div>
      </div>
      
      <!-- Delegations list -->
      <div v-else class="divide-y divide-surface-700/50">
        <div
          v-for="delegation in btcDelegations"
          :key="delegation.stakingTxHash"
          class="p-4 hover:bg-surface-800/30 transition-colors"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-orange-500/10">
                <Icon name="mdi:bitcoin" class="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <code class="text-sm text-white font-mono">{{ delegation.stakingTxHashShort }}</code>
                  <button class="p-1 hover:bg-surface-700/50 rounded transition-colors">
                    <Icon name="mdi:content-copy" class="w-3 h-3 text-slate-500" />
                  </button>
                </div>
                <div class="text-xs text-slate-500">
                  Staker: <code class="font-mono">{{ delegation.stakerAddressShort }}</code>
                </div>
              </div>
            </div>
            
            <UiBadge 
              :class="[
                statusColors[delegation.status as keyof typeof statusColors]?.bg || 'bg-slate-500/10',
                statusColors[delegation.status as keyof typeof statusColors]?.text || 'text-slate-400',
                statusColors[delegation.status as keyof typeof statusColors]?.border || 'border-slate-500/20',
                'border'
              ]"
              size="sm"
            >
              {{ delegation.status }}
            </UiBadge>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pl-12">
            <div>
              <span class="text-slate-500">Amount</span>
              <p class="text-white font-mono">{{ delegation.stakingValueBTC }} BTC</p>
            </div>
            <div>
              <span class="text-slate-500">Staking Time</span>
              <p class="text-white">{{ delegation.stakingTime.toLocaleString() }} blocks</p>
            </div>
            <div>
              <span class="text-slate-500">Unbonding Time</span>
              <p class="text-white">{{ delegation.unbondingTime.toLocaleString() }} blocks</p>
            </div>
            <div>
              <span class="text-slate-500">Finality Providers</span>
              <p class="text-white">{{ delegation.finalityProviders.length }}</p>
            </div>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-if="btcDelegations.length === 0" class="p-12">
          <CommonEmptyState 
            title="No delegations found" 
            message="BTC staking delegations will appear here."
            icon="mdi:bitcoin"
          />
        </div>
      </div>
    </UiCard>
  </div>
</template>

