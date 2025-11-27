<script setup lang="ts">
interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'slate'
  label?: string
  fullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary',
  fullscreen: false,
})

const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
}

const colorClasses = {
  primary: 'text-primary-500',
  white: 'text-white',
  slate: 'text-slate-400',
}

const textSizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
}
</script>

<template>
  <div 
    :class="[
      'flex flex-col items-center justify-center gap-3',
      fullscreen ? 'fixed inset-0 bg-surface-950/80 backdrop-blur-sm z-50' : ''
    ]"
  >
    <!-- Spinner -->
    <div :class="[sizeClasses[size], colorClasses[color]]">
      <svg 
        class="animate-spin" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          class="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          stroke-width="4"
        />
        <path 
          class="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
    
    <!-- Label -->
    <span 
      v-if="label" 
      :class="[textSizeClasses[size], 'text-slate-400 font-medium']"
    >
      {{ label }}
    </span>
  </div>
</template>

