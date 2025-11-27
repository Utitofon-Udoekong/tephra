<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const router = useRouter()

// Search state
const searchAddress = ref('')
const searchResult = ref<any>(null)
const isSearching = ref(false)
const searchError = ref('')

// Known entities from API
const knownEntities = ref<any[]>([])
const entitiesLoading = ref(true)
const isMock = ref(false)

// Recent checks (stored locally)
const recentChecks = ref<any[]>([])

// Fetch known entities on mount
const fetchEntities = async () => {
  entitiesLoading.value = true
  try {
    const response = await $fetch<{ success: boolean; data: any; mock?: boolean }>('/api/compliance/entities')
    if (response.success) {
      knownEntities.value = response.data.entities
      isMock.value = response.mock || false
    }
  } catch (e) {
    console.error('Failed to fetch entities:', e)
  } finally {
    entitiesLoading.value = false
  }
}

onMounted(() => {
  fetchEntities()
  // Load recent checks from localStorage
  const stored = localStorage.getItem('tephra_recent_compliance_checks')
  if (stored) {
    recentChecks.value = JSON.parse(stored)
  }
})

// Risk score color mapping
const getRiskColor = (score: number) => {
  if (score >= 80) return { bg: 'bg-red-500', text: 'text-red-400', label: 'High Risk' }
  if (score >= 50) return { bg: 'bg-yellow-500', text: 'text-yellow-400', label: 'Medium Risk' }
  if (score >= 20) return { bg: 'bg-blue-500', text: 'text-blue-400', label: 'Low Risk' }
  return { bg: 'bg-green-500', text: 'text-green-400', label: 'Clean' }
}

// Real search function using API
const searchAddressRisk = async () => {
  if (!searchAddress.value) return
  
  // Validate address format
  if (!searchAddress.value.startsWith('bbn1') && !searchAddress.value.startsWith('bbnvaloper1')) {
    searchError.value = 'Invalid address format. Must start with bbn1 or bbnvaloper1'
    return
  }
  
  isSearching.value = true
  searchError.value = ''
  
  try {
    const response = await $fetch<{ success: boolean; data: any; mock?: boolean }>('/api/compliance/analyze', {
      method: 'POST',
      body: { address: searchAddress.value },
    })
    
    if (response.success) {
      searchResult.value = response.data
      
      // Add to recent checks
      const check = {
        address: response.data.addressShort,
        addressFull: response.data.address,
        riskScore: response.data.riskScore,
        riskLevel: response.data.riskLevel,
        checkedAt: new Date().toLocaleTimeString(),
      }
      
      // Remove duplicate and add to front
      recentChecks.value = [
        check,
        ...recentChecks.value.filter(c => c.addressFull !== check.addressFull),
      ].slice(0, 10)
      
      // Save to localStorage
      localStorage.setItem('tephra_recent_compliance_checks', JSON.stringify(recentChecks.value))
    }
  } catch (e: any) {
    console.error('Failed to analyze address:', e)
    searchError.value = 'Failed to analyze address. Please try again.'
  } finally {
    isSearching.value = false
  }
}

// Computed stats from entities
const complianceStats = computed(() => ({
  totalEntities: knownEntities.value.length,
  activeEntities: knownEntities.value.filter(e => e.active).length,
  checksToday: recentChecks.value.length,
  lastScanTime: recentChecks.value.length > 0 ? recentChecks.value[0].checkedAt : 'Never',
}))
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <Icon name="mdi:shield-check" class="w-8 h-8 text-green-400" />
          <h1 class="text-2xl font-bold text-white">Compliance</h1>
          <div v-if="isMock" class="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <Icon name="mdi:database-off" class="w-3 h-3 text-yellow-400" />
            <span class="text-xs text-yellow-400">Demo</span>
          </div>
        </div>
        <p class="text-slate-400">Risk assessment and address screening</p>
      </div>
      
      <UiBadge variant="success" size="sm" dot pulse>
        Live Analysis
      </UiBadge>
    </div>
    
    <!-- Stats overview -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:server" class="w-6 h-6 text-primary-400 mx-auto mb-2" />
        <div class="text-2xl font-bold text-white">
          <UiSkeleton v-if="entitiesLoading" variant="text" width="40px" class="mx-auto" />
          <span v-else>{{ complianceStats.totalEntities }}</span>
        </div>
        <div class="text-xs text-slate-500">Known Entities</div>
      </UiCard>
      
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:check-circle" class="w-6 h-6 text-green-400 mx-auto mb-2" />
        <div class="text-2xl font-bold text-white">
          <UiSkeleton v-if="entitiesLoading" variant="text" width="40px" class="mx-auto" />
          <span v-else>{{ complianceStats.activeEntities }}</span>
        </div>
        <div class="text-xs text-slate-500">Active</div>
      </UiCard>
      
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:magnify" class="w-6 h-6 text-amber-400 mx-auto mb-2" />
        <div class="text-2xl font-bold text-white">{{ complianceStats.checksToday }}</div>
        <div class="text-xs text-slate-500">Checks Today</div>
      </UiCard>
      
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:clock" class="w-6 h-6 text-blue-400 mx-auto mb-2" />
        <div class="text-xl font-bold text-white">{{ complianceStats.lastScanTime }}</div>
        <div class="text-xs text-slate-500">Last Check</div>
      </UiCard>
    </div>
    
    <!-- Search section -->
    <UiCard variant="glass-primary" padding="lg" class="mb-8">
      <h2 class="text-lg font-semibold text-white mb-4">Risk Assessment</h2>
      <p class="text-sm text-slate-400 mb-6">
        Enter an address to check its risk score and compliance status.
      </p>
      
      <div class="flex gap-3">
        <UiInput 
          v-model="searchAddress"
          placeholder="Enter address (bbn1...)"
          class="flex-1"
          @keyup.enter="searchAddressRisk"
        />
        <UiButton 
          variant="primary" 
          :loading="isSearching"
          @click="searchAddressRisk"
        >
          <Icon name="mdi:shield-search" class="w-4 h-4 mr-2" />
          Check Risk
        </UiButton>
      </div>
      
      <!-- Error message -->
      <div v-if="searchError" class="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
        <Icon name="mdi:alert-circle" class="w-4 h-4 inline mr-2" />
        {{ searchError }}
      </div>
      
      <!-- Search Result -->
      <div v-if="searchResult" class="mt-6 p-6 rounded-xl bg-surface-800/50 border border-surface-700/50">
        <div class="flex items-start justify-between mb-6">
          <div>
            <code class="text-white font-mono text-lg">{{ searchResult.address }}</code>
            <p class="text-sm text-slate-500 mt-1">Checked: {{ searchResult.lastChecked }}</p>
          </div>
          
          <!-- Risk Score -->
          <div class="text-center">
            <div 
              :class="[
                'w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white',
                searchResult.riskColor.bg + '/20',
                'ring-4',
                searchResult.riskColor.bg.replace('bg-', 'ring-') + '/50'
              ]"
            >
              {{ searchResult.riskScore }}
            </div>
            <p :class="['text-sm font-medium mt-2', searchResult.riskColor.text]">
              {{ searchResult.riskLevel }}
            </p>
          </div>
        </div>
        
        <!-- Flags -->
        <div v-if="searchResult.flags.length > 0" class="mb-6">
          <h4 class="text-sm font-medium text-white mb-2">Flags</h4>
          <div class="space-y-2">
            <div 
              v-for="(flag, index) in searchResult.flags" 
              :key="index"
              :class="[
                'flex items-center gap-2 p-3 rounded-lg',
                flag.type === 'danger' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
              ]"
            >
              <Icon :name="flag.type === 'danger' ? 'mdi:alert-circle' : 'mdi:alert'" class="w-4 h-4" />
              <span class="text-sm">{{ flag.message }}</span>
            </div>
          </div>
        </div>
        
        <!-- Labels -->
        <div class="mb-6">
          <h4 class="text-sm font-medium text-white mb-2">Labels</h4>
          <div class="flex flex-wrap gap-2">
            <UiBadge v-for="label in searchResult.labels" :key="label" variant="neutral" size="sm">
              {{ label }}
            </UiBadge>
          </div>
        </div>
        
        <!-- Stats grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-3 rounded-lg bg-surface-700/30">
            <p class="text-xs text-slate-500">Balance</p>
            <p class="text-lg font-bold text-primary-400">{{ searchResult.metrics?.balance || '0.00' }} BBN</p>
          </div>
          <div class="p-3 rounded-lg bg-surface-700/30">
            <p class="text-xs text-slate-500">Transactions</p>
            <p class="text-lg font-bold text-white">{{ searchResult.metrics?.sequence || 0 }}</p>
          </div>
          <div class="p-3 rounded-lg bg-surface-700/30">
            <p class="text-xs text-slate-500">Account Type</p>
            <p class="text-lg font-bold text-white">{{ searchResult.metrics?.accountType || 'Unknown' }}</p>
          </div>
          <div class="p-3 rounded-lg bg-surface-700/30">
            <p class="text-xs text-slate-500">Activity Level</p>
            <p 
              :class="[
                'text-lg font-bold capitalize',
                searchResult.analysis?.activityLevel === 'high' ? 'text-amber-400' : 
                searchResult.analysis?.activityLevel === 'medium' ? 'text-blue-400' : 'text-slate-400'
              ]"
            >
              {{ searchResult.analysis?.activityLevel || 'unknown' }}
            </p>
          </div>
        </div>
        
        <!-- Analysis details -->
        <div class="mt-4 grid grid-cols-3 gap-4">
          <div class="flex items-center gap-2 p-2 rounded-lg bg-surface-700/30">
            <Icon 
              :name="searchResult.analysis?.isFinalityProvider ? 'mdi:check-circle' : 'mdi:close-circle'" 
              :class="searchResult.analysis?.isFinalityProvider ? 'text-green-400' : 'text-slate-500'"
              class="w-4 h-4"
            />
            <span class="text-sm text-slate-400">Finality Provider</span>
          </div>
          <div class="flex items-center gap-2 p-2 rounded-lg bg-surface-700/30">
            <Icon 
              :name="searchResult.analysis?.isValidator ? 'mdi:check-circle' : 'mdi:close-circle'" 
              :class="searchResult.analysis?.isValidator ? 'text-green-400' : 'text-slate-500'"
              class="w-4 h-4"
            />
            <span class="text-sm text-slate-400">Validator</span>
          </div>
          <div class="flex items-center gap-2 p-2 rounded-lg bg-surface-700/30">
            <Icon 
              :name="searchResult.analysis?.hasLabels ? 'mdi:check-circle' : 'mdi:close-circle'" 
              :class="searchResult.analysis?.hasLabels ? 'text-green-400' : 'text-slate-500'"
              class="w-4 h-4"
            />
            <span class="text-sm text-slate-400">Has Labels</span>
          </div>
        </div>
        
        <!-- Action buttons -->
        <div class="flex gap-3 mt-6 pt-6 border-t border-surface-700/50">
          <UiButton variant="outline" size="sm" @click="router.push(`/address/${searchResult.address}`)">
            <Icon name="mdi:open-in-new" class="w-4 h-4 mr-2" />
            View Address
          </UiButton>
          <UiButton variant="outline" size="sm">
            <Icon name="mdi:file-document" class="w-4 h-4 mr-2" />
            Export Report
          </UiButton>
        </div>
      </div>
    </UiCard>
    
    <!-- Main content grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Checks -->
      <UiCard variant="default" padding="none">
        <div class="p-6 border-b border-surface-700/50">
          <h2 class="text-lg font-semibold text-white">Recent Checks</h2>
        </div>
        
        <div class="divide-y divide-surface-700/50">
          <div
            v-for="check in recentChecks"
            :key="check.addressFull"
            class="p-4 hover:bg-surface-800/30 transition-colors cursor-pointer"
            @click="router.push(`/address/${check.addressFull}`)"
          >
            <div class="flex items-center justify-between">
              <div>
                <code class="text-white font-mono">{{ check.address }}</code>
                <p class="text-xs text-slate-500 mt-1">{{ check.checkedAt }}</p>
              </div>
              
              <div class="flex items-center gap-3">
                <div 
                  :class="[
                    'px-3 py-1.5 rounded-full text-xs font-medium',
                    getRiskColor(check.riskScore).bg + '/10',
                    getRiskColor(check.riskScore).text
                  ]"
                >
                  {{ check.riskLevel }}
                </div>
                <div 
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                    getRiskColor(check.riskScore).bg + '/20',
                    getRiskColor(check.riskScore).text
                  ]"
                >
                  {{ check.riskScore }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </UiCard>
      
      <!-- Known Entities -->
      <UiCard variant="default" padding="none">
        <div class="p-6 border-b border-surface-700/50">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-white">Known Entities</h2>
            <div class="flex items-center gap-2">
              <button 
                class="p-1 rounded hover:bg-surface-700/50 transition-colors"
                @click="fetchEntities"
                :disabled="entitiesLoading"
              >
                <Icon name="mdi:refresh" :class="['w-4 h-4 text-slate-400', entitiesLoading && 'animate-spin']" />
              </button>
              <UiBadge variant="neutral" size="sm">{{ knownEntities.length }} Tracked</UiBadge>
            </div>
          </div>
        </div>
        
        <!-- Loading state -->
        <div v-if="entitiesLoading" class="p-4 space-y-3">
          <div v-for="i in 4" :key="i" class="flex items-center gap-3">
            <UiSkeleton variant="custom" width="40px" height="40px" rounded="lg" />
            <div class="flex-1">
              <UiSkeleton variant="text" width="120px" class="mb-2" />
              <UiSkeleton variant="text" width="80px" height="12px" />
            </div>
          </div>
        </div>
        
        <div v-else class="divide-y divide-surface-700/50 max-h-[400px] overflow-y-auto">
          <div
            v-for="entity in knownEntities"
            :key="entity.address"
            class="p-4 hover:bg-surface-800/30 transition-colors cursor-pointer"
            @click="entity.address && router.push(`/address/${entity.address}`)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-surface-700/50">
                  <Icon :name="entity.icon" :class="['w-5 h-5', entity.iconColor]" />
                </div>
                <div>
                  <p class="text-white font-medium">{{ entity.name }}</p>
                  <p class="text-xs text-slate-500">{{ entity.type }}</p>
                  <code v-if="entity.addressShort" class="text-xs text-slate-600 font-mono">{{ entity.addressShort }}</code>
                </div>
              </div>
              
              <div class="text-right">
                <UiBadge 
                  :variant="entity.riskLevel === 'Verified' ? 'success' : entity.riskLevel === 'Jailed' || entity.riskLevel === 'Suspended' ? 'error' : 'warning'"
                  size="sm"
                >
                  {{ entity.riskLevel }}
                </UiBadge>
                <a 
                  v-if="entity.website" 
                  :href="entity.website" 
                  target="_blank"
                  class="block text-xs text-primary-400 hover:underline mt-1"
                  @click.stop
                >
                  Website
                </a>
              </div>
            </div>
          </div>
        </div>
      </UiCard>
    </div>
    
    <!-- Risk Legend -->
    <UiCard variant="default" padding="md" class="mt-6">
      <h3 class="text-sm font-medium text-white mb-4">Risk Score Legend</h3>
      <div class="flex flex-wrap gap-6">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded-full bg-green-500" />
          <span class="text-sm text-slate-400">0-19: Clean</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded-full bg-blue-500" />
          <span class="text-sm text-slate-400">20-49: Low Risk</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded-full bg-yellow-500" />
          <span class="text-sm text-slate-400">50-79: Medium Risk</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded-full bg-red-500" />
          <span class="text-sm text-slate-400">80-100: High Risk</span>
        </div>
      </div>
    </UiCard>
  </div>
</template>

