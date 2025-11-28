<script setup lang="ts">
interface Props {
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
})

const currentYear = new Date().getFullYear()

const links = [
  { label: 'GitHub', href: 'https://github.com/Utitofon-Udoekong/tephra', external: true },
]

const socialLinks = [
  { icon: 'mdi:github', href: 'https://github.com/Utitofon-Udoekong/tephra', label: 'GitHub' },
]
</script>

<template>
  <footer 
    :class="[
      'border-t border-surface-800/50',
      compact ? 'py-6' : 'py-12'
    ]"
  >
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Compact footer -->
      <div v-if="compact" class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm text-slate-500">
          Built for AWS Global Vibe Hackathon 2025 • On-Chain Analytics Track
        </p>
        <div class="flex items-center gap-4">
          <a
            v-for="social in socialLinks"
            :key="social.label"
            :href="social.href"
            target="_blank"
            rel="noopener noreferrer"
            class="text-slate-500 hover:text-primary-400 transition-colors"
            :aria-label="social.label"
          >
            <Icon :name="social.icon" class="w-5 h-5" />
          </a>
        </div>
      </div>
      
      <!-- Full footer -->
      <div v-else class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="md:col-span-2">
          <CommonLogo size="md" class="mb-4" />
          <p class="text-sm text-slate-400 max-w-sm mb-6">
            Production-ready on-chain analytics solution for the Babylon Genesis blockchain. 
            Track addresses, portfolios, smart money, and on-chain metrics.
          </p>
          <div class="flex items-center gap-4">
            <a
              v-for="social in socialLinks"
              :key="social.label"
              :href="social.href"
              target="_blank"
              rel="noopener noreferrer"
              class="p-2 rounded-lg text-slate-500 hover:text-primary-400 hover:bg-surface-800/50 transition-colors"
              :aria-label="social.label"
            >
              <Icon :name="social.icon" class="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <!-- Links -->
        <div>
          <h4 class="text-sm font-semibold text-white mb-4">Resources</h4>
          <ul class="space-y-3">
            <li v-for="link in links" :key="link.label">
              <a
                :href="link.href"
                :target="link.external ? '_blank' : undefined"
                :rel="link.external ? 'noopener noreferrer' : undefined"
                class="text-sm text-slate-400 hover:text-primary-400 transition-colors inline-flex items-center gap-1"
              >
                {{ link.label }}
                <Icon v-if="link.external" name="mdi:open-in-new" class="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>
        
        <!-- Network status -->
        <div>
          <h4 class="text-sm font-semibold text-white mb-4">Network</h4>
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span class="text-sm text-slate-400">Babylon Testnet</span>
            </div>
            <p class="text-xs text-slate-500">
              Chain ID: bbn-test-6
            </p>
          </div>
        </div>
      </div>
      
      <!-- Copyright -->
      <div 
        v-if="!compact" 
        class="mt-12 pt-8 border-t border-surface-800/50 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <p class="text-sm text-slate-500">
          © {{ currentYear }} Tephra. Built for AWS Global Vibe Hackathon 2025.
        </p>
        <p class="text-sm text-slate-500">
          Powered by Babylon Genesis Chain
        </p>
      </div>
    </div>
  </footer>
</template>

