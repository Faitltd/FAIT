<script setup lang="ts">
import { computed } from 'vue'

// Define props
const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: 'Avatar'
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  shape: {
    type: String,
    default: 'circle',
    validator: (value: string) => ['circle', 'square', 'rounded'].includes(value)
  },
  status: {
    type: String,
    default: '',
    validator: (value: string) => ['', 'online', 'offline', 'away', 'busy'].includes(value)
  },
  initials: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: ''
  }
})

// Compute avatar classes
const avatarClasses = computed(() => {
  const classes = ['avatar', 'inline-flex', 'items-center', 'justify-center', 'bg-neutral-200', 'text-neutral-700', 'font-medium', 'relative']
  
  // Size classes
  if (props.size === 'xs') {
    classes.push('w-6', 'h-6', 'text-xs')
  } else if (props.size === 'sm') {
    classes.push('w-8', 'h-8', 'text-sm')
  } else if (props.size === 'lg') {
    classes.push('w-12', 'h-12', 'text-lg')
  } else if (props.size === 'xl') {
    classes.push('w-16', 'h-16', 'text-xl')
  } else {
    classes.push('w-10', 'h-10', 'text-base')
  }
  
  // Shape classes
  if (props.shape === 'circle') {
    classes.push('rounded-full')
  } else if (props.shape === 'square') {
    classes.push('rounded-none')
  } else {
    classes.push('rounded-md')
  }
  
  // Color classes
  if (props.color === 'primary') {
    classes.push('bg-primary-100', 'text-primary-800')
  } else if (props.color === 'secondary') {
    classes.push('bg-secondary-100', 'text-secondary-800')
  } else if (props.color === 'success') {
    classes.push('bg-green-100', 'text-green-800')
  } else if (props.color === 'warning') {
    classes.push('bg-yellow-100', 'text-yellow-800')
  } else if (props.color === 'danger') {
    classes.push('bg-red-100', 'text-red-800')
  } else if (props.color === 'info') {
    classes.push('bg-blue-100', 'text-blue-800')
  }
  
  return classes.join(' ')
})

// Compute status classes
const statusClasses = computed(() => {
  const classes = ['absolute', 'block', 'rounded-full', 'ring-2', 'ring-white']
  
  // Size classes
  if (props.size === 'xs') {
    classes.push('w-1.5', 'h-1.5', 'right-0', 'bottom-0')
  } else if (props.size === 'sm') {
    classes.push('w-2', 'h-2', 'right-0', 'bottom-0')
  } else if (props.size === 'lg') {
    classes.push('w-3', 'h-3', 'right-0.5', 'bottom-0.5')
  } else if (props.size === 'xl') {
    classes.push('w-4', 'h-4', 'right-1', 'bottom-1')
  } else {
    classes.push('w-2.5', 'h-2.5', 'right-0', 'bottom-0')
  }
  
  // Status color
  if (props.status === 'online') {
    classes.push('bg-green-500')
  } else if (props.status === 'offline') {
    classes.push('bg-neutral-400')
  } else if (props.status === 'away') {
    classes.push('bg-yellow-500')
  } else if (props.status === 'busy') {
    classes.push('bg-red-500')
  }
  
  return classes.join(' ')
})

// Get initials from name
const getInitials = computed(() => {
  if (props.initials) return props.initials
  
  if (props.alt && props.alt !== 'Avatar') {
    return props.alt
      .split(' ')
      .map(word => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }
  
  return ''
})
</script>

<template>
  <div :class="avatarClasses">
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="w-full h-full object-cover"
    />
    <span v-else>{{ getInitials }}</span>
    
    <span v-if="status" :class="statusClasses"></span>
  </div>
</template>

<style scoped>
.avatar {
  overflow: hidden;
}
</style>
