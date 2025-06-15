<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { showSuccess, showError } from '$lib/components/notifications/toast';

  export let service: any = {
    title: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    location: ''
  };

  export let isEditing = false;

  const categories = [
    'Home & Garden',
    'Cleaning',
    'Repair & Maintenance',
    'Design & Creative',
    'Personal Care',
    'Events',
    'Business Services',
    'Other'
  ];

  async function handleSubmit() {
    try {
      // Validate form
      if (!service.title || !service.description || !service.category) {
        showError('Please fill in all required fields');
        return;
      }

      // Here you would typically make an API call
      console.log('Saving service:', service);

      showSuccess(isEditing ? 'Service updated successfully' : 'Service created successfully');

      // Reset form if creating new service
      if (!isEditing) {
        service = {
          title: '',
          description: '',
          category: '',
          price: '',
          duration: '',
          location: ''
        };
      }
    } catch (error) {
      showError('Failed to save service');
      console.error('Error saving service:', error);
    }
  }
</script>

<Card>
  <h2 class="text-2xl font-bold mb-6">
    {isEditing ? 'Edit Service' : 'Create New Service'}
  </h2>

  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
      <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
        Service Title *
      </label>
      <input
        id="title"
        type="text"
        bind:value={service.title}
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
        placeholder="Enter service title"
        required
      />
    </div>

    <div>
      <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
        Category *
      </label>
      <select
        id="category"
        bind:value={service.category}
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
        required
      >
        <option value="">Select a category</option>
        {#each categories as category}
          <option value={category}>{category}</option>
        {/each}
      </select>
    </div>

    <div>
      <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
        Description *
      </label>
      <textarea
        id="description"
        bind:value={service.description}
        rows="4"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
        placeholder="Describe your service"
        required
      ></textarea>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="price" class="block text-sm font-medium text-gray-700 mb-1">
          Price
        </label>
        <input
          id="price"
          type="text"
          bind:value={service.price}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
          placeholder="e.g., $50/hour"
        />
      </div>

      <div>
        <label for="duration" class="block text-sm font-medium text-gray-700 mb-1">
          Duration
        </label>
        <input
          id="duration"
          type="text"
          bind:value={service.duration}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
          placeholder="e.g., 2 hours"
        />
      </div>
    </div>

    <div>
      <label for="location" class="block text-sm font-medium text-gray-700 mb-1">
        Service Location
      </label>
      <input
        id="location"
        type="text"
        bind:value={service.location}
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
        placeholder="Where do you provide this service?"
      />
    </div>

    <div class="flex justify-end space-x-3 pt-4">
      <Button variant="outline" type="button">
        Cancel
      </Button>
      <Button variant="primary" type="submit">
        {isEditing ? 'Update Service' : 'Create Service'}
      </Button>
    </div>
  </form>
</Card>
