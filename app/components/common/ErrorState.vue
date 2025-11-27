<script setup lang="ts">
interface Props {
  title?: string
  message?: string
  icon?: string
  retryable?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Something went wrong',
  message: 'An unexpected error occurred. Please try again.',
  icon: 'mdi:alert-circle-outline',
  retryable: true,
  compact: false,
})

const emit = defineEmits<{
  retry: []
}>()
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
        'flex items-center justify-center rounded-full bg-red-500/10 mb-4',
        compact ? 'w-12 h-12' : 'w-16 h-16'
      ]"
    >
      <Icon 
        :name="icon" 
        :class="[
          'text-red-400',
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
    
    <!-- Custom content slot -->
    <slot />
    
    <!-- Retry button -->
    <UiButton 
      v-if="retryable"
      variant="outline"
      :size="compact ? 'sm' : 'md'"
      class="mt-6"
      @click="$emit('retry')"
    >
      <Icon name="mdi:refresh" class="w-4 h-4" />
      Try Again
    </UiButton>
  </div>
</template>

