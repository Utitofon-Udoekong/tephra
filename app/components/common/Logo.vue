<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showText: true,
  animated: true,
})

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12',
}

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
}
</script>

<template>
  <div class="flex items-center gap-3">
    <!-- Logo Icon -->
    <div 
      class="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/25"
      :class="[sizeClasses[size], animated ? 'hover:shadow-xl hover:shadow-primary-500/30 transition-shadow' : '']"
    >
      <!-- Inner glow -->
      <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-400/20 to-transparent" />
      
      <!-- Icon -->
      <Icon 
        name="mdi:chart-timeline-variant-shimmer" 
        class="relative text-white" 
        :class="{
          'w-3.5 h-3.5': size === 'sm',
          'w-5 h-5': size === 'md',
          'w-6 h-6': size === 'lg',
          'w-7 h-7': size === 'xl',
        }"
      />
    </div>
    
    <!-- Logo Text -->
    <span 
      v-if="showText" 
      class="font-bold tracking-tight text-gradient-primary"
      :class="textSizeClasses[size]"
    >
      Tephra
    </span>
  </div>
</template>

