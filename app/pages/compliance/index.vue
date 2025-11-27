<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

// Search state
const searchAddress = ref('')
const searchResult = ref<any>(null)
const isSearching = ref(false)

// Risk score color mapping
const getRiskColor = (score: number) => {
  if (score >= 80) return { bg: 'bg-red-500', text: 'text-red-400', label: 'High Risk' }
  if (score >= 50) return { bg: 'bg-yellow-500', text: 'text-yellow-400', label: 'Medium Risk' }
  if (score >= 20) return { bg: 'bg-blue-500', text: 'text-blue-400', label: 'Low Risk' }
  return { bg: 'bg-green-500', text: 'text-green-400', label: 'Clean' }
}

// Mock search function
const searchAddressRisk = async () => {
  if (!searchAddress.value) return
  
  isSearching.value = true
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Generate mock result based on address
  const riskScore = Math.floor(Math.random() * 100)
  const riskInfo = getRiskColor(riskScore)
  
  searchResult.value = {
    address: searchAddress.value,
    riskScore,
    riskLevel: riskInfo.label,
    riskColor: riskInfo,
    lastChecked: new Date().toLocaleString(),
    flags: riskScore >= 50 ? [
      { type: 'warning', message: 'Associated with high-volume trading patterns' },
      ...(riskScore >= 80 ? [{ type: 'danger', message: 'Linked to flagged addresses' }] : []),
    ] : [],
    labels: ['Whale', 'Active Trader'],
    transactions: {
      total: Math.floor(Math.random() * 10000) + 100,
      last30Days: Math.floor(Math.random() * 500) + 50,
    },
    volume: {
      total: '$' + (Math.random() * 10 + 1).toFixed(2) + 'M',
      last30Days: '$' + (Math.random() * 1 + 0.1).toFixed(2) + 'M',
    },
    connections: {
      exchanges: Math.floor(Math.random() * 5) + 1,
      flaggedAddresses: riskScore >= 50 ? Math.floor(Math.random() * 3) + 1 : 0,
    },
  }
  
  isSearching.value = false
}

// Recent checks
const recentChecks = ref([
  {
    address: 'bbn1whale...abc',
    addressFull: 'bbn1whaletrader123abc',
    riskScore: 15,
    riskLevel: 'Clean',
    checkedAt: '10 mins ago',
  },
  {
    address: 'bbn1smart...def',
    addressFull: 'bbn1smartmoney456def',
    riskScore: 42,
    riskLevel: 'Low Risk',
    checkedAt: '1 hour ago',
  },
  {
    address: 'bbn1anon...ghi',
    addressFull: 'bbn1anonymous789ghi',
    riskScore: 78,
    riskLevel: 'Medium Risk',
    checkedAt: '2 hours ago',
  },
])

// Compliance stats
const complianceStats = ref({
  addressesChecked: '12,458',
  flaggedAddresses: '234',
  averageRiskScore: '23',
  lastScanTime: '2 mins ago',
})

// Known entities
const knownEntities = ref([
  {
    name: 'Babylon Foundation',
    type: 'Foundation',
    addresses: 3,
    riskLevel: 'Verified',
    icon: 'mdi:shield-check',
    iconColor: 'text-green-400',
  },
  {
    name: 'Major Exchange A',
    type: 'Exchange',
    addresses: 12,
    riskLevel: 'Verified',
    icon: 'mdi:bank',
    iconColor: 'text-blue-400',
  },
  {
    name: 'Staking Provider X',
    type: 'Validator',
    addresses: 2,
    riskLevel: 'Verified',
    icon: 'mdi:server',
    iconColor: 'text-purple-400',
  },
  {
    name: 'Unknown Entity',
    type: 'Unknown',
    addresses: 1,
    riskLevel: 'Suspicious',
    icon: 'mdi:alert',
    iconColor: 'text-yellow-400',
  },
])

const router = useRouter()
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <Icon name="mdi:shield-check" class="w-8 h-8 text-green-400" />
          <h1 class="text-2xl font-bold text-white">Compliance</h1>
        </div>
        <p class="text-slate-400">Risk assessment and address screening</p>
      </div>
      
      <UiBadge variant="success" size="sm" dot pulse>
        Live Scanning
      </UiBadge>
    </div>
    
    <!-- Stats overview -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:magnify" class="w-6 h-6 text-primary-400 mx-auto mb-2" />
        <div class="text-2xl font-bold text-white">{{ complianceStats.addressesChecked }}</div>
        <div class="text-xs text-slate-500">Addresses Checked</div>
      </UiCard>
      
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:flag" class="w-6 h-6 text-red-400 mx-auto mb-2" />
        <div class="text-2xl font-bold text-white">{{ complianceStats.flaggedAddresses }}</div>
        <div class="text-xs text-slate-500">Flagged</div>
      </UiCard>
      
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:chart-arc" class="w-6 h-6 text-green-400 mx-auto mb-2" />
        <div class="text-2xl font-bold text-white">{{ complianceStats.averageRiskScore }}</div>
        <div class="text-xs text-slate-500">Avg Risk Score</div>
      </UiCard>
      
      <UiCard variant="default" padding="md" class="text-center">
        <Icon name="mdi:clock" class="w-6 h-6 text-blue-400 mx-auto mb-2" />
        <div class="text-xl font-bold text-white">{{ complianceStats.lastScanTime }}</div>
        <div class="text-xs text-slate-500">Last Scan</div>
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
            <p class="text-xs text-slate-500">Total Txs</p>
            <p class="text-lg font-bold text-white">{{ searchResult.transactions.total.toLocaleString() }}</p>
          </div>
          <div class="p-3 rounded-lg bg-surface-700/30">
            <p class="text-xs text-slate-500">30d Txs</p>
            <p class="text-lg font-bold text-white">{{ searchResult.transactions.last30Days }}</p>
          </div>
          <div class="p-3 rounded-lg bg-surface-700/30">
            <p class="text-xs text-slate-500">Total Volume</p>
            <p class="text-lg font-bold text-white">{{ searchResult.volume.total }}</p>
          </div>
          <div class="p-3 rounded-lg bg-surface-700/30">
            <p class="text-xs text-slate-500">Flagged Connections</p>
            <p 
              :class="[
                'text-lg font-bold',
                searchResult.connections.flaggedAddresses > 0 ? 'text-red-400' : 'text-green-400'
              ]"
            >
              {{ searchResult.connections.flaggedAddresses }}
            </p>
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
            <UiBadge variant="neutral" size="sm">{{ knownEntities.length }} Tracked</UiBadge>
          </div>
        </div>
        
        <div class="divide-y divide-surface-700/50">
          <div
            v-for="entity in knownEntities"
            :key="entity.name"
            class="p-4 hover:bg-surface-800/30 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-surface-700/50">
                  <Icon :name="entity.icon" :class="['w-5 h-5', entity.iconColor]" />
                </div>
                <div>
                  <p class="text-white font-medium">{{ entity.name }}</p>
                  <p class="text-xs text-slate-500">{{ entity.type }} • {{ entity.addresses }} addresses</p>
                </div>
              </div>
              
              <UiBadge 
                :variant="entity.riskLevel === 'Verified' ? 'success' : 'warning'"
                size="sm"
              >
                {{ entity.riskLevel }}
              </UiBadge>
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

