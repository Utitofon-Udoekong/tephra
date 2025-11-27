<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
  pulse?: boolean
  removable?: boolean
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  size: 'md',
  dot: false,
  pulse: false,
  removable: false,
})

const emit = defineEmits<{
  remove: []
}>()

const variantClasses = {
  primary: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
  success: 'bg-green-500/10 text-green-400 border-green-500/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  neutral: 'bg-surface-700/50 text-slate-400 border-surface-600/50',
}

const dotColors = {
  primary: 'bg-primary-400',
  success: 'bg-green-400',
  warning: 'bg-yellow-400',
  error: 'bg-red-400',
  info: 'bg-blue-400',
  neutral: 'bg-slate-400',
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
}

const computedClasses = computed(() => {
  const base = 'inline-flex items-center gap-1.5 rounded-full font-medium border'
  const variant = variantClasses[props.variant]
  const size = sizeClasses[props.size]
  
  return [base, variant, size].join(' ')
})
</script>

<template>
  <span :class="computedClasses">
    <!-- Status dot -->
    <span 
      v-if="dot" 
      class="w-1.5 h-1.5 rounded-full"
      :class="[dotColors[variant], pulse ? 'animate-pulse' : '']"
    />
    
    <!-- Icon -->
    <Icon v-if="icon" :name="icon" class="w-3.5 h-3.5" />
    
    <!-- Content -->
    <slot />
    
    <!-- Remove button -->
    <button
      v-if="removable"
      class="ml-0.5 -mr-1 p-0.5 rounded-full hover:bg-white/10 transition-colors"
      @click="$emit('remove')"
    >
      <Icon name="mdi:close" class="w-3 h-3" />
    </button>
  </span>
</template>

