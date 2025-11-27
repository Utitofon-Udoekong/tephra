<script setup lang="ts">
interface Props {
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'url'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  error?: string
  label?: string
  hint?: string
  icon?: string
  iconPosition?: 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  iconPosition: 'left',
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const sizeClasses = {
  sm: 'px-3 py-2 text-sm rounded-lg',
  md: 'px-4 py-3 text-sm rounded-xl',
  lg: 'px-5 py-4 text-base rounded-xl',
}

const iconSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

const inputPaddingWithIcon = computed(() => {
  if (!props.icon) return ''
  return props.iconPosition === 'left' ? 'pl-11' : 'pr-11'
})

const inputClasses = computed(() => {
  const base = `
    w-full bg-surface-800/50 border 
    text-slate-200 placeholder-slate-500
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary-500/50 
    focus:border-primary-500/50 focus:bg-surface-800
  `
  const size = sizeClasses[props.size]
  const border = props.error ? 'border-red-500/50' : 'border-surface-600/50'
  const padding = inputPaddingWithIcon.value
  const state = props.disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  return [base, size, border, padding, state].join(' ')
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="w-full">
    <!-- Label -->
    <label v-if="label" class="block text-sm font-medium text-slate-300 mb-2">
      {{ label }}
    </label>
    
    <!-- Input wrapper -->
    <div class="relative">
      <!-- Left icon -->
      <div 
        v-if="icon && iconPosition === 'left'"
        class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
      >
        <Icon :name="icon" :class="iconSizeClasses[size]" />
      </div>
      
      <!-- Input -->
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :class="inputClasses"
        @input="handleInput"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      />
      
      <!-- Right icon -->
      <div 
        v-if="icon && iconPosition === 'right'"
        class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
      >
        <Icon :name="icon" :class="iconSizeClasses[size]" />
      </div>
    </div>
    
    <!-- Error message -->
    <p v-if="error" class="mt-2 text-sm text-red-400">
      {{ error }}
    </p>
    
    <!-- Hint -->
    <p v-else-if="hint" class="mt-2 text-sm text-slate-500">
      {{ hint }}
    </p>
  </div>
</template>

