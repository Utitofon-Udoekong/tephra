<script setup lang="ts">
interface Props {
  title?: string
  message?: string
  icon?: string
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'No data found',
  message: 'There is no data to display at the moment.',
  icon: 'mdi:inbox-outline',
  compact: false,
})
</script>

<template>
  <div 
    :class="[
      'flex flex-col items-center justify-center text-center',
      compact ? 'py-8 px-4' : 'py-16 px-6'
    ]"
  >
    <!-- Icon -->
    <div 
      :class="[
        'flex items-center justify-center rounded-full bg-surface-700/50 mb-4',
        compact ? 'w-12 h-12' : 'w-16 h-16'
      ]"
    >
      <Icon 
        :name="icon" 
        :class="[
          'text-slate-500',
          compact ? 'w-6 h-6' : 'w-8 h-8'
        ]" 
      />
    </div>
    
    <!-- Title -->
    <h3 
      :class="[
        'font-semibold text-white mb-2',
        compact ? 'text-base' : 'text-lg'
      ]"
    >
      {{ title }}
    </h3>
    
    <!-- Message -->
    <p 
      :class="[
        'text-slate-400 max-w-md',
        compact ? 'text-sm' : 'text-base'
      ]"
    >
      {{ message }}
    </p>
    
    <!-- Action slot -->
    <div v-if="$slots.action" class="mt-6">
      <slot name="action" />
    </div>
  </div>
</template>

