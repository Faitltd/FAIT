<script lang="ts">
  export let variant: 'default' | 'bordered' | 'elevated' = 'default';
  export let padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  export let rounded: 'none' | 'sm' | 'md' | 'lg' | 'full' = 'md';
  
  const variantClasses = {
    default: 'bg-white',
    bordered: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md'
  };
  
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };
  
  $: classes = `${variantClasses[variant]} ${paddingClasses[padding]} ${roundedClasses[rounded]}`;
</script>

<div class={classes}>
  <slot />
</div>
