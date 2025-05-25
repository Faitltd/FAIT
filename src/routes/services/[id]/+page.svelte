<script lang="ts">
  import { page } from '$app/stores';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  
  // Mock service data - in a real app, this would come from an API
  const services = [
    {
      id: '1',
      title: 'Home Cleaning',
      category: 'cleaning',
      description: 'Professional cleaning services for your home.',
      longDescription: 'Our professional home cleaning services are designed to keep your living space spotless and comfortable. Our experienced cleaners use eco-friendly products and pay attention to every detail, ensuring your home is not just clean, but healthy too.',
      image: '/images/home-cleaning.jpg',
      price: 'From $25/hour',
      features: [
        'Deep cleaning of all rooms',
        'Kitchen and bathroom sanitization',
        'Dusting and vacuuming',
        'Window cleaning',
        'Eco-friendly products'
      ],
      provider: {
        name: 'Clean Home Co-op',
        rating: 4.8,
        reviews: 124,
        image: '/images/provider-1.jpg'
      }
    },
    {
      id: '2',
      title: 'Furniture Assembly',
      category: 'home',
      description: 'Expert assembly of all types of furniture.',
      longDescription: 'Skip the frustration of assembling furniture yourself. Our skilled technicians can quickly and correctly assemble any type of furniture, from beds and tables to complex entertainment centers and office furniture.',
      image: '/images/furniture-assembly.jpg',
      price: 'From $35/hour',
      features: [
        'Assembly of all furniture types',
        'Proper installation of all components',
        'Cleanup after assembly',
        'Furniture placement',
        'Tool provision'
      ],
      provider: {
        name: 'Assembly Experts',
        rating: 4.9,
        reviews: 87,
        image: '/images/provider-2.jpg'
      }
    },
    {
      id: '3',
      title: 'Lawn Mowing',
      category: 'garden',
      description: 'Keep your lawn looking neat and tidy.',
      longDescription: 'Maintain a beautiful lawn without the hassle. Our lawn mowing service includes professional cutting, edging, and cleanup to keep your outdoor space looking its best all season long.',
      image: '/images/lawn-mowing.jpg',
      price: 'From $30/hour',
      features: [
        'Professional lawn cutting',
        'Edging and trimming',
        'Cleanup of clippings',
        'Fertilization options',
        'Regular maintenance schedules'
      ],
      provider: {
        name: 'Green Gardens Co-op',
        rating: 4.7,
        reviews: 93,
        image: '/images/provider-3.jpg'
      }
    }
  ];
  
  // Get the service ID from the URL
  const serviceId = $page.params.id;
  
  // Find the service with the matching ID
  const service = services.find(s => s.id === serviceId);
  
  // Booking form state
  let date = '';
  let time = '';
  let notes = '';
  let submitted = false;
  
  function handleSubmit() {
    // In a real app, this would send the booking data to an API
    console.log({ serviceId, date, time, notes });
    submitted = true;
    
    // Reset form
    date = '';
    time = '';
    notes = '';
  }
</script>

<svelte:head>
  <title>{service ? service.title : 'Service Not Found'} - FAIT</title>
  <meta name="description" content={service ? service.description : 'Service details'} />
</svelte:head>

{#if service}
  <section class="bg-fait-light py-12">
    <div class="container-custom">
      <div class="flex flex-col md:flex-row gap-8">
        <!-- Service Image and Details -->
        <div class="md:w-2/3">
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={service.image} alt={service.title} class="w-full h-64 object-cover" />
            <div class="p-6">
              <h1 class="text-3xl font-ivy font-bold mb-2">{service.title}</h1>
              <p class="text-fait-accent font-medium mb-4">{service.price}</p>
              <p class="text-gray-700 mb-6">{service.longDescription}</p>
              
              <h2 class="text-xl font-bold mb-3">Features</h2>
              <ul class="space-y-2 mb-6">
                {#each service.features as feature}
                  <li class="flex items-start">
                    <span class="text-fait-blue mr-2">✓</span>
                    <span>{feature}</span>
                  </li>
                {/each}
              </ul>
              
              <div class="border-t border-gray-200 pt-6">
                <h2 class="text-xl font-bold mb-3">Provider</h2>
                <div class="flex items-center">
                  <div class="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img src={service.provider.image} alt={service.provider.name} class="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 class="font-bold">{service.provider.name}</h3>
                    <div class="flex items-center">
                      <span class="text-yellow-500 mr-1">★</span>
                      <span>{service.provider.rating}</span>
                      <span class="text-gray-500 ml-1">({service.provider.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Booking Form -->
        <div class="md:w-1/3">
          <Card variant="elevated" padding="lg">
            <h2 class="text-xl font-bold mb-4">Book This Service</h2>
            
            {#if submitted}
              <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <p>Thank you for your booking request! We'll confirm your appointment shortly.</p>
              </div>
            {/if}
            
            <form on:submit|preventDefault={handleSubmit} class="space-y-4">
              <div>
                <label for="date" class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date" 
                  id="date" 
                  bind:value={date} 
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
                />
              </div>
              
              <div>
                <label for="time" class="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <select 
                  id="time" 
                  bind:value={time} 
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
                >
                  <option value="">Select a time</option>
                  <option value="morning">Morning (8am - 12pm)</option>
                  <option value="afternoon">Afternoon (12pm - 5pm)</option>
                  <option value="evening">Evening (5pm - 8pm)</option>
                </select>
              </div>
              
              <div>
                <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                <textarea 
                  id="notes" 
                  bind:value={notes} 
                  rows="3"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
                ></textarea>
              </div>
              
              <Button type="submit" variant="primary" fullWidth={true}>Book Now</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Related Services -->
  <section class="py-12">
    <div class="container-custom">
      <h2 class="text-2xl font-ivy font-bold mb-6">Related Services</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each services.filter(s => s.id !== serviceId).slice(0, 3) as relatedService}
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={relatedService.image} alt={relatedService.title} class="w-full h-48 object-cover" />
            <div class="p-6">
              <h3 class="text-xl font-bold mb-2">{relatedService.title}</h3>
              <p class="text-gray-600 mb-4">{relatedService.description}</p>
              <div class="flex justify-between items-center">
                <span class="font-medium text-fait-accent">{relatedService.price}</span>
                <a href={`/services/${relatedService.id}`} class="text-fait-blue font-medium hover:underline">View Details</a>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>
{:else}
  <section class="bg-fait-light py-12">
    <div class="container-custom text-center">
      <h1 class="text-3xl font-ivy font-bold mb-4">Service Not Found</h1>
      <p class="text-lg mb-6">The service you're looking for doesn't exist or has been removed.</p>
      <Button href="/services" variant="primary">Browse All Services</Button>
    </div>
  </section>
{/if}
