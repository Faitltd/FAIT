<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // Props
  export let rating = 0;
  export let maxRating = 5;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let color = '#FFD700'; // Gold
  export let interactive = false;
  export let readonly = false;
  export let precision = 0.5; // 0.5 for half stars, 1 for full stars
  
  // Local state
  let hoverRating = 0;
  
  // Event dispatcher
  const dispatch = createEventDispatcher<{
    change: number;
  }>();
  
  // Size classes
  $: sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }[size];
  
  // Generate stars array
  $: stars = Array.from({ length: maxRating }, (_, i) => i + 1);
  
  // Handle mouse enter
  function handleMouseEnter(star: number) {
    if (interactive && !readonly) {
      hoverRating = star;
    }
  }
  
  // Handle mouse leave
  function handleMouseLeave() {
    if (interactive && !readonly) {
      hoverRating = 0;
    }
  }
  
  // Handle click
  function handleClick(star: number) {
    if (interactive && !readonly) {
      // If clicking on the same star, toggle between full and empty
      if (Math.ceil(rating) === star) {
        if (rating === star) {
          rating = star - 1;
        } else {
          rating = star;
        }
      } else {
        rating = star;
      }
      
      dispatch('change', rating);
    }
  }
  
  // Get fill percentage for a star
  function getFillPercentage(star: number): number {
    const displayRating = hoverRating || rating;
    
    if (displayRating >= star) {
      return 100; // Full star
    } else if (displayRating > star - 1) {
      // Partial star
      const fraction = displayRating - Math.floor(displayRating);
      return Math.round(fraction * 100);
    }
    
    return 0; // Empty star
  }
</script>

<div 
  class="star-rating flex {$$props.class || ''}"
  on:mouseleave={handleMouseLeave}
  role={interactive && !readonly ? 'slider' : 'img'}
  aria-label={`${rating} out of ${maxRating} stars`}
  aria-valuemin={interactive && !readonly ? 0 : undefined}
  aria-valuemax={interactive && !readonly ? maxRating : undefined}
  aria-valuenow={interactive && !readonly ? rating : undefined}
  aria-readonly={readonly}
  tabindex={interactive && !readonly ? 0 : undefined}
>
  {#each stars as star}
    <div 
      class="star-container relative {interactive && !readonly ? 'cursor-pointer' : ''}"
      on:mouseenter={() => handleMouseEnter(star)}
      on:click={() => handleClick(star)}
      role={interactive && !readonly ? 'button' : undefined}
      aria-label={interactive && !readonly ? `Rate ${star} out of ${maxRating}` : undefined}
    >
      <!-- Empty star (background) -->
      <svg 
        class="{sizeClass} text-gray-300" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
      
      <!-- Filled star (foreground) -->
      <div 
        class="absolute inset-0 overflow-hidden" 
        style="width: {getFillPercentage(star)}%;"
      >
        <svg 
          class="{sizeClass}" 
          fill={color} 
          viewBox="0 0 24 24" 
          stroke={color}
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </div>
    </div>
  {/each}
</div>
