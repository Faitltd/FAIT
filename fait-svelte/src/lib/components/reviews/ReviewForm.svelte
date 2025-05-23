<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { reviews } from '$lib/stores/reviews';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import StarRating from './StarRating.svelte';
  import { fade } from 'svelte/transition';
  
  // Props
  export let bookingId: string;
  export let serviceId: string;
  export let providerId: string;
  export let clientId: string;
  export let existingReview: any = null;
  
  // Local state
  let rating = existingReview ? existingReview.rating : 0;
  let comment = existingReview ? existingReview.comment : '';
  let formErrors: Record<string, string> = {};
  let showSuccessMessage = false;
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // Validate form
  function validateForm(): boolean {
    formErrors = {};
    
    if (rating === 0) {
      formErrors.rating = 'Please select a rating';
    }
    
    if (!comment.trim()) {
      formErrors.comment = 'Please provide a comment';
    }
    
    return Object.keys(formErrors).length === 0;
  }
  
  // Handle rating change
  function handleRatingChange(event: CustomEvent<number>) {
    rating = event.detail;
  }
  
  // Handle form submission
  async function handleSubmit() {
    if (!validateForm()) return;
    
    if (existingReview) {
      // Update existing review
      const result = await reviews.updateReview(existingReview.id, {
        rating,
        comment
      });
      
      if (result.success) {
        showSuccessMessage = true;
        
        // Notify parent component
        dispatch('success', { review: result.review, updated: true });
        
        // Reset success message after a delay
        setTimeout(() => {
          showSuccessMessage = false;
        }, 3000);
      }
    } else {
      // Create new review
      const result = await reviews.createReview({
        bookingId,
        serviceId,
        providerId,
        clientId,
        rating,
        comment
      });
      
      if (result.success) {
        showSuccessMessage = true;
        
        // Notify parent component
        dispatch('success', { review: result.review, created: true });
        
        // Reset form
        rating = 0;
        comment = '';
        
        // Reset success message after a delay
        setTimeout(() => {
          showSuccessMessage = false;
        }, 3000);
      }
    }
  }
</script>

<Card variant="default" padding="md" class="review-form {$$props.class || ''}">
  <h3 class="text-lg font-bold mb-4">
    {existingReview ? 'Edit Your Review' : 'Leave a Review'}
  </h3>
  
  {#if showSuccessMessage}
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" in:fade>
      <p class="font-medium">
        {existingReview ? 'Review updated successfully!' : 'Review submitted successfully!'}
      </p>
    </div>
  {/if}
  
  {#if $reviews.error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" in:fade>
      <p>{$reviews.error}</p>
    </div>
  {/if}
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <!-- Rating -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Rating</label>
      <div class="flex items-center">
        <StarRating 
          rating={rating} 
          interactive={true} 
          size="lg"
          on:change={handleRatingChange}
        />
        <span class="ml-2 text-gray-600">{rating} out of 5</span>
      </div>
      {#if formErrors.rating}
        <p class="text-red-500 text-xs mt-1">{formErrors.rating}</p>
      {/if}
    </div>
    
    <!-- Comment -->
    <div>
      <label for="review-comment" class="block text-sm font-medium text-gray-700 mb-2">Comment</label>
      <textarea 
        id="review-comment" 
        bind:value={comment} 
        rows="4"
        placeholder="Share your experience..."
        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue
          {formErrors.comment ? 'border-red-500' : ''}"
      ></textarea>
      {#if formErrors.comment}
        <p class="text-red-500 text-xs mt-1">{formErrors.comment}</p>
      {/if}
    </div>
    
    <!-- Submit button -->
    <div class="flex justify-end">
      <Button 
        type="submit" 
        variant="primary" 
        loading={$reviews.isLoading}
        disabled={$reviews.isLoading}
      >
        {existingReview ? 'Update Review' : 'Submit Review'}
      </Button>
    </div>
  </form>
</Card>
