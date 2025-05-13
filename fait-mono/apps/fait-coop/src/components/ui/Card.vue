<script setup lang="ts">
import { computed } from 'vue'

// Define props
const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value: string) => ['default', 'primary', 'secondary', 'outline', 'hover'].includes(value)
  },
  padding: {
    type: String,
    default: 'default',
    validator: (value: string) => ['none', 'sm', 'default', 'lg'].includes(value)
  },
  shadow: {
    type: String,
    default: 'default',
    validator: (value: string) => ['none', 'sm', 'default', 'lg', 'hover'].includes(value)
  },
  rounded: {
    type: String,
    default: 'default',
    validator: (value: string) => ['none', 'sm', 'default', 'lg', 'full'].includes(value)
  },
  border: {
    type: Boolean,
    default: false
  }
})

// Compute classes based on props
const cardClasses = computed(() => {
  const classes = ['card']
  
  // Variant classes
  if (props.variant === 'primary') {
    classes.push('bg-primary-50')
  } else if (props.variant === 'secondary') {
    classes.push('bg-secondary-50')
  } else if (props.variant === 'outline') {
    classes.push('bg-white border border-neutral-200')
  } else if (props.variant === 'hover') {
    classes.push('bg-white hover:bg-neutral-50 transition-colors duration-200')
  } else {
    classes.push('bg-white')
  }
  
  // Padding classes
  if (props.padding === 'none') {
    classes.push('p-0')
  } else if (props.padding === 'sm') {
    classes.push('p-3')
  } else if (props.padding === 'lg') {
    classes.push('p-6')
  } else {
    classes.push('p-4')
  }
  
  // Shadow classes
  if (props.shadow === 'none') {
    classes.push('shadow-none')
  } else if (props.shadow === 'sm') {
    classes.push('shadow-sm')
  } else if (props.shadow === 'lg') {
    classes.push('shadow-lg')
  } else if (props.shadow === 'hover') {
    classes.push('shadow transition-shadow duration-200 hover:shadow-lg')
  } else {
    classes.push('shadow')
  }
  
  // Rounded classes
  if (props.rounded === 'none') {
    classes.push('rounded-none')
  } else if (props.rounded === 'sm') {
    classes.push('rounded-sm')
  } else if (props.rounded === 'lg') {
    classes.push('rounded-lg')
  } else if (props.rounded === 'full') {
    classes.push('rounded-full')
  } else {
    classes.push('rounded')
  }
  
  // Border class
  if (props.border) {
    classes.push('border border-neutral-200')
  }
  
  return classes.join(' ')
})
</script>

<template>
  <div :class="cardClasses">
    <slot></slot>
  </div>
</template>

<style scoped>
.card {
  transition: all 0.2s ease-in-out;
}
</style>
