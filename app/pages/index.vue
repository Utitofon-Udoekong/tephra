<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const router = useRouter()

// Network stats - fetched from API
const stats = ref({
  blockHeight: 0,
  totalValidators: 0,
  bondedTokens: '0',
  chainId: 'bbn-test-6',
})

const statsLoading = ref(true)

// Fetch real network stats
const fetchStats = async () => {
  statsLoading.value = true
  try {
    const response = await $fetch<{ success: boolean; data: any }>('/api/blockchain/stats')
    if (response.success) {
      stats.value = {
        blockHeight: response.data.latestBlock?.height || 0,
        totalValidators: response.data.totalValidators || 0,
        bondedTokens: response.data.bondedTokens || '0',
        chainId: response.data.chainId || 'bbn-test-6',
      }
    }
  } catch (e) {
    console.error('Failed to fetch stats:', e)
  } finally {
    statsLoading.value = false
  }
}

onMounted(() => {
  fetchStats()
})

// Format bonded tokens for display
const formattedBondedTokens = computed(() => {
  const value = parseInt(stats.value.bondedTokens) / 1000000
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toFixed(0)
})

const features = [
  {
    icon: 'mdi:chart-timeline-variant',
    title: 'Real-Time Analytics',
    description: 'Monitor blockchain activity with live updates and comprehensive metrics dashboards.',
    gradient: 'from-primary-500/10',
    iconColor: 'text-primary-400',
    borderColor: 'border-primary-500/20',
    hoverBorder: 'hover:border-primary-500/40',
    glowColor: 'bg-primary-500/10',
  },
  {
    icon: 'mdi:wallet-outline',
    title: 'Address Intelligence',
    description: 'Enrich and label addresses with heuristics-based classification and behavior analysis.',
    gradient: 'from-amber-500/10',
    iconColor: 'text-amber-400',
    borderColor: 'border-amber-500/20',
    hoverBorder: 'hover:border-amber-500/40',
    glowColor: 'bg-amber-500/10',
  },
  {
    icon: 'mdi:trending-up',
    title: 'Smart Money Tracking',
    description: 'Identify and follow sophisticated on-chain actors and whale movements.',
    gradient: 'from-orange-500/10',
    iconColor: 'text-orange-400',
    borderColor: 'border-orange-500/20',
    hoverBorder: 'hover:border-orange-500/40',
    glowColor: 'bg-orange-500/10',
  },
]

const babylonFeatures = [
  {
    icon: 'mdi:bitcoin',
    title: 'BTC Staking Analytics',
    description: 'Track Bitcoin staking delegations and finality provider performance.',
  },
  {
    icon: 'mdi:clock-check',
    title: 'Epoch Monitoring',
    description: 'Real-time epoch progression and checkpoint verification.',
  },
  {
    icon: 'mdi:shield-check',
    title: 'Compliance Tools',
    description: 'Transaction tracing and investigation support for compliance.',
  },
]

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const handleGetStarted = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div>
    <!-- Header -->
    <LayoutHeader :transparent="true" />
    
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-6xl pt-24">
      <!-- Hero Section -->
      <div class="text-center mb-20">
        <div class="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-primary-500/10 border border-primary-500/20 rounded-full">
          <div class="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
          <span class="text-primary-400 text-sm font-medium">On-Chain Analytics Track</span>
        </div>
        
        <h1 class="text-6xl sm:text-7xl lg:text-8xl font-extrabold mb-6 tracking-tight">
          <span class="text-gradient-primary">
            Tephra
          </span>
        </h1>
        
        <p class="text-xl sm:text-2xl text-slate-300 mb-4 font-medium">
          On-Chain Analytics for Babylon Genesis
        </p>
        
        <p class="text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Production-ready blockchain analytics solution. Track addresses, portfolios, 
          smart money movements, and on-chain metrics with real-time insights.
        </p>
        
        <div class="flex gap-4 justify-center flex-wrap">
          <button
            class="group relative px-8 py-4 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            @click="handleGetStarted"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-primary-500 via-primary-500 to-primary-600" />
            <div class="absolute inset-0 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <span class="relative flex items-center gap-2">
              Get Started
              <Icon name="mdi:arrow-right" />
            </span>
          </button>
          
          <NuxtLink to="/login">
            <button class="px-8 py-4 rounded-xl font-semibold border border-surface-700/50 text-slate-300 hover:border-primary-500/30 hover:text-primary-400 hover:bg-primary-500/5 transition-all duration-300">
              <span class="flex items-center gap-2">
                <Icon name="mdi:login" />
                Sign In
              </span>
            </button>
          </NuxtLink>
        </div>
      </div>
      
      <!-- Features -->
      <section class="mb-20">
        <div class="text-center mb-10">
          <h2 class="text-2xl font-bold text-white mb-2">Powerful Analytics</h2>
          <p class="text-slate-400">Comprehensive tools for blockchain intelligence</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="feature in features"
            :key="feature.title"
            :class="[
              'group relative overflow-hidden rounded-2xl bg-gradient-to-br via-surface-900 to-surface-900 p-8 transition-all duration-300 hover:shadow-lg',
              feature.gradient,
              feature.borderColor,
              feature.hoverBorder,
              'border'
            ]"
          >
            <div 
              :class="[
                'absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-100 opacity-50 transition-opacity',
                feature.glowColor
              ]" 
            />
            <div class="relative text-center">
              <div 
                :class="[
                  'inline-flex items-center justify-center w-16 h-16 rounded-2xl ring-1 mb-6',
                  feature.glowColor.replace('/10', '/20'),
                  feature.borderColor.replace('border-', 'ring-').replace('/20', '/30')
                ]"
              >
                <Icon :name="feature.icon" :class="['text-3xl', feature.iconColor]" />
              </div>
              <h3 class="text-xl font-bold mb-3 text-white">{{ feature.title }}</h3>
              <p class="text-slate-400 leading-relaxed">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Statistics -->
      <section class="mb-20">
        <div class="text-center mb-10">
          <div class="flex items-center justify-center gap-2 mb-2">
            <h2 class="text-2xl font-bold text-white">Network Overview</h2>
            <div v-if="!statsLoading" class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
              <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span class="text-xs text-green-400 font-medium">Live</span>
            </div>
          </div>
          <p class="text-slate-400">Real-time metrics from Babylon Genesis ({{ stats.chainId }})</p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <UiCard variant="default" hover class="text-center">
            <div class="flex items-center justify-center gap-2 mb-2">
              <Icon name="mdi:cube-outline" class="text-2xl text-primary-400" />
            </div>
            <div class="text-3xl font-bold text-white mb-1 font-mono-nums">
              <UiSkeleton v-if="statsLoading" variant="text" class="mx-auto w-24" />
              <span v-else>{{ formatNumber(stats.blockHeight) }}</span>
            </div>
            <div class="text-sm text-slate-400 font-medium">Block Height</div>
          </UiCard>
          
          <UiCard variant="default" hover class="text-center">
            <div class="flex items-center justify-center gap-2 mb-2">
              <Icon name="mdi:server" class="text-2xl text-green-400" />
            </div>
            <div class="text-3xl font-bold text-white mb-1 font-mono-nums">
              <UiSkeleton v-if="statsLoading" variant="text" class="mx-auto w-16" />
              <span v-else>{{ stats.totalValidators }}</span>
            </div>
            <div class="text-sm text-slate-400 font-medium">Validators</div>
          </UiCard>
          
          <UiCard variant="default" hover class="text-center">
            <div class="flex items-center justify-center gap-2 mb-2">
              <Icon name="mdi:lock" class="text-2xl text-amber-400" />
            </div>
            <div class="text-3xl font-bold text-white mb-1 font-mono-nums">
              <UiSkeleton v-if="statsLoading" variant="text" class="mx-auto w-20" />
              <span v-else>{{ formattedBondedTokens }}</span>
            </div>
            <div class="text-sm text-slate-400 font-medium">Bonded BBN</div>
          </UiCard>
          
          <UiCard variant="default" hover class="text-center">
            <div class="flex items-center justify-center gap-2 mb-2">
              <Icon name="mdi:clock" class="text-2xl text-orange-400" />
            </div>
            <div class="text-3xl font-bold text-white mb-1 font-mono-nums">
              ~6s
            </div>
            <div class="text-sm text-slate-400 font-medium">Block Time</div>
          </UiCard>
        </div>
      </section>
      
      <!-- Babylon Features -->
      <section class="mb-20">
        <div class="text-center mb-10">
          <h2 class="text-2xl font-bold text-white mb-2">Built for Babylon</h2>
          <p class="text-slate-400">Native support for Babylon Genesis chain features</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="feature in babylonFeatures"
            :key="feature.title"
            class="p-6 rounded-xl bg-surface-800/30 border border-surface-700/50 hover:border-surface-600/50 transition-colors"
          >
            <Icon :name="feature.icon" class="text-2xl text-primary-400 mb-4" />
            <h3 class="font-semibold text-white mb-2">{{ feature.title }}</h3>
            <p class="text-sm text-slate-400">{{ feature.description }}</p>
          </div>
        </div>
      </section>
      
      <!-- CTA Section -->
      <section class="mb-16">
        <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500/10 via-amber-500/10 to-orange-500/10 border border-primary-500/20 p-10 text-center">
          <div class="absolute top-0 left-1/4 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl" />
          <div class="absolute bottom-0 right-1/4 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />
          
          <div class="relative">
            <h2 class="text-3xl font-bold text-white mb-3">Ready to explore?</h2>
            <p class="text-slate-400 mb-6 max-w-xl mx-auto">
              Start analyzing on-chain data with powerful tools and real-time insights.
            </p>
            <div class="flex gap-4 justify-center flex-wrap">
              <UiButton size="lg" @click="handleGetStarted">
                <Icon name="mdi:rocket-launch" class="mr-2" />
                Launch Dashboard
              </UiButton>
              <NuxtLink to="/address">
                <UiButton variant="outline" size="lg">
                  <Icon name="mdi:magnify" class="mr-2" />
                  Explore Addresses
                </UiButton>
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Footer -->
      <LayoutFooter compact />
    </div>
  </div>
</template>

