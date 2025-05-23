<script lang="ts">
  // Props
  export let variant: 'default' | 'elevated' | 'outlined' = 'default';
  export let padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  export let hover = false;
  export let clickable = false;
  export let href: string | null = null;
  export let animate = true;

  // Compute classes based on props
  $: variantClasses = {
    default: 'bg-white shadow',
    elevated: 'bg-white shadow-lg',
    outlined: 'bg-white border border-gray-200'
  };

  $: paddingClasses = {
    none: 'p-0',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6'
  };

  $: hoverClass = hover ? 'hover:shadow-lg' : '';
  $: clickableClass = clickable ? 'cursor-pointer' : '';
  $: animationClass = animate ? 'card-hover-effect' : '';
  
  $: classes = `
    ${variantClasses[variant]} 
    ${paddingClasses[padding]} 
    ${hoverClass} 
    ${clickableClass}
    ${animationClass}
    rounded-lg transition-all duration-300 ease-in-out
    ${$$props.class || ''}
  `;
</script>

{#if href}
  <a {href} class={classes} {...$$restProps}>
    <slot />
  </a>
{:else}
  <div class={classes} {...$$restProps}>
    <slot />
  </div>
{/if}
