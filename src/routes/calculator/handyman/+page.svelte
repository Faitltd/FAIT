<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  
  // Task state
  let selectedTasks = [];
  let estimate = null;
  let isCalculating = false;
  
  // Handyman tasks with typical costs
  const handymanTasks = [
    { id: 'hang-pictures', name: 'Hang Pictures/Artwork', cost: 75, unit: 'per 5 items' },
    { id: 'mount-tv', name: 'Mount TV on Wall', cost: 150, unit: 'per TV' },
    { id: 'install-shelves', name: 'Install Shelves', cost: 100, unit: 'per shelf' },
    { id: 'fix-leaky-faucet', name: 'Fix Leaky Faucet', cost: 125, unit: 'per faucet' },
    { id: 'replace-light-fixture', name: 'Replace Light Fixture', cost: 175, unit: 'per fixture' },
    { id: 'install-ceiling-fan', name: 'Install Ceiling Fan', cost: 200, unit: 'per fan' },
    { id: 'patch-drywall', name: 'Patch Drywall Holes', cost: 80, unit: 'per room' },
    { id: 'caulk-bathroom', name: 'Caulk Bathroom/Kitchen', cost: 120, unit: 'per room' },
    { id: 'install-door-hardware', name: 'Install Door Hardware', cost: 60, unit: 'per door' },
    { id: 'replace-outlet', name: 'Replace Electrical Outlet', cost: 90, unit: 'per outlet' },
    { id: 'install-blinds', name: 'Install Window Blinds', cost: 85, unit: 'per window' },
    { id: 'fix-squeaky-door', name: 'Fix Squeaky Door/Hinge', cost: 45, unit: 'per door' },
    { id: 'install-grab-bars', name: 'Install Grab Bars', cost: 110, unit: 'per bar' },
    { id: 'replace-toilet-seat', name: 'Replace Toilet Seat', cost: 65, unit: 'per toilet' },
    { id: 'install-smoke-detector', name: 'Install Smoke Detector', cost: 95, unit: 'per detector' },
    { id: 'weather-stripping', name: 'Install Weather Stripping', cost: 70, unit: 'per door/window' },
    { id: 'touch-up-paint', name: 'Touch-up Paint', cost: 100, unit: 'per room' },
    { id: 'install-hooks', name: 'Install Hooks/Towel Bars', cost: 55, unit: 'per 3 items' }
  ];
  
  // Toggle task selection
  function toggleTask(taskId) {
    const existingIndex = selectedTasks.findIndex(t => t.id === taskId);
    
    if (existingIndex >= 0) {
      // Remove task
      selectedTasks = selectedTasks.filter(t => t.id !== taskId);
    } else {
      // Add task with default quantity
      const task = handymanTasks.find(t => t.id === taskId);
      if (task) {
        selectedTasks = [...selectedTasks, { ...task, quantity: 1 }];
      }
    }
  }
  
  // Update task quantity
  function updateQuantity(taskId, quantity) {
    selectedTasks = selectedTasks.map(task => 
      task.id === taskId ? { ...task, quantity: Math.max(1, quantity) } : task
    );
  }
  
  // Calculate estimate
  async function calculateEstimate() {
    if (selectedTasks.length === 0) {
      alert('Please select at least one task');
      return;
    }
    
    isCalculating = true;
    
    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const subtotal = selectedTasks.reduce((total, task) => {
      return total + (task.cost * task.quantity);
    }, 0);
    
    // Add service call fee for small jobs
    const serviceCallFee = subtotal < 200 ? 75 : 0;
    
    // Add discount for multiple tasks
    const multiTaskDiscount = selectedTasks.length >= 3 ? subtotal * 0.1 : 0;
    
    const total = subtotal + serviceCallFee - multiTaskDiscount;
    
    estimate = {
      subtotal,
      serviceCallFee,
      multiTaskDiscount,
      total: Math.round(total),
      taskCount: selectedTasks.length,
      estimatedTime: selectedTasks.reduce((time, task) => {
        // Estimate 30-60 minutes per task
        return time + (task.quantity * 45);
      }, 0)
    };
    
    isCalculating = false;
  }
  
  // Reset form
  function resetForm() {
    selectedTasks = [];
    estimate = null;
  }
  
  // Format currency
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  // Format time
  function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }
</script>

<svelte:head>
  <title>Handyman Task Estimator - FAIT</title>
  <meta name="description" content="Estimate costs for handyman tasks and small home repairs with FAIT's task calculator." />
</svelte:head>

<section class="bg-fait-light py-8">
  <div class="container-custom max-w-6xl">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-ivy font-bold text-fait-dark mb-4">Handyman Task Estimator</h1>
      <p class="text-lg text-gray-600">Select your tasks and get an instant cost estimate</p>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Task Selection -->
      <Card variant="elevated" padding="lg">
        <h2 class="text-xl font-bold mb-6">Select Your Tasks</h2>
        
        <div class="space-y-4 max-h-96 overflow-y-auto">
          {#each handymanTasks as task}
            {@const isSelected = selectedTasks.some(t => t.id === task.id)}
            {@const selectedTask = selectedTasks.find(t => t.id === task.id)}
            
            <div class="border rounded-lg p-4 {isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}">
              <label class="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  on:change={() => toggleTask(task.id)}
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <div class="ml-3 flex-1">
                  <div class="font-medium text-gray-900">{task.name}</div>
                  <div class="text-sm text-gray-600">{formatCurrency(task.cost)} {task.unit}</div>
                  
                  {#if isSelected}
                    <div class="mt-2 flex items-center">
                      <label for="quantity-{task.id}" class="text-sm text-gray-700 mr-2">Quantity:</label>
                      <input
                        id="quantity-{task.id}"
                        type="number"
                        min="1"
                        max="10"
                        value={selectedTask?.quantity || 1}
                        on:input={(e) => updateQuantity(task.id, parseInt(e.target.value))}
                        class="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  {/if}
                </div>
              </label>
            </div>
          {/each}
        </div>
        
        <div class="mt-6 flex gap-3">
          <Button 
            on:click={calculateEstimate} 
            variant="primary" 
            disabled={isCalculating || selectedTasks.length === 0}
            fullWidth={true}
          >
            {isCalculating ? 'Calculating...' : `Calculate Cost (${selectedTasks.length} tasks)`}
          </Button>
          <Button 
            on:click={resetForm} 
            variant="outline"
          >
            Reset
          </Button>
        </div>
      </Card>
      
      <!-- Results -->
      <div class="space-y-6">
        {#if estimate}
          <Card variant="elevated" padding="lg">
            <h2 class="text-xl font-bold mb-4">Cost Estimate</h2>
            
            <div class="bg-purple-50 rounded-lg p-6 mb-6">
              <h3 class="text-lg font-semibold text-purple-900 mb-2">
                {estimate.taskCount} Handyman Tasks
              </h3>
              <div class="text-3xl font-bold text-purple-600 mb-2">
                {formatCurrency(estimate.total)}
              </div>
              <div class="text-sm text-purple-700">
                Estimated time: {formatTime(estimate.estimatedTime)}
              </div>
            </div>
            
            <!-- Cost Breakdown -->
            <div class="space-y-3 mb-6">
              <h4 class="font-semibold text-gray-900">Cost Breakdown:</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span>Tasks Subtotal:</span>
                  <span>{formatCurrency(estimate.subtotal)}</span>
                </div>
                {#if estimate.serviceCallFee > 0}
                  <div class="flex justify-between text-orange-600">
                    <span>Service Call Fee:</span>
                    <span>+{formatCurrency(estimate.serviceCallFee)}</span>
                  </div>
                {/if}
                {#if estimate.multiTaskDiscount > 0}
                  <div class="flex justify-between text-green-600">
                    <span>Multi-Task Discount (10%):</span>
                    <span>-{formatCurrency(estimate.multiTaskDiscount)}</span>
                  </div>
                {/if}
                <div class="border-t pt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(estimate.total)}</span>
                </div>
              </div>
            </div>
            
            <!-- Selected Tasks -->
            <div class="mb-6">
              <h4 class="font-semibold text-gray-900 mb-3">Selected Tasks:</h4>
              <div class="space-y-2 text-sm">
                {#each selectedTasks as task}
                  <div class="flex justify-between">
                    <span>{task.name} (×{task.quantity})</span>
                    <span>{formatCurrency(task.cost * task.quantity)}</span>
                  </div>
                {/each}
              </div>
            </div>
            
            <div class="space-y-3 text-sm text-gray-600 mb-6">
              <p>• Prices include labor and basic materials</p>
              <p>• Service call fee waived for jobs over $200</p>
              <p>• 10% discount for 3+ tasks</p>
              <p>• Actual costs may vary by location</p>
            </div>
            
            <div class="space-y-3">
              <Button href="/services" variant="primary" fullWidth={true}>
                Find Handyman
              </Button>
              <Button href="/calculator/estimate" variant="outline" fullWidth={true}>
                Try General Calculator
              </Button>
            </div>
          </Card>
        {:else}
          <Card variant="elevated" padding="lg">
            <div class="text-center text-gray-500">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 class="text-lg font-medium mb-2">Select Your Tasks</h3>
              <p>Choose the handyman tasks you need and get an instant estimate</p>
            </div>
          </Card>
        {/if}
        
        <!-- Tips -->
        <Card variant="elevated" padding="lg">
          <h3 class="text-lg font-bold mb-4">Handyman Tips</h3>
          <div class="space-y-3 text-sm text-gray-600">
            <p>• Bundle multiple tasks for better rates</p>
            <p>• Most handyman tasks take 30-60 minutes</p>
            <p>• Provide clear descriptions and photos</p>
            <p>• Have materials ready if you're supplying them</p>
            <p>• Book during weekdays for better availability</p>
          </div>
        </Card>
      </div>
    </div>
  </div>
</section>
