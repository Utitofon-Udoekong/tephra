<script setup lang="ts">
// Root application component
useHead({
  htmlAttrs: {
    lang: 'en',
    class: 'dark',
  },
  bodyAttrs: {
    class: 'bg-surface-950 text-slate-200 antialiased',
  },
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
