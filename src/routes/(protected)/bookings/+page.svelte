<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { bookings, bookingsStore } from '$lib/stores/bookings';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';

  // Filter states
  let statusFilter = 'all';

  // Reactive values based on auth store
  $: userRole = $auth.user?.role || 'client';
  $: isAdmin = userRole === 'admin';
  $: pageTitle = isAdmin ? 'All Bookings' : 'My Bookings';

  // Filtered bookings
  $: filteredBookings = statusFilter === 'all'
    ? $bookingsStore.bookings
    : $bookingsStore.bookings.filter(booking => booking.status === statusFilter);

  // Handle booking actions
  async function cancelBooking(id: string) {
    const result = await bookings.cancelBooking(id);
    if (!result.success) {
      alert('Failed to cancel booking');
    }
  }

  function rescheduleBooking(id: string) {
    console.log(`Rescheduling booking ${id}`);
    // In a real app, this would open a modal or navigate to a form
  }

  function bookAgain(id: string) {
    console.log(`Booking again ${id}`);
    // In a real app, this would pre-fill a booking form
  }

  // Reactive loading of bookings when auth state changes
  $: if ($auth.isAuthenticated && $auth.user) {
    bookings.loadBookings($auth.user.id, $auth.user.role);
  }

  onMount(async () => {
    // Initial load if already authenticated
    if ($auth.isAuthenticated && $auth.user) {
      await bookings.loadBookings($auth.user.id, $auth.user.role);
    }
  });
</script>

<svelte:head>
  <title>{pageTitle} - FAIT</title>
  <meta name="description" content="{isAdmin ? 'Manage all bookings across the platform' : 'Manage your service bookings'} with FAIT." />
</svelte:head>

<section class="bg-fait-light py-8">
  <div class="container-custom">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-inter font-bold text-gray-900">{pageTitle}</h1>
      {#if !isAdmin}
        <Button href="/services" variant="primary">Book New Service</Button>
      {:else}
        <div class="flex gap-2">
          <Button href="/admin/services" variant="outline">Manage Services</Button>
          <Button href="/admin" variant="primary">Admin Dashboard</Button>
        </div>
      {/if}
    </div>

    <!-- Filters -->
    <div class="flex mb-6 border-b border-gray-200">
      <button
        class="px-4 py-2 font-medium {statusFilter === 'all' ? 'text-fait-blue border-b-2 border-fait-blue' : 'text-gray-500 hover:text-fait-blue'}"
        on:click={() => statusFilter = 'all'}
      >
        All
      </button>
      <button
        class="px-4 py-2 font-medium {statusFilter === 'pending' ? 'text-fait-blue border-b-2 border-fait-blue' : 'text-gray-500 hover:text-fait-blue'}"
        on:click={() => statusFilter = 'pending'}
      >
        Pending
      </button>
      <button
        class="px-4 py-2 font-medium {statusFilter === 'confirmed' ? 'text-fait-blue border-b-2 border-fait-blue' : 'text-gray-500 hover:text-fait-blue'}"
        on:click={() => statusFilter = 'confirmed'}
      >
        Confirmed
      </button>
      <button
        class="px-4 py-2 font-medium {statusFilter === 'completed' ? 'text-fait-blue border-b-2 border-fait-blue' : 'text-gray-500 hover:text-fait-blue'}"
        on:click={() => statusFilter = 'completed'}
      >
        Completed
      </button>
    </div>

    <!-- Bookings List -->
    {#if filteredBookings.length === 0}
      <Card variant="elevated" padding="md">
        <p class="text-center text-gray-500">No bookings found</p>
      </Card>
    {:else}
      <div class="grid grid-cols-1 gap-4">
        {#each filteredBookings as booking}
          <Card variant="elevated" padding="md">
            <div class="flex flex-col md:flex-row justify-between">
              <div>
                <div class="flex items-center mb-2">
                  <h3 class="text-lg font-inter font-bold">{booking.service}</h3>
                  <span class="ml-2 px-2 py-1 text-xs rounded-full
                    {booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'}">
                    {booking.status === 'confirmed' ? 'Confirmed' :
                      booking.status === 'pending' ? 'Pending' : 'Completed'}
                  </span>
                </div>
                <p class="text-gray-600 mb-1">Provider: {booking.provider}</p>
                <p class="text-gray-600 mb-1">Date: {booking.date} ({booking.time})</p>
                <p class="text-gray-600 mb-1">Price: {booking.price}</p>
                <p class="text-gray-600 mb-1">Address: {booking.address}</p>
                {#if booking.notes}
                  <p class="text-gray-600 mb-1">Notes: {booking.notes}</p>
                {/if}
              </div>

              <div class="mt-4 md:mt-0 flex md:flex-col gap-2">
                {#if booking.status === 'pending' || booking.status === 'confirmed'}
                  <Button variant="primary" href={`/bookings/${booking.id}`}>View Details</Button>
                  {#if booking.status === 'pending' || booking.status === 'confirmed'}
                    <Button variant="outline" on:click={() => rescheduleBooking(booking.id)}>Reschedule</Button>
                    <Button variant="outline" on:click={() => cancelBooking(booking.id)}>Cancel</Button>
                  {/if}
                {:else}
                  <Button variant="primary" on:click={() => bookAgain(booking.id)}>Book Again</Button>
                  <Button variant="outline" href={`/bookings/${booking.id}`}>View Details</Button>
                {/if}
              </div>
            </div>
          </Card>
        {/each}
      </div>
    {/if}
  </div>
</section>
