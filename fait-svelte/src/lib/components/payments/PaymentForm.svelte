<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { payment } from '$lib/stores/payment';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { fade } from 'svelte/transition';
  
  // Props
  export let bookingId: string;
  export let amount: number;
  export let currency = 'usd';
  
  // Local state
  let selectedPaymentMethodId = '';
  let showAddCard = false;
  let cardNumber = '';
  let cardExpiry = '';
  let cardCvc = '';
  let cardName = '';
  let formErrors: Record<string, string> = {};
  let showSuccessMessage = false;
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // Load payment methods on mount
  onMount(async () => {
    await payment.loadPaymentMethods();
    
    // Set default payment method if available
    if ($payment.defaultPaymentMethod) {
      selectedPaymentMethodId = $payment.defaultPaymentMethod.id;
    }
  });
  
  // Format amount for display
  $: formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount / 100);
  
  // Toggle add card form
  function toggleAddCard() {
    showAddCard = !showAddCard;
    formErrors = {};
  }
  
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
  
  // Validate add card form
  function validateAddCardForm(): boolean {
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
  
  // Add a new card
  async function addCard() {
    if (!validateAddCardForm()) return;
    
    // In a real app, this would use Stripe.js to create a payment method
    // For now, we'll simulate it with a random ID
    const paymentMethodId = `pm_${Math.random().toString(36).substring(2)}`;
    
    const result = await payment.addPaymentMethod(paymentMethodId);
    
    if (result.success) {
      // Set as selected payment method
      selectedPaymentMethodId = result.paymentMethod.id;
      
      // Hide add card form
      showAddCard = false;
      
      // Reset form
      cardNumber = '';
      cardExpiry = '';
      cardCvc = '';
      cardName = '';
    }
  }
  
  // Set default payment method
  async function setDefaultPaymentMethod(id: string) {
    await payment.setDefaultPaymentMethod(id);
  }
  
  // Remove payment method
  async function removePaymentMethod(id: string) {
    if (confirm('Are you sure you want to remove this payment method?')) {
      await payment.removePaymentMethod(id);
      
      // If the removed method was selected, clear selection
      if (selectedPaymentMethodId === id) {
        selectedPaymentMethodId = '';
      }
    }
  }
  
  // Process payment
  async function processPayment() {
    if (!selectedPaymentMethodId) {
      formErrors.payment = 'Please select a payment method';
      return;
    }
    
    // Process payment
    const result = await payment.processPayment(bookingId, selectedPaymentMethodId, amount, currency);
    
    if (result.success) {
      showSuccessMessage = true;
      
      // Notify parent component
      dispatch('success', { payment: result.payment });
    }
  }
  
  // Format card brand for display
  function formatCardBrand(brand: string): string {
    if (!brand) return '';
    
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  }
</script>

<Card variant="elevated" padding="lg" class="payment-form {$$props.class || ''}">
  <h3 class="text-xl font-bold mb-4">Payment Details</h3>
  
  {#if showSuccessMessage}
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" in:fade>
      <p class="font-medium">Payment successful!</p>
      <p>Your payment has been processed successfully.</p>
    </div>
  {/if}
  
  {#if $payment.error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" in:fade>
      <p>{$payment.error}</p>
    </div>
  {/if}
  
  {#if formErrors.payment}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" in:fade>
      <p>{formErrors.payment}</p>
    </div>
  {/if}
  
  <!-- Payment amount -->
  <div class="bg-gray-50 p-4 rounded-md mb-6">
    <div class="flex justify-between items-center">
      <span class="font-medium">Total Amount:</span>
      <span class="text-fait-blue font-bold text-xl">{formattedAmount}</span>
    </div>
  </div>
  
  <!-- Payment methods -->
  <div class="mb-6">
    <div class="flex justify-between items-center mb-2">
      <h4 class="font-medium">Payment Methods</h4>
      <button 
        type="button"
        class="text-fait-blue text-sm hover:underline focus:outline-none"
        on:click={toggleAddCard}
        aria-expanded={showAddCard}
      >
        {showAddCard ? 'Cancel' : 'Add New Card'}
      </button>
    </div>
    
    {#if $payment.isLoading}
      <div class="flex justify-center items-center py-4">
        <div class="spinner"></div>
      </div>
    {:else if $payment.paymentMethods.length === 0 && !showAddCard}
      <div class="text-center py-4 bg-gray-50 rounded-md">
        <p class="text-gray-600 mb-2">No payment methods found</p>
        <button 
          type="button"
          class="text-fait-blue hover:underline focus:outline-none"
          on:click={toggleAddCard}
        >
          Add a payment method
        </button>
      </div>
    {:else if !showAddCard}
      <div class="space-y-2">
        {#each $payment.paymentMethods as method}
          <div class="border rounded-md p-3 {selectedPaymentMethodId === method.id ? 'border-fait-blue bg-blue-50' : 'border-gray-200'}">
            <label class="flex items-start cursor-pointer">
              <input 
                type="radio" 
                name="paymentMethod" 
                value={method.id} 
                bind:group={selectedPaymentMethodId}
                class="mt-1 h-4 w-4 text-fait-blue focus:ring-fait-blue"
              />
              <div class="ml-3 flex-1">
                <div class="flex justify-between">
                  <span class="font-medium">
                    {formatCardBrand(method.brand)} •••• {method.last4}
                  </span>
                  {#if method.isDefault}
                    <span class="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">Default</span>
                  {/if}
                </div>
                {#if method.expMonth && method.expYear}
                  <div class="text-sm text-gray-600">
                    Expires {method.expMonth}/{method.expYear}
                  </div>
                {/if}
              </div>
            </label>
            <div class="mt-2 flex justify-end space-x-2">
              {#if !method.isDefault}
                <button 
                  type="button"
                  class="text-sm text-gray-600 hover:text-fait-blue focus:outline-none"
                  on:click={() => setDefaultPaymentMethod(method.id)}
                >
                  Set as default
                </button>
              {/if}
              <button 
                type="button"
                class="text-sm text-red-600 hover:text-red-800 focus:outline-none"
                on:click={() => removePaymentMethod(method.id)}
              >
                Remove
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
    
    <!-- Add card form -->
    {#if showAddCard}
      <div class="border border-gray-200 rounded-md p-4 mt-4" in:fade>
        <h5 class="font-medium mb-4">Add New Card</h5>
        
        <form on:submit|preventDefault={addCard} class="space-y-4">
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
          
          <div class="grid grid-cols-2 gap-4">
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
          
          <div class="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              on:click={toggleAddCard}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              size="sm"
              loading={$payment.isLoading}
              disabled={$payment.isLoading}
            >
              Add Card
            </Button>
          </div>
        </form>
      </div>
    {/if}
  </div>
  
  <!-- Submit button -->
  <Button 
    type="button" 
    variant="primary" 
    fullWidth={true} 
    loading={$payment.isLoading}
    disabled={$payment.isLoading || !selectedPaymentMethodId || showSuccessMessage}
    on:click={processPayment}
    animate={true}
  >
    Pay {formattedAmount}
  </Button>
  
  <p class="text-xs text-gray-600 mt-4 text-center">
    Your payment information is secure. We use industry-standard encryption to protect your data.
  </p>
</Card>
