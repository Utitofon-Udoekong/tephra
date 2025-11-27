<script setup lang="ts">
interface Props {
  open?: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  title: '',
  size: 'md',
  closable: true,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const close = () => {
  if (props.closable) {
    emit('update:open', false)
  }
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

// Close on escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.open && props.closable) {
      close()
    }
  }
  document.addEventListener('keydown', handleEscape)
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="open" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="close"
        />
        
        <!-- Modal content -->
        <div 
          :class="[
            'relative w-full rounded-2xl bg-surface-900 border border-surface-700/50 shadow-2xl',
            sizeClasses[size]
          ]"
        >
          <!-- Header -->
          <div v-if="title || closable" class="flex items-center justify-between p-6 border-b border-surface-700/50">
            <h3 v-if="title" class="text-lg font-semibold text-white">{{ title }}</h3>
            <button 
              v-if="closable"
              class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-700/50 transition-colors ml-auto"
              @click="close"
            >
              <Icon name="mdi:close" class="w-5 h-5" />
            </button>
          </div>
          
          <!-- Body -->
          <div class="p-6">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: scale(0.95) translateY(10px);
}
</style>
