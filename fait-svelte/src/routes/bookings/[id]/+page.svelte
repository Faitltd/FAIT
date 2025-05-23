<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  import { bookings } from '$lib/stores/bookings';
  import { api } from '$lib/services/api';
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import BookingChat from '$lib/components/messaging/BookingChat.svelte';
  import ReviewForm from '$lib/components/reviews/ReviewForm.svelte';
  import { reviews } from '$lib/stores/reviews';
  import { fade, fly } from 'svelte/transition';
  import type { Service } from '$lib/services/supabase';

  // State
  let booking = null;
  let service: Service | null = null;
  let isLoading = true;
  let error: string | null = null;
  let existingReview = null;

  // Get booking ID from URL
  $: bookingId = $page.params.id;

  // Load booking and service on mount
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
      const result = await bookings.getBooking(bookingId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to load booking');
      }

      booking = result.booking;

      // Load service
      service = await api.services.getById(booking.serviceId);

      // Check if there's an existing review
      if (booking.status === 'completed') {
        const reviewResult = await reviews.getReviewForBooking(bookingId);
        if (reviewResult.success && reviewResult.review) {
          existingReview = reviewResult.review;
        }
      }
    } catch (err) {
      console.error('Failed to load booking details:', err);
      error = err instanceof Error ? err.message : 'Failed to load booking details';
    } finally {
      isLoading = false;
    }
  });

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

  // Get status badge class
  function getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Cancel booking
  async function cancelBooking() {
    if (confirm('Are you sure you want to cancel this booking?')) {
      await bookings.cancelBooking(bookingId);

      // Reload booking
      const result = await bookings.getBooking(bookingId);
      if (result.success) {
        booking = result.booking;
      }
    }
  }
</script>

<svelte:head>
  <title>Booking Details - FAIT</title>
  <meta name="description" content="View details of your service booking." />
</svelte:head>

<section class="bg-fait-light py-12">
  <div class="container-custom">
    <div class="mb-6">
      <Button variant="outline" size="sm" on:click={() => goto('/bookings')}>
        &larr; Back to Bookings
      </Button>
    </div>

    <h1 class="text-3xl font-ivy font-bold text-fait-dark mb-6">Booking Details</h1>

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
    {:else if booking && service}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Booking details -->
        <div class="lg:col-span-2" in:fly={{ y: 20, duration: 500 }}>
          <Card variant="elevated" padding="lg">
            <div class="flex justify-between items-start mb-6">
              <h2 class="text-2xl font-bold">{service.title}</h2>
              <span class="px-3 py-1 text-sm font-medium rounded-full {getStatusBadgeClass(booking.status)}">
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 class="text-lg font-medium mb-2">Booking Information</h3>
                <ul class="space-y-2 text-gray-700">
                  <li><strong>Date:</strong> {formatDate(booking.date)}</li>
                  <li><strong>Time:</strong> {formatTime(booking.time)}</li>
                  <li><strong>Price:</strong> ${booking.price}</li>
                  <li><strong>Booking ID:</strong> {booking.id}</li>
                  <li><strong>Created:</strong> {new Date(booking.createdAt).toLocaleDateString()}</li>
                </ul>
              </div>

              <div>
                <h3 class="text-lg font-medium mb-2">Service Location</h3>
                <p class="text-gray-700 mb-4">{booking.address}</p>

                {#if booking.notes}
                  <h3 class="text-lg font-medium mb-2">Notes</h3>
                  <p class="text-gray-700">{booking.notes}</p>
                {/if}
              </div>
            </div>

            <div class="border-t border-gray-200 pt-6">
              <h3 class="text-lg font-medium mb-2">Service Details</h3>
              <p class="text-gray-700 mb-4">{service.description}</p>

              <ul class="space-y-2 text-gray-700">
                <li><strong>Duration:</strong> {service.duration} minutes</li>
                <li><strong>Price Type:</strong> {service.price_type === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}</li>
                <li><strong>Category:</strong> {service.category}</li>
              </ul>
            </div>
          </Card>
        </div>

        <!-- Actions sidebar -->
        <div class="lg:col-span-1" in:fly={{ y: 20, duration: 500, delay: 200 }}>
          <Card variant="elevated" padding="lg" class="sticky top-4">
            <h3 class="text-xl font-bold mb-4">Booking Actions</h3>

            {#if booking.status === 'pending' || booking.status === 'confirmed'}
              <div class="space-y-4">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth={true}
                  on:click={() => goto(`/bookings/${booking.id}/payment`)}
                >
                  Pay Now
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  fullWidth={true}
                  on:click={cancelBooking}
                >
                  Cancel Booking
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  fullWidth={true}
                  on:click={() => goto(`/services/${service.id}`)}
                >
                  View Service
                </Button>

                <div class="mt-4 text-sm text-gray-600">
                  <p class="mb-2"><strong>Need help?</strong></p>
                  <p>Contact the service provider or our support team if you need to make changes to your booking.</p>
                  <p class="mt-2">
                    <a href="/contact" class="text-fait-blue hover:underline">Contact Support</a>
                  </p>
                </div>
              </div>
            {:else if booking.status === 'completed'}
              <div class="space-y-4">
                <div class="bg-green-100 text-green-800 p-4 rounded-md mb-4">
                  <p class="font-medium">This booking has been completed.</p>
                  <p class="text-sm mt-1">Thank you for using our service!</p>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth={true}
                  on:click={() => goto(`/services/${service.id}`)}
                >
                  Book Again
                </Button>

                {#if !existingReview}
                  <div class="mt-6 pt-6 border-t border-gray-200">
                    <h3 class="text-lg font-medium mb-4">Share Your Experience</h3>
                    <p class="text-gray-600 mb-4">How was your experience with this service? Leave a review to help others.</p>

                    <ReviewForm
                      bookingId={booking.id}
                      serviceId={service.id}
                      providerId={booking.providerId}
                      clientId={booking.clientId}
                      on:success={() => {
                        // Reload the review
                        reviews.getReviewForBooking(booking.id).then(result => {
                          if (result.success && result.review) {
                            existingReview = result.review;
                          }
                        });
                      }}
                    />
                  </div>
                {:else}
                  <div class="mt-6 pt-6 border-t border-gray-200">
                    <h3 class="text-lg font-medium mb-4">Your Review</h3>
                    <div class="bg-gray-50 p-4 rounded-md">
                      <div class="flex items-center mb-2">
                        <StarRating rating={existingReview.rating} size="md" />
                        <span class="ml-2 text-gray-600">{existingReview.rating} out of 5</span>
                      </div>
                      <p class="text-gray-800">{existingReview.comment}</p>
                      <p class="text-xs text-gray-500 mt-2">
                        Posted on {new Date(existingReview.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div class="mt-4">
                      <ReviewForm
                        bookingId={booking.id}
                        serviceId={service.id}
                        providerId={booking.providerId}
                        clientId={booking.clientId}
                        existingReview={existingReview}
                        on:success={(event) => {
                          existingReview = event.detail.review;
                        }}
                      />
                    </div>
                  </div>
                {/if}
              </div>
            {:else if booking.status === 'cancelled'}
              <div class="space-y-4">
                <div class="bg-red-100 text-red-800 p-4 rounded-md mb-4">
                  <p class="font-medium">This booking has been cancelled.</p>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth={true}
                  on:click={() => goto(`/services/${service.id}`)}
                >
                  Book Again
                </Button>
              </div>
            {/if}
          </Card>

          <!-- Booking Chat -->
          {#if booking.status !== 'cancelled'}
            <div class="mt-6">
              <BookingChat
                bookingId={booking.id}
                providerId={booking.providerId}
                clientId={booking.clientId}
              />
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</section>
