<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  
  // Mock data for bookings
  const bookings = [
    {
      id: '1',
      service: 'Home Cleaning',
      client: 'John Smith',
      date: '2023-06-15',
      time: 'morning',
      status: 'confirmed',
      address: '123 Main St, Anytown, USA',
      notes: 'Please bring eco-friendly cleaning products'
    },
    {
      id: '2',
      service: 'Home Cleaning',
      client: 'Jane Doe',
      date: '2023-06-16',
      time: 'afternoon',
      status: 'pending',
      address: '456 Oak St, Anytown, USA',
      notes: 'Have two cats, please be careful with the door'
    },
    {
      id: '3',
      service: 'Home Cleaning',
      client: 'Bob Johnson',
      date: '2023-06-18',
      time: 'morning',
      status: 'confirmed',
      address: '789 Pine St, Anytown, USA',
      notes: ''
    }
  ];
  
  // Mock data for earnings
  const earnings = {
    today: '$120',
    thisWeek: '$750',
    thisMonth: '$3,200',
    pending: '$450'
  };
  
  // Mock data for services
  const services = [
    {
      id: '1',
      title: 'Home Cleaning',
      price: '$25/hour',
      active: true,
      bookings: 12
    },
    {
      id: '2',
      title: 'Deep Cleaning',
      price: '$35/hour',
      active: true,
      bookings: 5
    },
    {
      id: '3',
      title: 'Move-out Cleaning',
      price: '$40/hour',
      active: false,
      bookings: 0
    }
  ];
  
  // Handle booking actions
  function acceptBooking(id: string) {
    console.log(`Accepting booking ${id}`);
    // In a real app, this would call an API
  }
  
  function declineBooking(id: string) {
    console.log(`Declining booking ${id}`);
    // In a real app, this would call an API
  }
  
  function toggleServiceStatus(id: string) {
    console.log(`Toggling service ${id} status`);
    // In a real app, this would call an API
  }
</script>

<svelte:head>
  <title>Provider Dashboard - FAIT</title>
  <meta name="description" content="Manage your services, bookings, and earnings as a FAIT service provider." />
</svelte:head>

<section class="bg-fait-light py-8">
  <div class="container-custom">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-ivy font-bold text-fait-dark">Provider Dashboard</h1>
      <Button href="/provider/services/new" variant="primary">Add New Service</Button>
    </div>
    
    <!-- Dashboard Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card variant="elevated" padding="md">
        <div class="text-center">
          <h3 class="text-sm font-medium text-gray-500 mb-1">Today's Earnings</h3>
          <p class="text-2xl font-bold text-fait-blue">{earnings.today}</p>
        </div>
      </Card>
      
      <Card variant="elevated" padding="md">
        <div class="text-center">
          <h3 class="text-sm font-medium text-gray-500 mb-1">This Week</h3>
          <p class="text-2xl font-bold text-fait-blue">{earnings.thisWeek}</p>
        </div>
      </Card>
      
      <Card variant="elevated" padding="md">
        <div class="text-center">
          <h3 class="text-sm font-medium text-gray-500 mb-1">This Month</h3>
          <p class="text-2xl font-bold text-fait-blue">{earnings.thisMonth}</p>
        </div>
      </Card>
      
      <Card variant="elevated" padding="md">
        <div class="text-center">
          <h3 class="text-sm font-medium text-gray-500 mb-1">Pending Payments</h3>
          <p class="text-2xl font-bold text-fait-accent">{earnings.pending}</p>
        </div>
      </Card>
    </div>
    
    <!-- Upcoming Bookings -->
    <h2 class="text-2xl font-ivy font-bold text-fait-dark mb-4">Upcoming Bookings</h2>
    <div class="mb-8">
      {#if bookings.length === 0}
        <Card variant="elevated" padding="md">
          <p class="text-center text-gray-500">No upcoming bookings</p>
        </Card>
      {:else}
        <div class="grid grid-cols-1 gap-4">
          {#each bookings as booking}
            <Card variant="elevated" padding="md">
              <div class="flex flex-col md:flex-row justify-between">
                <div>
                  <div class="flex items-center mb-2">
                    <h3 class="text-lg font-bold">{booking.service}</h3>
                    <span class="ml-2 px-2 py-1 text-xs rounded-full {booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                      {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                  <p class="text-gray-600 mb-1">Client: {booking.client}</p>
                  <p class="text-gray-600 mb-1">Date: {booking.date} ({booking.time})</p>
                  <p class="text-gray-600 mb-1">Address: {booking.address}</p>
                  {#if booking.notes}
                    <p class="text-gray-600 mb-1">Notes: {booking.notes}</p>
                  {/if}
                </div>
                
                <div class="mt-4 md:mt-0 flex md:flex-col gap-2">
                  {#if booking.status === 'pending'}
                    <Button variant="primary" on:click={() => acceptBooking(booking.id)}>Accept</Button>
                    <Button variant="outline" on:click={() => declineBooking(booking.id)}>Decline</Button>
                  {:else}
                    <Button variant="primary" href={`/provider/bookings/${booking.id}`}>View Details</Button>
                  {/if}
                </div>
              </div>
            </Card>
          {/each}
        </div>
      {/if}
    </div>
    
    <!-- Your Services -->
    <h2 class="text-2xl font-ivy font-bold text-fait-dark mb-4">Your Services</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each services as service}
        <Card variant="elevated" padding="md">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-lg font-bold">{service.title}</h3>
            <div class="flex items-center">
              <span class="text-sm mr-2 {service.active ? 'text-green-600' : 'text-gray-500'}">
                {service.active ? 'Active' : 'Inactive'}
              </span>
              <button 
                class="w-10 h-5 rounded-full {service.active ? 'bg-green-500' : 'bg-gray-300'} relative"
                on:click={() => toggleServiceStatus(service.id)}
              >
                <span class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transform {service.active ? 'translate-x-5' : ''}"></span>
              </button>
            </div>
          </div>
          <p class="text-gray-600 mb-4">Price: {service.price}</p>
          <div class="flex justify-between">
            <span class="text-sm text-gray-500">{service.bookings} bookings</span>
            <Button variant="outline" href={`/provider/services/${service.id}`} size="sm">Edit</Button>
          </div>
        </Card>
      {/each}
    </div>
  </div>
</section>
