<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { api } from '$lib/services/api';
  import { auth } from '$lib/stores/auth';
  import { reviews } from '$lib/stores/reviews';
  import type { Service } from '$lib/services/supabase';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import BookingModal from '$lib/components/bookings/BookingModal.svelte';
  import ReviewList from '$lib/components/reviews/ReviewList.svelte';
  import StarRating from '$lib/components/reviews/StarRating.svelte';
  import { fade, fly } from 'svelte/transition';

  // State
  let service: Service | null = null;
  let isLoading = true;
  let error: string | null = null;
  let showBookingModal = false;

  // Get service ID from URL
  $: serviceId = $page.params.id;

  // Load service on mount
  onMount(async () => {
    try {
      isLoading = true;
      service = await api.services.getById(serviceId);
    } catch (err) {
      console.error('Failed to load service:', err);
      error = err instanceof Error ? err.message : 'Failed to load service';

      // Fallback to mock data if API fails
      service = getMockService();
    } finally {
      isLoading = false;
    }
  });

  // Format price display
  $: priceDisplay = service?.price_type === 'hourly'
    ? `$${service.price}/hr`
    : `$${service.price}`;

  // Open booking modal
  function openBookingModal() {
    showBookingModal = true;
  }

  // Close booking modal
  function closeBookingModal() {
    showBookingModal = false;
  }

  // Handle booking success
  function handleBookingSuccess() {
    // You could add additional logic here, like showing a notification
    console.log('Booking successful!');
  }

  // Mock service for fallback
  function getMockService(): Service {
    return {
      id: serviceId,
      title: 'Sample Service',
      description: 'This is a sample service description. The actual service could not be loaded.',
      category: 'other',
      price: 25,
      price_type: 'hourly',
      duration: 60,
      active: true,
      image_url: '/images/default-service.jpg',
      provider_id: '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
</script>

<svelte:head>
  <title>{service ? service.title : 'Service Details'} - FAIT</title>
  <meta name="description" content={service ? service.description : 'Service details page'} />
</svelte:head>

<section class="bg-fait-light py-12">
  <div class="container-custom">
    {#if isLoading}
      <div class="flex justify-center items-center py-12">
        <div class="spinner"></div>
      </div>
    {:else if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" in:fade>
        <p>{error}</p>
        <Button variant="secondary" size="sm" class="mt-2" on:click={() => { error = null; isLoading = true; service = getMockService(); isLoading = false; }}>
          Load Sample Data
        </Button>
      </div>
    {:else if service}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Service details -->
        <div class="lg:col-span-2" in:fly={{ y: 20, duration: 500 }}>
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            {#if service.image_url}
              <img
                src={service.image_url}
                alt={service.title}
                class="w-full h-64 object-cover"
              />
            {/if}

            <div class="p-6">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h1 class="text-3xl font-ivy font-bold text-fait-dark">{service.title}</h1>
                  <div class="flex items-center mt-2">
                    <span class="bg-fait-blue text-white text-xs px-2 py-1 rounded-full">
                      {service.category}
                    </span>
                    <span class="ml-4 text-fait-blue font-bold text-xl">
                      {priceDisplay}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  on:click={openBookingModal}
                  class="lg:hidden"
                >
                  Book Now
                </Button>
              </div>

              <div class="prose max-w-none">
                <h2 class="text-xl font-bold mb-2">Description</h2>
                <p>{service.description}</p>

                <h2 class="text-xl font-bold mt-6 mb-2">Details</h2>
                <ul class="space-y-2">
                  <li><strong>Duration:</strong> {service.duration} minutes</li>
                  <li><strong>Price Type:</strong> {service.price_type === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Booking sidebar -->
        <div class="lg:col-span-1" in:fly={{ y: 20, duration: 500, delay: 200 }}>
          <Card variant="elevated" padding="lg" class="sticky top-4">
            <h3 class="text-xl font-bold mb-4">Book this Service</h3>

            <div class="mb-4">
              <div class="flex justify-between items-center mb-2">
                <span class="font-medium">Price:</span>
                <span class="text-fait-blue font-bold text-xl">{priceDisplay}</span>
              </div>
              <p class="text-sm text-gray-600">
                {service.price_type === 'hourly'
                  ? 'Final price may vary based on actual service duration.'
                  : 'Fixed price for the entire service.'}
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth={true}
              on:click={openBookingModal}
              animate={true}
            >
              Book Now
            </Button>

            <div class="mt-4 text-sm text-gray-600">
              <p>By booking this service, you agree to our <a href="/terms" class="text-fait-blue hover:underline">Terms of Service</a> and <a href="/privacy" class="text-fait-blue hover:underline">Privacy Policy</a>.</p>
            </div>
          </Card>
        </div>
      </div>

      <!-- Reviews Section -->
      {#if service && !isLoading && !error}
        <div class="mt-12">
          <h2 class="text-2xl font-ivy font-bold text-fait-dark mb-6">Customer Reviews</h2>
          <ReviewList serviceId={service.id} />
        </div>
      {/if}
    {/if}
  </div>
</section>

<!-- Booking Modal -->
<BookingModal
  open={showBookingModal}
  service={service}
  on:close={closeBookingModal}
  on:success={handleBookingSuccess}
/>
