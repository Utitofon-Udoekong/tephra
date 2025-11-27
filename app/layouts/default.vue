<script setup lang="ts">
// Default layout for landing/public pages
</script>

<template>
  <div class="min-h-screen bg-surface-950 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 bg-grid-pattern" />
    
    <!-- Gradient orbs -->
    <div class="absolute top-0 left-1/4 w-96 h-96 gradient-orb gradient-orb-primary animate-pulse-slow" />
    <div class="absolute bottom-0 right-1/4 w-96 h-96 gradient-orb gradient-orb-secondary" />
    <div class="absolute top-1/2 right-0 w-64 h-64 gradient-orb gradient-orb-accent" />
    <div class="absolute bottom-1/4 left-0 w-80 h-80 gradient-orb gradient-orb-primary opacity-50" />
    
    <!-- Content -->
    <div class="relative">
      <slot />
    </div>
  </div>
</template>

