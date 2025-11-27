<script setup lang="ts">
interface Props {
  variant?: 'text' | 'title' | 'avatar' | 'card' | 'custom'
  width?: string
  height?: string
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  animate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
  rounded: 'md',
  animate: true,
})

const variantClasses = {
  text: 'h-4 w-full',
  title: 'h-6 w-3/4',
  avatar: 'w-10 h-10 rounded-full',
  card: 'h-32 w-full rounded-2xl',
  custom: '',
}

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
}

const computedClasses = computed(() => {
  const base = 'bg-surface-700/50'
  const variant = variantClasses[props.variant]
  const rounded = props.variant === 'avatar' ? '' : roundedClasses[props.rounded]
  const animation = props.animate ? 'animate-pulse' : ''
  
  return [base, variant, rounded, animation].join(' ')
})

const computedStyles = computed(() => ({
  width: props.width,
  height: props.height,
}))
</script>

<template>
  <div :class="computedClasses" :style="computedStyles" />
</template>

