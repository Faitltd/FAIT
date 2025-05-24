<script lang="ts">
  export let variant: 'default' | 'elevated' | 'outlined' = 'default';
  export let padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  export let hover = false;

  $: baseClasses = 'bg-white rounded-lg transition-all duration-200';
  
  $: variantClasses = {
    default: 'border border-gray-200',
    elevated: 'shadow-md hover:shadow-lg',
    outlined: 'border-2 border-gray-300'
  };

  $: paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  $: hoverClasses = hover ? 'hover:shadow-lg cursor-pointer' : '';

  $: classes = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses}`;
</script>

<div class={classes} on:click>
  <slot />
</div>
