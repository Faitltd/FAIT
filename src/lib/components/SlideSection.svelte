<script>
  import { onMount } from 'svelte';
  import { motion } from 'framer-motion';
  
  export let direction = 'right'; // 'left', 'right', 'up', 'down'
  export let delay = 0;
  export let duration = 0.5;
  export let threshold = 0.1;
  
  let sectionRef;
  let isVisible = false;
  
  // Calculate transform based on direction
  const getInitialTransform = () => {
    switch (direction) {
      case 'left': return { x: '-100%', y: 0 };
      case 'right': return { x: '100%', y: 0 };
      case 'up': return { x: 0, y: '-100%' };
      case 'down': return { x: 0, y: '100%' };
      default: return { x: '100%', y: 0 };
    }
  };
  
  const initialTransform = getInitialTransform();
  
  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            isVisible = true;
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );
    
    if (sectionRef) {
      observer.observe(sectionRef);
    }
    
    return () => {
      if (sectionRef) {
        observer.unobserve(sectionRef);
      }
    };
  });
</script>

<div bind:this={sectionRef} class="overflow-hidden w-full">
  {#if isVisible}
    <motion:div
      initial={{ opacity: 0, x: initialTransform.x, y: initialTransform.y }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 50, 
        damping: 20,
        delay,
        duration
      }}
      class="w-full max-w-screen-xl mx-auto"
    >
      <slot />
    </motion:div>
  {:else}
    <div class="invisible">
      <slot />
    </div>
  {/if}
</div>
