<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let rounded = false;
  
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    light: 'bg-gray-100 text-gray-800',
    dark: 'bg-gray-700 text-gray-100'
  };
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-0.5',
    lg: 'text-base px-2.5 py-0.5'
  };
  
  $: classes = `
    inline-flex items-center font-medium
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${rounded ? 'rounded-full' : 'rounded'}
  `;
</script>

<span class={classes} {...$$restProps}>
  <slot />
</span>
