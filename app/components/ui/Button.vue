<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  iconOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  fullWidth: false,
  iconOnly: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const variantClasses = {
  primary: `
    bg-gradient-to-r from-primary-500 via-primary-500 to-primary-600 
    text-white shadow-lg shadow-primary-500/25
    hover:from-primary-400 hover:via-primary-500 hover:to-primary-500
    hover:shadow-xl hover:shadow-primary-500/30
    focus:ring-primary-500
  `,
  secondary: `
    bg-surface-800 text-slate-200 
    border border-surface-600
    hover:bg-surface-700 hover:border-surface-500
    focus:ring-surface-500
  `,
  ghost: `
    text-slate-300 
    hover:bg-surface-800 hover:text-white
    focus:ring-surface-500
  `,
  outline: `
    bg-transparent text-primary-400 
    border border-primary-500/30
    hover:bg-primary-500/10 hover:border-primary-500/50 hover:text-primary-300
    focus:ring-primary-500
  `,
  danger: `
    bg-red-600 text-white 
    hover:bg-red-500
    focus:ring-red-500
  `,
}

const sizeClasses = {
  xs: 'px-2.5 py-1.5 text-xs rounded-lg gap-1',
  sm: 'px-3 py-2 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2',
  xl: 'px-8 py-4 text-lg rounded-2xl gap-2.5',
}

const iconOnlySizes = {
  xs: 'p-1.5',
  sm: 'p-2',
  md: 'p-2.5',
  lg: 'p-3',
  xl: 'p-4',
}

const computedClasses = computed(() => {
  const base = `
    inline-flex items-center justify-center 
    font-semibold transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2 
    focus:ring-offset-surface-900
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98]
  `
  const variant = variantClasses[props.variant]
  const size = props.iconOnly ? iconOnlySizes[props.size] : sizeClasses[props.size]
  const width = props.fullWidth ? 'w-full' : ''
  const rounded = props.iconOnly ? 'rounded-xl' : ''
  
  return [base, variant, size, width, rounded].join(' ')
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :class="computedClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <!-- Loading spinner -->
    <span v-if="loading" class="animate-spin">
      <Icon name="mdi:loading" class="w-4 h-4" />
    </span>
    
    <!-- Button content -->
    <slot v-else />
  </button>
</template>

