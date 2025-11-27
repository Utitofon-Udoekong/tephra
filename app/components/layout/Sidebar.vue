<script setup lang="ts">
interface NavItem {
  label: string
  to: string
  icon: string
  badge?: string | number
}

interface NavGroup {
  title?: string
  items: NavItem[]
}

interface Props {
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
})

const emit = defineEmits<{
  'update:collapsed': [value: boolean]
}>()

const navGroups: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: 'mdi:view-dashboard' },
      { label: 'Analytics', to: '/dashboard/analytics', icon: 'mdi:chart-line' },
      { label: 'Metrics', to: '/dashboard/metrics', icon: 'mdi:chart-box' },
    ],
  },
  {
    title: 'Explorer',
    items: [
      { label: 'Addresses', to: '/address', icon: 'mdi:wallet' },
      { label: 'Transactions', to: '/transactions', icon: 'mdi:swap-horizontal' },
      { label: 'Blocks', to: '/blocks', icon: 'mdi:cube-outline' },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      { label: 'Smart Money', to: '/smart-money', icon: 'mdi:trending-up', badge: 'New' },
      { label: 'Portfolio', to: '/portfolio', icon: 'mdi:briefcase' },
      { label: 'Compliance', to: '/compliance', icon: 'mdi:shield-check' },
    ],
  },
  {
    title: 'Babylon',
    items: [
      { label: 'BTC Staking', to: '/babylon/staking', icon: 'mdi:bitcoin' },
      { label: 'Finality Providers', to: '/babylon/finality', icon: 'mdi:server' },
    ],
  },
]

const toggleCollapsed = () => {
  emit('update:collapsed', !props.collapsed)
}
</script>

<template>
  <aside 
    :class="[
      'fixed left-0 top-16 bottom-0 z-30 bg-surface-900/95 backdrop-blur-xl border-r border-surface-800/50 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    ]"
  >
    <div class="flex flex-col h-full">
      <!-- Collapse toggle -->
      <button
        class="absolute -right-3 top-6 z-10 p-1.5 rounded-full bg-surface-800 border border-surface-700/50 text-slate-400 hover:text-white hover:border-surface-600 transition-colors"
        @click="toggleCollapsed"
      >
        <Icon 
          :name="collapsed ? 'mdi:chevron-right' : 'mdi:chevron-left'" 
          class="w-4 h-4" 
        />
      </button>
      
      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-4 no-scrollbar">
        <div 
          v-for="(group, groupIndex) in navGroups" 
          :key="groupIndex"
          :class="groupIndex > 0 ? 'mt-6' : ''"
        >
          <!-- Group title -->
          <h3 
            v-if="group.title && !collapsed"
            class="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            {{ group.title }}
          </h3>
          
          <!-- Divider for collapsed state -->
          <div v-else-if="group.title && collapsed" class="mx-3 my-2 border-t border-surface-700/50" />
          
          <!-- Nav items -->
          <div class="space-y-1 px-2">
            <NuxtLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              :class="[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                'text-slate-400 hover:text-white hover:bg-surface-800/50',
                collapsed ? 'justify-center' : ''
              ]"
              active-class="!text-primary-400 bg-primary-500/10 hover:bg-primary-500/15"
            >
              <Icon :name="item.icon" class="w-5 h-5 flex-shrink-0" />
              <span v-if="!collapsed" class="flex-1">{{ item.label }}</span>
              <UiBadge 
                v-if="item.badge && !collapsed" 
                variant="primary" 
                size="sm"
              >
                {{ item.badge }}
              </UiBadge>
            </NuxtLink>
          </div>
        </div>
      </nav>
      
      <!-- Bottom section -->
      <div class="p-2 border-t border-surface-800/50">
        <NuxtLink
          to="/settings"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
            'text-slate-400 hover:text-white hover:bg-surface-800/50',
            collapsed ? 'justify-center' : ''
          ]"
        >
          <Icon name="mdi:cog" class="w-5 h-5" />
          <span v-if="!collapsed">Settings</span>
        </NuxtLink>
      </div>
    </div>
  </aside>
</template>

