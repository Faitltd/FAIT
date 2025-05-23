<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { payment } from '$lib/stores/payment';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { fade } from 'svelte/transition';
  
  // Form state
  let cardNumber = '';
  let cardExpiry = '';
  let cardCvc = '';
  let cardName = '';
  let makeDefault = false;
  let formErrors: Record<string, string> = {};
  let success = false;
  
  // Initialize on mount
  onMount(async () => {
    // Check if user is authenticated
    await auth.checkAuth();
    
    if (!$auth.user) {
      // Redirect to login if not authenticated
      goto('/login');
    }
  });
  
  // Format card number with spaces
  function formatCardNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\s+/g, '');
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    input.value = formattedValue;
    cardNumber = formattedValue;
  }
  
  // Format card expiry with slash
  function formatCardExpiry(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    
    if (value.length > 2) {
      input.value = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    } else {
      input.value = value;
    }
    
    cardExpiry = input.value;
  }
  
  // Validate form
  function validateForm(): boolean {
    formErrors = {};
    
    if (!cardNumber) {
      formErrors.cardNumber = 'Card number is required';
    } else if (cardNumber.replace(/\s+/g, '').length !== 16) {
      formErrors.cardNumber = 'Card number must be 16 digits';
    }
    
    if (!cardExpiry) {
      formErrors.cardExpiry = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      formErrors.cardExpiry = 'Expiry date must be in MM/YY format';
    }
    
    if (!cardCvc) {
      formErrors.cardCvc = 'CVC is required';
    } else if (!/^\d{3,4}$/.test(cardCvc)) {
      formErrors.cardCvc = 'CVC must be 3 or 4 digits';
    }
    
    if (!cardName) {
      formErrors.cardName = 'Name on card is required';
    }
    
    return Object.keys(formErrors).length === 0;
  }
  
  // Handle form submission
  async function handleSubmit() {
    if (!validateForm()) return;
    
    // In a real app, this would use Stripe.js to create a payment method
    // For now, we'll simulate it with a random ID
    const paymentMethodId = `pm_${Math.random().toString(36).substring(2)}`;
    
    const result = await payment.addPaymentMethod(paymentMethodId);
    
    if (result.success) {
      // Set as default if requested
      if (makeDefault) {
        await payment.setDefaultPaymentMethod(result.paymentMethod.id);
      }
      
      success = true;
      
      // Reset form
      cardNumber = '';
      cardExpiry = '';
      cardCvc = '';
      cardName = '';
      makeDefault = false;
      
      // Redirect back to profile after a short delay
      setTimeout(() => {
        goto('/profile');
      }, 2000);
    }
  }
</script>

<svelte:head>
  <title>Add Payment Method - FAIT</title>
  <meta name="description" content="Add a new payment method to your account." />
</svelte:head>

<section class="bg-fait-light py-12">
  <div class="container-custom">
    <div class="mb-6">
      <Button variant="outline" size="sm" on:click={() => goto('/profile')}>
        &larr; Back to Profile
      </Button>
    </div>
    
    <h1 class="text-3xl font-ivy font-bold text-fait-dark mb-6">Add Payment Method</h1>
    
    <div class="max-w-2xl mx-auto">
      <Card variant="elevated" padding="lg">
        {#if success}
          <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6" in:fade>
            <p class="font-medium">Payment method added successfully!</p>
            <p>Redirecting back to your profile...</p>
          </div>
        {/if}
        
        {#if $payment.error}
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" in:fade>
            <p>{$payment.error}</p>
          </div>
        {/if}
        
        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          <!-- Card number -->
          <div>
            <label for="card-number" class="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
            <input 
              type="text" 
              id="card-number" 
              bind:value={cardNumber}
              on:input={formatCardNumber}
              maxlength="19"
              placeholder="1234 5678 9012 3456"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue
                {formErrors.cardNumber ? 'border-red-500' : ''}"
              aria-describedby={formErrors.cardNumber ? 'card-number-error' : undefined}
            />
            {#if formErrors.cardNumber}
              <p id="card-number-error" class="text-red-500 text-xs mt-1">{formErrors.cardNumber}</p>
            {/if}
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Expiry date -->
            <div>
              <label for="card-expiry" class="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input 
                type="text" 
                id="card-expiry" 
                bind:value={cardExpiry}
                on:input={formatCardExpiry}
                maxlength="5"
                placeholder="MM/YY"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue
                  {formErrors.cardExpiry ? 'border-red-500' : ''}"
                aria-describedby={formErrors.cardExpiry ? 'card-expiry-error' : undefined}
              />
              {#if formErrors.cardExpiry}
                <p id="card-expiry-error" class="text-red-500 text-xs mt-1">{formErrors.cardExpiry}</p>
              {/if}
            </div>
            
            <!-- CVC -->
            <div>
              <label for="card-cvc" class="block text-sm font-medium text-gray-700 mb-1">CVC</label>
              <input 
                type="text" 
                id="card-cvc" 
                bind:value={cardCvc}
                maxlength="4"
                placeholder="123"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue
                  {formErrors.cardCvc ? 'border-red-500' : ''}"
                aria-describedby={formErrors.cardCvc ? 'card-cvc-error' : undefined}
              />
              {#if formErrors.cardCvc}
                <p id="card-cvc-error" class="text-red-500 text-xs mt-1">{formErrors.cardCvc}</p>
              {/if}
            </div>
          </div>
          
          <!-- Name on card -->
          <div>
            <label for="card-name" class="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
            <input 
              type="text" 
              id="card-name" 
              bind:value={cardName}
              placeholder="John Doe"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue
                {formErrors.cardName ? 'border-red-500' : ''}"
              aria-describedby={formErrors.cardName ? 'card-name-error' : undefined}
            />
            {#if formErrors.cardName}
              <p id="card-name-error" class="text-red-500 text-xs mt-1">{formErrors.cardName}</p>
            {/if}
          </div>
          
          <!-- Make default -->
          <div class="flex items-center">
            <input 
              type="checkbox" 
              id="make-default" 
              bind:checked={makeDefault}
              class="h-4 w-4 text-fait-blue focus:ring-fait-blue border-gray-300 rounded"
            />
            <label for="make-default" class="ml-2 block text-sm text-gray-700">
              Set as default payment method
            </label>
          </div>
          
          <div class="flex justify-end">
            <Button 
              type="submit" 
              variant="primary"
              loading={$payment.isLoading}
              disabled={$payment.isLoading || success}
            >
              Add Payment Method
            </Button>
          </div>
        </form>
        
        <div class="mt-6 pt-6 border-t border-gray-200">
          <p class="text-sm text-gray-600">
            Your payment information is secure. We use industry-standard encryption to protect your data.
          </p>
        </div>
      </Card>
    </div>
  </div>
</section>
