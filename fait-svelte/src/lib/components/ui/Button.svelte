<script lang="ts">
  // Props
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let variant: 'primary' | 'secondary' | 'outline' | 'text' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled = false;
  export let loading = false;
  export let fullWidth = false;
  export let icon: string | null = null;
  export let iconPosition: 'left' | 'right' = 'left';
  export let href: string | null = null;
  export let ariaLabel: string | null = null;
  export let animate = true;

  // Handle click
  function handleClick(event: MouseEvent | KeyboardEvent) {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
  }

  // Compute classes based on props
  $: variantClasses = {
    primary: 'bg-fait-green border border-fait-green text-white hover:bg-fait-green-dark focus:ring-fait-green',
    secondary: 'bg-fait-yellow text-fait-green-dark hover:bg-yellow-400 focus:ring-yellow-500',
    outline: 'bg-transparent border border-fait-green text-fait-green hover:bg-fait-green-light focus:ring-fait-green',
    text: 'bg-transparent text-fait-green hover:underline focus:ring-fait-green'
  };

  $: sizeClasses = {
    sm: 'text-xs py-1 px-2',
    md: 'text-sm py-2 px-4',
    lg: 'text-base py-3 px-6'
  };

  $: animationClass = animate ? 'btn-hover-effect' : '';

  $: classes = `
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${animationClass}
    rounded-full font-medium focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-all duration-200 ease-in-out
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${$$props.class || ''}
  `;
</script>

{#if href && !disabled}
  <a
    {href}
    class={classes}
    aria-label={ariaLabel}
    aria-disabled={disabled}
    on:click={handleClick}
    on:keydown={e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick(e);
      }
    }}
    role="button"
    tabindex={disabled ? -1 : 0}
    {...$$restProps}
  >
    <span class="flex items-center justify-center">
      {#if loading}
        <span class="spinner inline-block w-4 h-4 mr-2" aria-hidden="true"></span>
        <span class="sr-only">Loading</span>
      {:else if icon && iconPosition === 'left'}
        <span class="mr-2" aria-hidden="true">{icon}</span>
      {/if}

      <slot />

      {#if icon && iconPosition === 'right' && !loading}
        <span class="ml-2" aria-hidden="true">{icon}</span>
      {/if}
    </span>
  </a>
{:else}
  <button
    {type}
    class={classes}
    {disabled}
    aria-label={ariaLabel}
    aria-busy={loading}
    on:click={handleClick}
    {...$$restProps}
  >
    <span class="flex items-center justify-center">
      {#if loading}
        <span class="spinner inline-block w-4 h-4 mr-2" aria-hidden="true"></span>
        <span class="sr-only">Loading</span>
      {:else if icon && iconPosition === 'left'}
        <span class="mr-2" aria-hidden="true">{icon}</span>
      {/if}

      <slot />

      {#if icon && iconPosition === 'right' && !loading}
        <span class="ml-2" aria-hidden="true">{icon}</span>
      {/if}
    </span>
  </button>
{/if}
