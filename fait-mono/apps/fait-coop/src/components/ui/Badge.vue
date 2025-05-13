<script setup lang="ts">
import { computed } from 'vue'

// Define props
const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value: string) => ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info', 'outline'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
  },
  rounded: {
    type: String,
    default: 'full',
    validator: (value: string) => ['none', 'sm', 'md', 'lg', 'full'].includes(value)
  }
})

// Compute badge classes
const badgeClasses = computed(() => {
  const classes = ['inline-flex', 'items-center', 'font-medium']
  
  // Size classes
  if (props.size === 'sm') {
    classes.push('px-2', 'py-0.5', 'text-xs')
  } else if (props.size === 'lg') {
    classes.push('px-3', 'py-1', 'text-sm')
  } else {
    classes.push('px-2.5', 'py-0.5', 'text-xs')
  }
  
  // Rounded classes
  if (props.rounded === 'none') {
    classes.push('rounded-none')
  } else if (props.rounded === 'sm') {
    classes.push('rounded-sm')
  } else if (props.rounded === 'md') {
    classes.push('rounded')
  } else if (props.rounded === 'lg') {
    classes.push('rounded-lg')
  } else {
    classes.push('rounded-full')
  }
  
  // Variant classes
  if (props.variant === 'primary') {
    classes.push('bg-primary-100', 'text-primary-800')
  } else if (props.variant === 'secondary') {
    classes.push('bg-secondary-100', 'text-secondary-800')
  } else if (props.variant === 'success') {
    classes.push('bg-green-100', 'text-green-800')
  } else if (props.variant === 'warning') {
    classes.push('bg-yellow-100', 'text-yellow-800')
  } else if (props.variant === 'danger') {
    classes.push('bg-red-100', 'text-red-800')
  } else if (props.variant === 'info') {
    classes.push('bg-blue-100', 'text-blue-800')
  } else if (props.variant === 'outline') {
    classes.push('bg-white', 'text-neutral-700', 'border', 'border-neutral-300')
  } else {
    classes.push('bg-neutral-100', 'text-neutral-800')
  }
  
  return classes.join(' ')
})
</script>

<template>
  <span :class="badgeClasses">
    <slot></slot>
  </span>
</template>
