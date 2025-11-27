<script setup lang="ts">
interface Props {
  variant?: 'default' | 'glass' | 'glass-dark' | 'glass-primary' | 'glow'
  hover?: boolean
  interactive?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  hover: false,
  interactive: false,
  padding: 'md',
})

const variantClasses = {
  default: 'bg-surface-900/80 border border-surface-700/50',
  glass: 'glass',
  'glass-dark': 'glass-dark',
  'glass-primary': 'glass-primary',
  glow: 'card-glow',
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
}

const computedClasses = computed(() => {
  const base = 'rounded-2xl transition-all duration-300'
  const variant = variantClasses[props.variant]
  const padding = paddingClasses[props.padding]
  const hover = props.hover ? 'hover:border-surface-600/50 hover:shadow-lg hover:shadow-primary-500/5' : ''
  const interactive = props.interactive ? 'cursor-pointer hover:translate-y-[-2px] active:translate-y-0' : ''
  
  return [base, variant, padding, hover, interactive].join(' ')
})
</script>

<template>
  <div :class="computedClasses">
    <slot />
  </div>
</template>

