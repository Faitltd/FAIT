<script>
  import { Home } from 'lucide-svelte';
</script>

<div class="min-h-screen flex flex-col items-center justify-center bg-gray-100">
  <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
    <div class="flex items-center justify-center mb-6">
      <Home class="w-8 h-8 text-primary-600 mr-2" />
      <h1 class="text-2xl font-bold text-gray-800">FAIT SvelteKit Template</h1>
    </div>
    <p class="text-gray-600 mb-4">
      This is a base template for FAIT applications using SvelteKit.
    </p>
    <div class="bg-gray-50 p-4 rounded border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-700 mb-2">Getting Started</h2>
      <ul class="list-disc pl-5 text-gray-600 space-y-1">
        <li>Customize this template for your specific app</li>
        <li>Add your components in <code class="bg-gray-100 px-1 rounded">src/lib/components</code></li>
        <li>Create routes in <code class="bg-gray-100 px-1 rounded">src/routes</code></li>
        <li>Add utility functions in <code class="bg-gray-100 px-1 rounded">src/lib/utils</code></li>
      </ul>
    </div>
  </div>
</div>
