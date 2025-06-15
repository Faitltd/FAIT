<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { bookings } from '$lib/stores/bookings';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  
  let isLoading = true;
  let error = null;
  let providerBookings = [];
  
  // Mock earnings data
  const earningsData = {
    today: '$120',
    thisWeek: '$750',
    thisMonth: '$3,200',
    lastMonth: '$2,800',
    pending: '$450',
    total: '$12,450',
    
    // Monthly earnings for chart
    monthlyEarnings: [
      { month: 'Jan', amount: 2200 },
      { month: 'Feb', amount: 2400 },
      { month: 'Mar', amount: 2600 },
      { month: 'Apr', amount: 2300 },
      { month: 'May', amount: 2800 },
      { month: 'Jun', amount: 3200 }
    ],
    
    // Service breakdown
    serviceBreakdown: [
      { service: 'Home Cleaning', amount: 1800, percentage: 56 },
      { service: 'Deep Cleaning', amount: 1000, percentage: 31 },
      { service: 'Move-out Cleaning', amount: 400, percentage: 13 }
    ]
  };
  
  // Filter states
  let periodFilter = 'month';
  
  // Load provider bookings
  onMount(async () => {
    if ($auth.user) {
      isLoading = true;
      error = null;
      
      const result = await bookings.loadProviderBookings($auth.user.id);
      
      isLoading = false;
      
      if (result.success) {
        providerBookings = $bookings.bookings;
      } else {
        error = result.error || 'Failed to load bookings';
      }
    }
  });
  
  // Format currency
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }
  
  // Get completed bookings
  $: completedBookings = providerBookings.filter(booking => booking.status === 'completed');
  
  // Get pending bookings
  $: pendingBookings = providerBookings.filter(booking => booking.status === 'pending' || booking.status === 'confirmed');
</script>

<svelte:head>
  <title>Earnings - FAIT</title>
  <meta name="description" content="View your earnings and financial analytics on the FAIT platform." />
</svelte:head>

<section class="bg-fait-light py-8">
  <div class="container-custom">
    <div class="mb-8">
      <h1 class="text-3xl font-ivy font-bold text-fait-dark mb-2">Earnings</h1>
      <p class="text-gray-600">Track your earnings and financial performance.</p>
    </div>
    
    <!-- Earnings Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card variant="elevated" padding="md">
        <div class="text-center">
          <h3 class="text-sm font-medium text-gray-500 mb-1">This Month</h3>
          <p class="text-2xl font-bold text-fait-blue">{earningsData.thisMonth}</p>
          <p class="text-xs text-gray-500">
            {earningsData.lastMonth !== earningsData.thisMonth ? 
              `${parseFloat(earningsData.thisMonth.replace('$', '')) > parseFloat(earningsData.lastMonth.replace('$', '')) ? '↑' : '↓'} 
              ${Math.abs(parseFloat(earningsData.thisMonth.replace('$', '')) - parseFloat(earningsData.lastMonth.replace('$', ''))).toFixed(2)}` : 
              'No change'} from last month
          </p>
        </div>
      </Card>
      
      <Card variant="elevated" padding="md">
        <div class="text-center">
          <h3 class="text-sm font-medium text-gray-500 mb-1">This Week</h3>
          <p class="text-2xl font-bold text-fait-blue">{earningsData.thisWeek}</p>
        </div>
      </Card>
      
      <Card variant="elevated" padding="md">
        <div class="text-center">
          <h3 class="text-sm font-medium text-gray-500 mb-1">Pending Payments</h3>
          <p class="text-2xl font-bold text-fait-accent">{earningsData.pending}</p>
        </div>
      </Card>
    </div>
    
    <!-- Earnings Chart -->
    <Card variant="elevated" padding="lg" class="mb-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold">Earnings History</h2>
        <div class="flex border border-gray-300 rounded-md overflow-hidden">
          <button 
            class="px-3 py-1 text-sm {periodFilter === 'week' ? 'bg-fait-blue text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}"
            on:click={() => periodFilter = 'week'}
          >
            Week
          </button>
          <button 
            class="px-3 py-1 text-sm {periodFilter === 'month' ? 'bg-fait-blue text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}"
            on:click={() => periodFilter = 'month'}
          >
            Month
          </button>
          <button 
            class="px-3 py-1 text-sm {periodFilter === 'year' ? 'bg-fait-blue text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}"
            on:click={() => periodFilter = 'year'}
          >
            Year
          </button>
        </div>
      </div>
      
      <div class="h-64">
        <!-- Simple chart visualization -->
        <div class="flex h-full items-end">
          {#each earningsData.monthlyEarnings as earning, i}
            <div class="flex-1 flex flex-col items-center">
              <div 
                class="w-full max-w-[40px] bg-fait-blue rounded-t-md" 
                style="height: {(earning.amount / Math.max(...earningsData.monthlyEarnings.map(e => e.amount))) * 80}%"
              ></div>
              <p class="text-xs mt-2">{earning.month}</p>
              <p class="text-xs font-medium">${earning.amount}</p>
            </div>
          {/each}
        </div>
      </div>
    </Card>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Service Breakdown -->
      <div class="lg:col-span-2">
        <Card variant="elevated" padding="lg">
          <h2 class="text-xl font-bold mb-6">Service Breakdown</h2>
          
          <div class="space-y-6">
            {#each earningsData.serviceBreakdown as service}
              <div>
                <div class="flex justify-between mb-1">
                  <p class="font-medium">{service.service}</p>
                  <p class="font-medium">${service.amount}</p>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div class="bg-fait-blue h-2.5 rounded-full" style="width: {service.percentage}%"></div>
                </div>
                <p class="text-xs text-gray-500 mt-1">{service.percentage}% of total earnings</p>
              </div>
            {/each}
          </div>
        </Card>
      </div>
      
      <!-- Recent Payments -->
      <div>
        <Card variant="elevated" padding="lg">
          <h2 class="text-xl font-bold mb-6">Recent Payments</h2>
          
          {#if completedBookings.length === 0}
            <p class="text-center text-gray-500">No completed bookings yet</p>
          {:else}
            <div class="space-y-4">
              {#each completedBookings.slice(0, 5) as booking}
                <div class="flex justify-between items-center pb-3 border-b border-gray-100">
                  <div>
                    <p class="font-medium">{booking.clientName}</p>
                    <p class="text-sm text-gray-600">{booking.serviceName}</p>
                    <p class="text-xs text-gray-500">{new Date(booking.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <p class="font-medium">{booking.price}</p>
                </div>
              {/each}
            </div>
            
            <div class="mt-4 text-center">
              <Button href="/provider/payments" variant="outline" size="sm">View All Payments</Button>
            </div>
          {/if}
        </Card>
      </div>
    </div>
  </div>
</section>
