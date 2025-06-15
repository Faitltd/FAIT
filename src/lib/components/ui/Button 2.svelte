<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'outline' | 'text' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let disabled: boolean = false;
  export let fullWidth: boolean = false;
  export let href: string | undefined = undefined;
  
  const variantClasses = {
    primary: 'bg-fait-blue text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-fait-accent text-white hover:bg-orange-700 focus:ring-orange-500',
    outline: 'bg-transparent border border-fait-blue text-fait-blue hover:bg-blue-50 focus:ring-blue-500',
    text: 'bg-transparent text-fait-blue hover:underline focus:ring-blue-500'
  };
  
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3'
  };
  
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  $: classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''}`;
</script>

{#if href}
  <a {href} class={classes} role="button" tabindex="0" on:click>
    <slot />
  </a>
{:else}
  <button {type} {disabled} class={classes} on:click>
    <slot />
  </button>
{/if}
