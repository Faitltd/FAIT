<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  // Props
  export let imageUrl: string;
  export let overlayColor: string = 'rgba(0, 0, 0, 0.4)';
  export let overlayOpacity: number = 0.6;
  export let speed: number = 0.2;
  export let height: string = '100%';
  export let minHeight: string = '500px';
  export let backgroundPosition: string = 'center';
  export let backgroundSize: string = 'cover';
  export let zIndex: number = 0;
  export let blur: number = 0;

  // Local state
  let container: HTMLDivElement;
  let background: HTMLDivElement;
  let windowHeight: number = 0;
  let containerTop: number = 0;
  let containerHeight: number = 0;
  let scrollY: number = 0;
  let parallaxOffset: number = 0;

  // Browser check for SSR compatibility
  const isBrowser = typeof window !== 'undefined';

  // Calculate parallax effect
  function updateParallaxEffect() {
    if (!container || !isBrowser) return;

    try {
      // Get container position relative to viewport
      const rect = container.getBoundingClientRect();
      containerTop = rect.top + window.scrollY;
      containerHeight = rect.height;

      // Calculate how far the container is from the top of the viewport
      const offsetFromViewportTop = window.scrollY - containerTop;
      const percentageScrolled = offsetFromViewportTop / (containerHeight + windowHeight);

      // Apply parallax effect
      parallaxOffset = percentageScrolled * speed * 100;
    } catch (error) {
      console.error('Error in parallax effect:', error);
    }
  }

  // Handle scroll events
  function handleScroll() {
    if (!isBrowser) return;
    scrollY = window.scrollY;
    updateParallaxEffect();
  }

  // Handle resize events
  function handleResize() {
    if (!isBrowser) return;
    windowHeight = window.innerHeight;
    updateParallaxEffect();
  }

  onMount(() => {
    if (isBrowser) {
      windowHeight = window.innerHeight;
      updateParallaxEffect();

      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize, { passive: true });
    }
  });

  onDestroy(() => {
    if (isBrowser) {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    }
  });

  // Calculate transform style based on parallax offset
  $: transformStyle = `translate3d(0, ${parallaxOffset}px, 0)`;
  $: filterStyle = blur > 0 ? `blur(${blur}px)` : '';
</script>

<div
  bind:this={container}
  class="parallax-container {$$props.class || ''}"
  style="position: relative; overflow: hidden; min-height: {minHeight}; z-index: {zIndex};"
>
  <!-- Background with parallax effect -->
  <div
    bind:this={background}
    class="parallax-background"
    style="
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: {height};
      background-image: url({imageUrl});
      background-position: {backgroundPosition};
      background-size: {backgroundSize};
      background-repeat: no-repeat;
      transform: {transformStyle};
      filter: {filterStyle};
      z-index: {zIndex};
    "
  ></div>

  <!-- Overlay -->
  {#if overlayColor}
    <div
      class="parallax-overlay"
      style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: {overlayColor};
        opacity: {overlayOpacity};
        z-index: {zIndex + 1};
      "
    ></div>
  {/if}

  <!-- Content -->
  <div
    class="parallax-content"
    style="
      position: relative;
      z-index: {zIndex + 2};
    "
  >
    <slot></slot>
  </div>
</div>

<style>
  .parallax-container {
    will-change: transform;
  }

  .parallax-background {
    will-change: transform;
    backface-visibility: hidden;
    transform-style: preserve-3d;
  }
</style>
