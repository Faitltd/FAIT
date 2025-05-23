<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  import { bookings } from '$lib/stores/bookings';
  import { payment } from '$lib/stores/payment';
  import { api } from '$lib/services/api';
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import PaymentForm from '$lib/components/payments/PaymentForm.svelte';
  import { fade, fly } from 'svelte/transition';
  import type { Service } from '$lib/services/supabase';
  
  // State
  let booking = null;
  let service: Service | null = null;
  let existingPayment = null;
  let isLoading = true;
  let error: string | null = null;
  
  // Get booking ID from URL
  $: bookingId = $page.params.id;
  
  // Load booking, service, and payment on mount
  onMount(async () => {
    // Check if user is authenticated
    await auth.checkAuth();
    
    if (!$auth.isAuthenticated) {
      // Redirect to login if not authenticated
      goto('/login');
      return;
    }
    
    try {
      isLoading = true;
      
      // Load booking
      const bookingResult = await bookings.getBooking(bookingId);
      
      if (!bookingResult.success) {
        throw new Error(bookingResult.error || 'Failed to load booking');
      }
      
      booking = bookingResult.booking;
      
      // Load service
      service = await api.services.getById(booking.serviceId);
      
      // Check if payment already exists
      const paymentResult = await payment.getPaymentByBookingId(bookingId);
      
      if (paymentResult.success && paymentResult.payment) {
        existingPayment = paymentResult.payment;
      }
    } catch (err) {
      console.error('Failed to load payment details:', err);
      error = err instanceof Error ? err.message : 'Failed to load payment details';
    } finally {
      isLoading = false;
    }
  });
  
  // Handle payment success
  function handlePaymentSuccess(event: CustomEvent) {
    existingPayment = event.detail.payment;
    
    // Redirect to booking details after a short delay
    setTimeout(() => {
      goto(`/bookings/${bookingId}`);
    }, 2000);
  }
  
  // Format date
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  // Format time
  function formatTime(timeString: string): string {
    // Assuming timeString is in 24-hour format like "14:00"
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }
  
  // Calculate amount in cents
  $: amount = service ? Math.round(parseFloat(service.price.toString()) * 100) : 0;
</script>

<svelte:head>
  <title>Payment - FAIT</title>
  <meta name="description" content="Complete your booking payment." />
</svelte:head>

<section class="bg-fait-light py-12">
  <div class="container-custom">
    <div class="mb-6">
      <Button variant="outline" size="sm" on:click={() => goto(`/bookings/${bookingId}`)}>
        &larr; Back to Booking
      </Button>
    </div>
    
    <h1 class="text-3xl font-ivy font-bold text-fait-dark mb-6">Complete Payment</h1>
    
    {#if isLoading}
      <div class="flex justify-center items-center py-12">
        <div class="spinner"></div>
      </div>
    {:else if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" in:fade>
        <p>{error}</p>
        <Button variant="secondary" size="sm" class="mt-2" on:click={() => goto('/bookings')}>
          Return to Bookings
        </Button>
      </div>
    {:else if existingPayment}
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6" in:fade>
        <p class="font-medium">Payment already completed!</p>
        <p>This booking has already been paid for.</p>
        {#if existingPayment.receiptUrl}
          <a href={existingPayment.receiptUrl} target="_blank" rel="noopener noreferrer" class="text-green-700 underline mt-2 inline-block">
            View Receipt
          </a>
        {/if}
      </div>
      
      <Button variant="primary" on:click={() => goto(`/bookings/${bookingId}`)}>
        Return to Booking Details
      </Button>
    {:else if booking && service}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Payment form -->
        <div class="lg:col-span-2" in:fly={{ y: 20, duration: 500 }}>
          <PaymentForm 
            bookingId={bookingId} 
            amount={amount}
            on:success={handlePaymentSuccess}
          />
        </div>
        
        <!-- Booking summary -->
        <div class="lg:col-span-1" in:fly={{ y: 20, duration: 500, delay: 200 }}>
          <Card variant="elevated" padding="lg" class="sticky top-4">
            <h3 class="text-xl font-bold mb-4">Booking Summary</h3>
            
            <div class="mb-4">
              <h4 class="font-medium text-lg">{service.title}</h4>
              <p class="text-gray-600">{service.description}</p>
            </div>
            
            <div class="space-y-2 mb-4">
              <div class="flex justify-between">
                <span class="text-gray-600">Date:</span>
                <span>{formatDate(booking.date)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Time:</span>
                <span>{formatTime(booking.time)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Duration:</span>
                <span>{service.duration} minutes</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Location:</span>
                <span>{booking.address}</span>
              </div>
            </div>
            
            <div class="border-t border-gray-200 pt-4 mt-4">
              <div class="flex justify-between font-medium">
                <span>Total:</span>
                <span class="text-fait-blue text-lg">
                  ${service.price}
                  {service.price_type === 'hourly' ? '/hr' : ''}
                </span>
              </div>
              <p class="text-sm text-gray-600 mt-1">
                {service.price_type === 'hourly' 
                  ? 'Final price may vary based on actual service duration.' 
                  : 'Fixed price for the entire service.'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    {/if}
  </div>
</section>
