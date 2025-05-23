<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';

  // Props
  export let initialQuery = '';
  export let initialLocation = '';

  // Local state
  let query = initialQuery;
  let location = initialLocation;

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Handle form submission
  function handleSubmit() {
    dispatch('search', { query, location });
  }
</script>

<div class="bg-white rounded-lg shadow-md p-4 {$$props.class || ''}">
  <form on:submit|preventDefault={handleSubmit} class="flex flex-col md:flex-row gap-4">
    <div class="flex-1">
      <label for="search-query" class="block text-sm font-medium text-gray-700 mb-1">What service do you need?</label>
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </div>
        <input
          id="search-query"
          type="text"
          bind:value={query}
          placeholder="Search for services..."
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-fait-blue focus:border-fait-blue"
        />
      </div>
    </div>
    
    <div class="flex-1">
      <label for="search-location" class="block text-sm font-medium text-gray-700 mb-1">Where?</label>
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
        </div>
        <input
          id="search-location"
          type="text"
          bind:value={location}
          placeholder="City, neighborhood, or zip code"
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-fait-blue focus:border-fait-blue"
        />
      </div>
    </div>
    
    <div class="flex items-end">
      <Button type="submit" variant="primary" size="md" fullWidth={true} class="md:w-auto">
        Search
      </Button>
    </div>
  </form>
</div>
