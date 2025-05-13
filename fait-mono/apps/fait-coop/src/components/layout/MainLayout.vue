<script setup lang="ts">
import Navbar from './Navbar.vue'
import Footer from './Footer.vue'

defineProps({
  hideFooter: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Navbar />
    
    <main class="flex-grow">
      <slot></slot>
    </main>
    
    <Footer v-if="!hideFooter" />
  </div>
</template>
