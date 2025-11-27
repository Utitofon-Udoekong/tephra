<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const router = useRouter()
const { login, isLoading, error, clearError, isAuthenticated, user } = useAuth()

const form = ref({
  username: '',
  password: '',
})

// Redirect if already logged in
watch(isAuthenticated, (authenticated) => {
  if (authenticated) {
    router.push('/dashboard')
  }
}, { immediate: true })

const handleSubmit = async () => {
  clearError()
  const success = await login(form.value.username, form.value.password, '/dashboard')
  
  if (!success) {
    // Error is handled by the store
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <!-- Header with logo -->
    <div class="absolute top-6 left-6">
      <NuxtLink to="/">
        <CommonLogo />
      </NuxtLink>
    </div>
    
    <!-- Already logged in message -->
    <div v-if="isAuthenticated && user" class="w-full max-w-md">
      <UiCard variant="glass-dark" padding="lg" class="relative overflow-hidden text-center">
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-amber-500 to-orange-500" />
        
        <Icon name="mdi:check-circle" class="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-white mb-2">Already logged in</h1>
        <p class="text-slate-400 mb-6">
          You're signed in as <span class="text-primary-400">{{ user.username }}</span>
        </p>
        
        <div class="flex gap-3 justify-center">
          <NuxtLink to="/dashboard">
            <UiButton>
              <Icon name="mdi:view-dashboard" class="w-5 h-5" />
              Go to Dashboard
            </UiButton>
          </NuxtLink>
        </div>
      </UiCard>
    </div>
    
    <!-- Login card -->
    <div v-else class="w-full max-w-md">
      <UiCard variant="glass-dark" padding="lg" class="relative overflow-hidden">
        <!-- Decorative gradient -->
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-amber-500 to-orange-500" />
        
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p class="text-slate-400">Sign in to access the dashboard</p>
        </div>
        
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <UiInput
            v-model="form.username"
            label="Username"
            placeholder="Enter your username"
            icon="mdi:account"
            :disabled="isLoading"
          />
          
          <UiInput
            v-model="form.password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            icon="mdi:lock"
            :disabled="isLoading"
          />
          
          <!-- Error message -->
          <div v-if="error" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p class="text-sm text-red-400 flex items-center gap-2">
              <Icon name="mdi:alert-circle" class="w-4 h-4" />
              {{ error }}
            </p>
          </div>
          
          <!-- Demo credentials hint -->
          <div class="p-3 rounded-lg bg-primary-500/10 border border-primary-500/20">
            <p class="text-sm text-primary-400">
              <Icon name="mdi:information" class="w-4 h-4 inline mr-1" />
              Demo: <code class="px-1 py-0.5 bg-primary-500/20 rounded">demo</code> / 
              <code class="px-1 py-0.5 bg-primary-500/20 rounded">babylon2025</code>
            </p>
          </div>
          
          <UiButton 
            type="submit" 
            full-width 
            size="lg" 
            :loading="isLoading"
          >
            <Icon name="mdi:login" class="w-5 h-5" />
            Sign In
          </UiButton>
        </form>
        
        <div class="mt-6 text-center">
          <NuxtLink 
            to="/" 
            class="text-sm text-slate-400 hover:text-primary-400 transition-colors inline-flex items-center gap-1"
          >
            <Icon name="mdi:arrow-left" class="w-4 h-4" />
            Back to home
          </NuxtLink>
        </div>
      </UiCard>
    </div>
  </div>
</template>
