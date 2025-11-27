<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const { finalityProviders, fetchFinalityProviders, isLoading, isMock } = useBlockchain()

onMounted(() => {
  fetchFinalityProviders()
})

// Stats
const stats = computed(() => {
  const providers = finalityProviders.value
  const activeProviders = providers.filter(p => p.active)
  const totalBonded = providers.reduce((sum, p) => sum + parseFloat(p.totalBondedBTC), 0)
  const avgCommission = providers.length > 0 
    ? providers.reduce((sum, p) => sum + parseFloat(p.commissionPercent), 0) / providers.length
    : 0
  
  return {
    totalProviders: providers.length,
    activeProviders: activeProviders.length,
    totalBondedBTC: totalBonded.toFixed(2),
    avgCommission: avgCommission.toFixed(1),
  }
})

const router = useRouter()
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <Icon name="mdi:server-security" class="w-8 h-8 text-purple-400" />
          <h1 class="text-2xl font-bold text-white">Finality Providers</h1>
        </div>
        <p class="text-slate-400">Bitcoin Staking finality providers on Babylon</p>
      </div>
      
      <div class="flex items-center gap-3">
        <div v-if="isMock" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <Icon name="mdi:database-off" class="w-4 h-4 text-yellow-400" />
          <span class="text-xs text-yellow-400 font-medium">Demo Data</span>
        </div>
        
        <UiButton variant="outline" size="sm" @click="fetchFinalityProviders()">
          <Icon name="mdi:refresh" class="w-4 h-4 mr-2" />
          Refresh
        </UiButton>
      </div>
    </div>
    
    <!-- Stats overview -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:server" class="w-6 h-6 text-purple-400 mx-auto mb-2" />
        <div class="text-2xl font-bold text-white">
          <UiSkeleton v-if="isLoading" variant="text" class="mx-auto w-12" />
          <span v-else>{{ stats.totalProviders }}</span>
        </div>
        <div class="text-xs text-slate-500">Total Providers</div>
      </UiCard>
      
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:check-circle" class="w-6 h-6 text-green-400 mx-auto mb-2" />
        <div class="text-2xl font-bold text-white">
          <UiSkeleton v-if="isLoading" variant="text" class="mx-auto w-12" />
          <span v-else>{{ stats.activeProviders }}</span>
        </div>
        <div class="text-xs text-slate-500">Active</div>
      </UiCard>
      
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:bitcoin" class="w-6 h-6 text-orange-400 mx-auto mb-2" />
        <div class="text-2xl font-bold text-white">
          <UiSkeleton v-if="isLoading" variant="text" class="mx-auto w-16" />
          <span v-else>{{ stats.totalBondedBTC }}</span>
        </div>
        <div class="text-xs text-slate-500">Total Bonded (BTC)</div>
      </UiCard>
      
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:percent" class="w-6 h-6 text-amber-400 mx-auto mb-2" />
        <div class="text-2xl font-bold text-white">
          <UiSkeleton v-if="isLoading" variant="text" class="mx-auto w-12" />
          <span v-else>{{ stats.avgCommission }}%</span>
        </div>
        <div class="text-xs text-slate-500">Avg Commission</div>
      </UiCard>
    </div>
    
    <!-- Providers grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Loading state -->
      <template v-if="isLoading">
        <UiCard v-for="i in 6" :key="i" variant="default" padding="md">
          <div class="flex items-center gap-3 mb-4">
            <UiSkeleton variant="avatar" width="48px" height="48px" />
            <div class="flex-1">
              <UiSkeleton variant="text" width="120px" class="mb-2" />
              <UiSkeleton variant="text" width="80px" height="12px" />
            </div>
          </div>
          <UiSkeleton variant="text" class="mb-2" />
          <UiSkeleton variant="text" width="60%" />
        </UiCard>
      </template>
      
      <!-- Provider cards -->
      <UiCard
        v-else
        v-for="(provider, index) in finalityProviders"
        :key="provider.btcPk"
        variant="default"
        padding="md"
        hover
        class="cursor-pointer"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <!-- Rank badge -->
            <div 
              :class="[
                'w-12 h-12 rounded-xl flex items-center justify-center font-bold',
                index === 0 ? 'bg-amber-500/20 text-amber-400' :
                index === 1 ? 'bg-slate-400/20 text-slate-300' :
                index === 2 ? 'bg-orange-600/20 text-orange-400' :
                'bg-purple-500/20 text-purple-400'
              ]"
            >
              <span v-if="index < 3" class="text-lg">#{{ index + 1 }}</span>
              <Icon v-else name="mdi:server" class="w-6 h-6" />
            </div>
            
            <div>
              <h3 class="text-white font-semibold">{{ provider.moniker }}</h3>
              <code class="text-xs text-slate-500 font-mono">{{ provider.addressShort }}</code>
            </div>
          </div>
          
          <UiBadge :variant="provider.active ? 'success' : 'neutral'" size="sm" dot>
            {{ provider.active ? 'Active' : 'Inactive' }}
          </UiBadge>
        </div>
        
        <div class="space-y-3">
          <!-- Bonded amount -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-400">Bonded BTC</span>
            <span class="text-sm text-white font-mono font-medium">{{ provider.totalBondedBTC }}</span>
          </div>
          
          <!-- Commission -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-400">Commission</span>
            <span class="text-sm text-white">{{ provider.commissionPercent }}%</span>
          </div>
          
          <!-- Progress bar for bonded amount -->
          <div class="pt-2">
            <div class="h-2 bg-surface-700 rounded-full overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-purple-500 to-primary-500 rounded-full transition-all"
                :style="{ width: `${Math.min((parseFloat(provider.totalBondedBTC) / 5000) * 100, 100)}%` }"
              />
            </div>
          </div>
        </div>
        
        <!-- Website link -->
        <div v-if="provider.website" class="mt-4 pt-4 border-t border-surface-700/50">
          <a 
            :href="provider.website" 
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
            @click.stop
          >
            <Icon name="mdi:open-in-new" class="w-4 h-4" />
            {{ provider.website.replace('https://', '') }}
          </a>
        </div>
      </UiCard>
      
      <!-- Empty state -->
      <div v-if="!isLoading && finalityProviders.length === 0" class="col-span-full">
        <CommonEmptyState 
          title="No finality providers found" 
          message="Finality providers will appear here once registered."
          icon="mdi:server"
        />
      </div>
    </div>
  </div>
</template>

