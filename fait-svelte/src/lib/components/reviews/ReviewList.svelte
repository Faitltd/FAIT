<script lang="ts">
  import { onMount } from 'svelte';
  import { reviews } from '$lib/stores/reviews';
  import { auth } from '$lib/stores/auth';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import StarRating from './StarRating.svelte';
  import { fade, fly } from 'svelte/transition';
  
  // Props
  export let serviceId: string;
  export let showRatingStats = true;
  export let limit: number | null = null;
  
  // Local state
  let isLoading = true;
  let error: string | null = null;
  let serviceRating = { average: 0, count: 0 };
  
  // Initialize on mount
  onMount(async () => {
    try {
      isLoading = true;
      
      // Load service reviews
      await reviews.loadServiceReviews(serviceId);
      
      // Get service rating
      const ratingResult = await reviews.getServiceRating(serviceId);
      if (ratingResult.success) {
        serviceRating = ratingResult.rating;
      }
      
      isLoading = false;
    } catch (err) {
      console.error('Failed to load reviews:', err);
      error = err instanceof Error ? error.message : 'Failed to load reviews';
      isLoading = false;
    }
  });
  
  // Format date
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Get limited reviews
  $: limitedReviews = limit ? $reviews.reviews.slice(0, limit) : $reviews.reviews;
  
  // Check if user has already reviewed
  $: userHasReviewed = $auth.user 
    ? $reviews.reviews.some(review => review.clientId === $auth.user?.id)
    : false;
</script>

<div class="reviews {$$props.class || ''}">
  {#if isLoading}
    <div class="flex justify-center items-center py-4">
      <div class="spinner"></div>
    </div>
  {:else if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" in:fade>
      <p>{error}</p>
    </div>
  {:else}
    {#if showRatingStats}
      <div class="mb-6">
        <div class="flex items-center">
          <div class="mr-4">
            <span class="text-3xl font-bold">{serviceRating.average.toFixed(1)}</span>
            <span class="text-gray-600">/ 5</span>
          </div>
          <div>
            <StarRating rating={serviceRating.average} size="lg" />
            <p class="text-sm text-gray-600 mt-1">Based on {serviceRating.count} {serviceRating.count === 1 ? 'review' : 'reviews'}</p>
          </div>
        </div>
      </div>
    {/if}
    
    {#if limitedReviews.length === 0}
      <div class="text-center py-6 bg-gray-50 rounded-md">
        <p class="text-gray-600">No reviews yet. Be the first to leave a review!</p>
      </div>
    {:else}
      <div class="space-y-6">
        {#each limitedReviews as review, i}
          <div 
            class="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
            in:fly={{ y: 20, duration: 300, delay: i * 100 }}
          >
            <div class="flex justify-between items-start">
              <div>
                <div class="flex items-center mb-2">
                  <StarRating rating={review.rating} size="sm" />
                  <span class="ml-2 text-gray-600">{review.rating} out of 5</span>
                </div>
                <p class="text-sm text-gray-600 mb-2">
                  {formatDate(review.createdAt)}
                </p>
              </div>
              
              {#if $auth.user && review.clientId === $auth.user.id}
                <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Your Review
                </span>
              {/if}
            </div>
            
            <p class="text-gray-800">{review.comment}</p>
          </div>
        {/each}
      </div>
      
      {#if limit && $reviews.reviews.length > limit}
        <div class="mt-4 text-center">
          <Button variant="outline" on:click={() => limit = null}>
            View All Reviews ({$reviews.reviews.length})
          </Button>
        </div>
      {/if}
    {/if}
  {/if}
</div>
