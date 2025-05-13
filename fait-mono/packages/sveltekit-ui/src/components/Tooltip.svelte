<script lang="ts">
  import { fade } from 'svelte/transition';
  
  export let text: string;
  export let position: 'top' | 'right' | 'bottom' | 'left' = 'top';
  export let delay = 500;
  
  let showTooltip = false;
  let tooltipTimeout: ReturnType<typeof setTimeout>;
  
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-1',
    right: 'left-full top-1/2 transform -translate-y-1/2 translate-x-2 ml-1',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 translate-y-2 mt-1',
    left: 'right-full top-1/2 transform -translate-y-1/2 -translate-x-2 mr-1'
  };
  
  const arrowClasses = {
    top: 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent',
    right: 'left-0 top-1/2 transform -translate-y-1/2 -translate-x-full border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent',
    bottom: 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full border-b-gray-800 border-l-transparent border-r-transparent border-t-transparent',
    left: 'right-0 top-1/2 transform -translate-y-1/2 translate-x-full border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent'
  };
  
  function handleMouseEnter() {
    tooltipTimeout = setTimeout(() => {
      showTooltip = true;
    }, delay);
  }
  
  function handleMouseLeave() {
    clearTimeout(tooltipTimeout);
    showTooltip = false;
  }
</script>

<div 
  class="relative inline-block"
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  on:focusin={handleMouseEnter}
  on:focusout={handleMouseLeave}
>
  <slot />
  
  {#if showTooltip}
    <div 
      class="absolute z-50 {positionClasses[position]}"
      transition:fade={{ duration: 100 }}
      role="tooltip"
    >
      <div class="bg-gray-800 text-white text-sm rounded py-1 px-2 max-w-xs">
        {text}
      </div>
      <div class="absolute w-0 h-0 border-4 {arrowClasses[position]}"></div>
    </div>
  {/if}
</div>
