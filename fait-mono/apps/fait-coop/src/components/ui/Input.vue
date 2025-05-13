<script setup lang="ts">
import { computed, ref } from 'vue'

// Define props
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  helperText: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substring(2, 9)}`
  }
})

// Define emits
const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'input'])

// Generate unique ID if not provided
const inputId = ref(props.id)

// Compute input classes
const inputClasses = computed(() => {
  const classes = [
    'form-input',
    'block',
    'px-3',
    'py-2',
    'border',
    'rounded-md',
    'shadow-sm',
    'placeholder-neutral-400',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-primary-500',
    'focus:border-primary-500',
    'sm:text-sm'
  ]
  
  if (props.error) {
    classes.push('border-red-300')
    classes.push('text-red-900')
    classes.push('focus:ring-red-500')
    classes.push('focus:border-red-500')
  } else {
    classes.push('border-neutral-300')
    classes.push('text-neutral-900')
  }
  
  if (props.disabled) {
    classes.push('bg-neutral-100')
    classes.push('cursor-not-allowed')
  }
  
  if (props.fullWidth) {
    classes.push('w-full')
  }
  
  return classes.join(' ')
})

// Handle input events
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('input', event)
}

const handleFocus = (event: Event) => {
  emit('focus', event)
}

const handleBlur = (event: Event) => {
  emit('blur', event)
}
</script>

<template>
  <div :class="{ 'w-full': fullWidth }">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-neutral-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="inputClasses"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    <p v-else-if="helperText" class="mt-1 text-sm text-neutral-500">{{ helperText }}</p>
  </div>
</template>
