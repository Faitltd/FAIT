<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { services } from '$lib/stores/services';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  
  let service = null;
  let isLoading = true;
  let error = null;
  
  // Mock booking data
  const bookings = [
    {
      id: '1',
      client: 'John Smith',
      date: '2023-06-15',
      time: 'morning',
      status: 'confirmed',
      price: '$75'
    },
    {
      id: '2',
      client: 'Jane Doe',
      date: '2023-06-20',
      time: 'afternoon',
      status: 'pending',
      price: '$75'
    }
  ];
  
  // Mock analytics data
  const analytics = {
    totalBookings: 15,
    completedBookings: 12,
    cancelledBookings: 1,
    totalEarnings: '$375',
    averageRating: 4.8,
    reviewCount: 10
  };
  
  // Get service ID from URL
  const serviceId = $page.params.id;
  
  // Load service data
  onMount(async () => {
    isLoading = true;
    error = null;
    
    const result = await services.getService(serviceId);
    
    isLoading = false;
    
    if (result.success && result.service) {
      service = result.service;
    } else {
      error = result.error || 'Failed to load service';
    }
  });
</script>

<svelte:head>
  <title>{service ? service.title : 'Service Details'} - FAIT</title>
  <meta name="description" content={service ? `View details and bookings for ${service.title}` : 'Service details on the FAIT platform.'} />
</svelte:head>

<section class="bg-fait-light py-8">
  <div class="container-custom">
    {#if isLoading}
      <div class="bg-white rounded-lg shadow-md p-8 text-center">
        <p class="text-gray-600">Loading service data...</p>
      </div>
    {:else if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        <p>{error}</p>
        <div class="mt-4">
          <Button href="/dashboard" variant="primary">Back to Dashboard</Button>
        </div>
      </div>
    {:else if service}
      <div class="flex justify-between items-start mb-8">
        <div>
          <h1 class="text-3xl font-ivy font-bold text-fait-dark mb-2">{service.title}</h1>
          <div class="flex items-center">
            <span class="px-2 py-1 text-xs rounded-full {service.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} mr-2">
              {service.active ? 'Active' : 'Inactive'}
            </span>
            <span class="text-gray-600">{service.category}</span>
          </div>
        </div>
        <Button href={`/services/${service.id}/edit`} variant="primary">Edit Service</Button>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Service Details -->
        <div class="lg:col-span-2">
          <Card variant="elevated" padding="lg">
            <div class="flex flex-col md:flex-row gap-6">
              <div class="md:w-1/3">
                <img src={service.imageUrl} alt={service.title} class="w-full h-auto rounded-md" />
              </div>
              <div class="md:w-2/3">
                <h2 class="text-xl font-bold mb-4">Service Details</h2>
                <p class="text-gray-600 mb-4">{service.description}</p>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <h3 class="text-sm font-medium text-gray-500">Price</h3>
                    <p class="font-medium">${service.price}{service.priceType === 'hourly' ? '/hour' : ' fixed'}</p>
                  </div>
                  <div>
                    <h3 class="text-sm font-medium text-gray-500">Duration</h3>
                    <p class="font-medium">{service.duration} minutes</p>
                  </div>
                  <div>
                    <h3 class="text-sm font-medium text-gray-500">Created</h3>
                    <p class="font-medium">{new Date(service.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 class="text-sm font-medium text-gray-500">Last Updated</h3>
                    <p class="font-medium">{new Date(service.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          <!-- Recent Bookings -->
          <h2 class="text-2xl font-ivy font-bold text-fait-dark mt-8 mb-4">Recent Bookings</h2>
          {#if bookings.length === 0}
            <Card variant="elevated" padding="md">
              <p class="text-center text-gray-500">No bookings yet</p>
            </Card>
          {:else}
            <div class="grid grid-cols-1 gap-4">
              {#each bookings as booking}
                <Card variant="elevated" padding="md">
                  <div class="flex justify-between items-center">
                    <div>
                      <div class="flex items-center mb-1">
                        <h3 class="font-bold">{booking.client}</h3>
                        <span class="ml-2 px-2 py-1 text-xs rounded-full {booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                          {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                        </span>
                      </div>
                      <p class="text-gray-600 text-sm">{booking.date} ({booking.time}) - {booking.price}</p>
                    </div>
                    <Button href={`/provider/bookings/${booking.id}`} variant="outline" size="sm">View Details</Button>
                  </div>
                </Card>
              {/each}
            </div>
          {/if}
        </div>
        
        <!-- Analytics -->
        <div>
          <Card variant="elevated" padding="lg">
            <h2 class="text-xl font-bold mb-6">Service Analytics</h2>
            
            <div class="space-y-6">
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-2">Bookings</h3>
                <div class="grid grid-cols-3 gap-4">
                  <div class="text-center">
                    <p class="text-2xl font-bold text-fait-blue">{analytics.totalBookings}</p>
                    <p class="text-xs text-gray-500">Total</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold text-green-600">{analytics.completedBookings}</p>
                    <p class="text-xs text-gray-500">Completed</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold text-red-600">{analytics.cancelledBookings}</p>
                    <p class="text-xs text-gray-500">Cancelled</p>
                  </div>
                </div>
              </div>
              
              <div class="pt-4 border-t border-gray-200">
                <h3 class="text-sm font-medium text-gray-500 mb-2">Earnings</h3>
                <p class="text-2xl font-bold text-fait-blue">{analytics.totalEarnings}</p>
              </div>
              
              <div class="pt-4 border-t border-gray-200">
                <h3 class="text-sm font-medium text-gray-500 mb-2">Ratings</h3>
                <div class="flex items-center">
                  <div class="flex text-yellow-400 mr-2">
                    {#each Array(5) as _, i}
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill={i < Math.floor(analytics.averageRating) ? 'currentColor' : 'none'} stroke="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    {/each}
                  </div>
                  <span class="font-bold">{analytics.averageRating}</span>
                  <span class="text-gray-500 ml-1">({analytics.reviewCount} reviews)</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    {/if}
  </div>
</section>
