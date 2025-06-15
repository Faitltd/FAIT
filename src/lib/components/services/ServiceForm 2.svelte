<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  
  // Define service interface
  export interface ServiceFormData {
    id?: string;
    title: string;
    description: string;
    category: string;
    price: string;
    priceType: 'hourly' | 'fixed';
    duration: number;
    active: boolean;
    image?: File | null;
    imageUrl?: string;
  }
  
  // Props
  export let service: ServiceFormData = {
    title: '',
    description: '',
    category: 'cleaning',
    price: '',
    priceType: 'hourly',
    duration: 60,
    active: true,
    image: null,
    imageUrl: ''
  };
  
  export let isSubmitting: boolean = false;
  export let error: string | null = null;
  
  // Local state
  let imagePreview: string | null = service.imageUrl || null;
  
  // Available categories
  const categories = [
    { id: 'cleaning', name: 'Cleaning' },
    { id: 'home', name: 'Home Maintenance' },
    { id: 'garden', name: 'Garden & Outdoors' },
    { id: 'moving', name: 'Moving & Storage' },
    { id: 'repair', name: 'Repair & Maintenance' },
    { id: 'delivery', name: 'Delivery' },
    { id: 'events', name: 'Events' },
    { id: 'tech', name: 'Tech Support' },
    { id: 'other', name: 'Other' }
  ];
  
  // Event dispatcher
  const dispatch = createEventDispatcher<{
    submit: ServiceFormData;
    cancel: void;
  }>();
  
  // Handle image upload
  function handleImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      service.image = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  
  // Handle form submission
  function handleSubmit() {
    // Validate form
    if (!service.title) {
      error = 'Service title is required';
      return;
    }
    
    if (!service.description) {
      error = 'Service description is required';
      return;
    }
    
    if (!service.price) {
      error = 'Service price is required';
      return;
    }
    
    // Dispatch submit event
    dispatch('submit', service);
  }
  
  // Handle cancel
  function handleCancel() {
    dispatch('cancel');
  }
</script>

<Card variant="elevated" padding="lg">
  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
      <p>{error}</p>
    </div>
  {/if}
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-6">
    <div>
      <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Service Title*</label>
      <input 
        type="text" 
        id="title" 
        bind:value={service.title} 
        required
        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
        placeholder="e.g. Home Cleaning"
      />
    </div>
    
    <div>
      <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description*</label>
      <textarea 
        id="description" 
        bind:value={service.description} 
        required
        rows="4"
        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
        placeholder="Describe your service in detail..."
      ></textarea>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category*</label>
        <select 
          id="category" 
          bind:value={service.category} 
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
        >
          {#each categories as category}
            <option value={category.id}>{category.name}</option>
          {/each}
        </select>
      </div>
      
      <div>
        <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Price*</label>
        <div class="flex">
          <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">$</span>
          <input 
            type="text" 
            id="price" 
            bind:value={service.price} 
            required
            class="flex-1 min-w-0 block w-full px-4 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-fait-blue"
            placeholder="25"
          />
          <select 
            bind:value={service.priceType} 
            class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500"
          >
            <option value="hourly">/hour</option>
            <option value="fixed">fixed</option>
          </select>
        </div>
      </div>
      
      <div>
        <label for="duration" class="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
        <input 
          type="number" 
          id="duration" 
          bind:value={service.duration} 
          min="15"
          step="15"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <div class="flex items-center space-x-4">
          <label class="inline-flex items-center">
            <input 
              type="radio" 
              bind:group={service.active} 
              value={true}
              class="h-4 w-4 text-fait-blue focus:ring-fait-blue border-gray-300"
            />
            <span class="ml-2">Active</span>
          </label>
          <label class="inline-flex items-center">
            <input 
              type="radio" 
              bind:group={service.active} 
              value={false}
              class="h-4 w-4 text-fait-blue focus:ring-fait-blue border-gray-300"
            />
            <span class="ml-2">Inactive</span>
          </label>
        </div>
      </div>
    </div>
    
    <div>
      <label for="image" class="block text-sm font-medium text-gray-700 mb-1">Service Image</label>
      <div class="mt-1 flex items-center">
        {#if imagePreview}
          <div class="relative">
            <img src={imagePreview} alt="Service preview" class="h-32 w-32 object-cover rounded-md" />
            <button 
              type="button" 
              class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2"
              on:click={() => {
                service.image = null;
                imagePreview = null;
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        {:else}
          <label for="image-upload" class="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fait-blue">
            Upload Image
          </label>
        {/if}
        <input 
          id="image-upload" 
          name="image" 
          type="file" 
          accept="image/*"
          class="sr-only"
          on:change={handleImageChange}
        />
      </div>
    </div>
    
    <div class="flex justify-end space-x-3">
      <Button type="button" variant="outline" on:click={handleCancel}>Cancel</Button>
      <Button type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : service.id ? 'Update Service' : 'Create Service'}
      </Button>
    </div>
  </form>
</Card>
