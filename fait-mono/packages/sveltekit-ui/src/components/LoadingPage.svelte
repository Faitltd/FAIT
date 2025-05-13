<script lang="ts">
  import { Spinner } from '../index.js';
  
  export let message = 'Loading...';
  export let spinnerSize: 'sm' | 'md' | 'lg' | 'xl' = 'lg';
  export let spinnerColor: 'primary' | 'secondary' | 'white' | 'gray' = 'primary';
  export let fullPage = true;
</script>

<div class="{fullPage ? 'min-h-[60vh]' : ''} flex flex-col items-center justify-center p-8">
  <div class="text-center">
    <div class="mb-4">
      <Spinner size={spinnerSize} color={spinnerColor} />
    </div>
    {#if message}
      <p class="text-lg text-gray-600">{message}</p>
    {/if}
    <slot />
  </div>
</div>
