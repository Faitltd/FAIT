<script lang="ts">
  import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-svelte';
  
  export let type: 'info' | 'success' | 'warning' | 'error' = 'info';
  export let title: string | undefined = undefined;
  export let dismissible = false;
  export let icon = true;
  
  let visible = true;
  
  const typeClasses = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200'
  };
  
  const iconClasses = {
    info: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500'
  };
  
  function getIcon(type: 'info' | 'success' | 'warning' | 'error') {
    switch (type) {
      case 'info':
        return Info;
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'error':
        return AlertCircle;
    }
  }
  
  function dismiss() {
    visible = false;
  }
  
  $: IconComponent = getIcon(type);
</script>

{#if visible}
  <div class={`p-4 border rounded-md ${typeClasses[type]}`} role="alert" {...$$restProps}>
    <div class="flex">
      {#if icon}
        <div class="flex-shrink-0 mr-3">
          <svelte:component this={IconComponent} class={`w-5 h-5 ${iconClasses[type]}`} />
        </div>
      {/if}
      
      <div class="flex-1">
        {#if title}
          <h3 class="text-sm font-medium mb-1">{title}</h3>
        {/if}
        
        <div class="text-sm">
          <slot />
        </div>
      </div>
      
      {#if dismissible}
        <div class="ml-auto pl-3">
          <button
            type="button"
            class={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${iconClasses[type]}`}
            on:click={dismiss}
            aria-label="Dismiss"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}
