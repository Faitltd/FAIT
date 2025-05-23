<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { createEventDispatcher } from 'svelte';

  // Props
  export let id: string;
  export let title: string;
  export let description: string;
  export let category: string;
  export let price: string;
  export let priceType: 'hourly' | 'fixed' = 'hourly';
  export let imageUrl: string = '/images/default-service.jpg';
  export let animate = true;

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Handle booking
  function handleBook() {
    dispatch('book', { id });
  }

  // Format price display
  $: priceDisplay = priceType === 'hourly' ? `$${price}/hr` : `$${price}`;

  // Truncate description
  $: truncatedDescription = description.length > 100 
    ? `${description.substring(0, 100)}...` 
    : description;
</script>

<Card 
  variant="default" 
  hover={true} 
  animate={animate}
  class="staggered-list-item overflow-hidden"
>
  <div class="relative">
    <!-- Service Image -->
    <img 
      src={imageUrl} 
      alt={title} 
      class="w-full h-48 object-cover"
    />
    
    <!-- Category Badge -->
    <div class="absolute top-2 right-2 bg-fait-blue text-white text-xs px-2 py-1 rounded-full">
      {category}
    </div>
  </div>
  
  <div class="p-4">
    <!-- Service Title -->
    <h3 class="text-xl font-bold mb-2 font-ivy">{title}</h3>
    
    <!-- Service Description -->
    <p class="text-gray-600 mb-4">{truncatedDescription}</p>
    
    <div class="flex justify-between items-center">
      <!-- Price -->
      <div class="text-fait-blue font-bold text-lg">
        {priceDisplay}
      </div>
      
      <!-- Book Button -->
      <Button 
        variant="primary" 
        size="sm" 
        on:click={handleBook}
        animate={animate}
      >
        Book Now
      </Button>
    </div>
  </div>
</Card>
