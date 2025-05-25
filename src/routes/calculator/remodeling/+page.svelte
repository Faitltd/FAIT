<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  
  // Form state
  let roomType = '';
  let roomSize = '';
  let qualityLevel = '';
  let includeAppliances = false;
  let includeFlooring = false;
  let includePlumbing = false;
  let includeElectrical = false;
  let includePainting = false;
  let estimate = null;
  let isCalculating = false;
  
  // Room types with base costs per sq ft
  const roomTypes = [
    { id: 'kitchen', name: 'Kitchen', baseCostPerSqFt: 150 },
    { id: 'bathroom', name: 'Bathroom', baseCostPerSqFt: 120 },
    { id: 'living-room', name: 'Living Room', baseCostPerSqFt: 80 },
    { id: 'bedroom', name: 'Bedroom', baseCostPerSqFt: 70 },
    { id: 'basement', name: 'Basement', baseCostPerSqFt: 90 },
    { id: 'attic', name: 'Attic', baseCostPerSqFt: 85 }
  ];
  
  // Quality level multipliers
  const qualityMultipliers = {
    'budget': 0.7,
    'mid-range': 1.0,
    'high-end': 1.5,
    'luxury': 2.2
  };
  
  // Additional costs
  const additionalCosts = {
    appliances: 8000,
    flooring: 15,  // per sq ft
    plumbing: 3500,
    electrical: 2500,
    painting: 8     // per sq ft
  };
  
  // Calculate estimate
  async function calculateEstimate() {
    if (!roomType || !roomSize || !qualityLevel) {
      alert('Please fill in all required fields');
      return;
    }
    
    isCalculating = true;
    
    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const selectedRoom = roomTypes.find(r => r.id === roomType);
    const baseCostPerSqFt = selectedRoom?.baseCostPerSqFt || 80;
    const qualityMultiplier = qualityMultipliers[qualityLevel] || 1.0;
    const size = parseInt(roomSize) || 100;
    
    // Base cost
    let totalCost = baseCostPerSqFt * size * qualityMultiplier;
    
    // Add optional items
    if (includeAppliances) totalCost += additionalCosts.appliances;
    if (includeFlooring) totalCost += additionalCosts.flooring * size;
    if (includePlumbing) totalCost += additionalCosts.plumbing;
    if (includeElectrical) totalCost += additionalCosts.electrical;
    if (includePainting) totalCost += additionalCosts.painting * size;
    
    // Add some variance for realism
    const lowEstimate = Math.round(totalCost * 0.85);
    const highEstimate = Math.round(totalCost * 1.15);
    
    estimate = {
      low: lowEstimate,
      high: highEstimate,
      average: Math.round(totalCost),
      roomName: selectedRoom?.name || 'Room',
      size: size,
      breakdown: {
        base: Math.round(baseCostPerSqFt * size * qualityMultiplier),
        appliances: includeAppliances ? additionalCosts.appliances : 0,
        flooring: includeFlooring ? Math.round(additionalCosts.flooring * size) : 0,
        plumbing: includePlumbing ? additionalCosts.plumbing : 0,
        electrical: includeElectrical ? additionalCosts.electrical : 0,
        painting: includePainting ? Math.round(additionalCosts.painting * size) : 0
      }
    };
    
    isCalculating = false;
  }
  
  // Reset form
  function resetForm() {
    roomType = '';
    roomSize = '';
    qualityLevel = '';
    includeAppliances = false;
    includeFlooring = false;
    includePlumbing = false;
    includeElectrical = false;
    includePainting = false;
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
</script>

<svelte:head>
  <title>Remodeling Calculator - FAIT</title>
  <meta name="description" content="Calculate the cost of your remodeling project with FAIT's detailed remodeling calculator." />
</svelte:head>

<section class="bg-fait-light py-8">
  <div class="container-custom max-w-6xl">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-ivy font-bold text-fait-dark mb-4">Remodeling Calculator</h1>
      <p class="text-lg text-gray-600">Get detailed cost estimates for your room remodeling project</p>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Form -->
      <Card variant="elevated" padding="lg">
        <h2 class="text-xl font-bold mb-6">Remodeling Details</h2>
        
        <form on:submit|preventDefault={calculateEstimate} class="space-y-6">
          <!-- Room Type -->
          <div>
            <label for="roomType" class="block text-sm font-medium text-gray-700 mb-2">
              Room Type *
            </label>
            <select
              id="roomType"
              bind:value={roomType}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select room type</option>
              {#each roomTypes as room}
                <option value={room.id}>{room.name}</option>
              {/each}
            </select>
          </div>
          
          <!-- Room Size -->
          <div>
            <label for="roomSize" class="block text-sm font-medium text-gray-700 mb-2">
              Room Size (sq ft) *
            </label>
            <input
              type="number"
              id="roomSize"
              bind:value={roomSize}
              required
              min="50"
              max="2000"
              placeholder="e.g., 150"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <!-- Quality Level -->
          <div>
            <label for="qualityLevel" class="block text-sm font-medium text-gray-700 mb-2">
              Quality Level *
            </label>
            <select
              id="qualityLevel"
              bind:value={qualityLevel}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select quality level</option>
              <option value="budget">Budget (Basic materials)</option>
              <option value="mid-range">Mid-Range (Standard materials)</option>
              <option value="high-end">High-End (Premium materials)</option>
              <option value="luxury">Luxury (Top-tier materials)</option>
            </select>
          </div>
          
          <!-- Additional Items -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Additional Items (Optional)
            </label>
            <div class="space-y-3">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  bind:checked={includeAppliances}
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700">New Appliances (+$8,000)</span>
              </label>
              
              <label class="flex items-center">
                <input
                  type="checkbox"
                  bind:checked={includeFlooring}
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700">New Flooring (+$15/sq ft)</span>
              </label>
              
              <label class="flex items-center">
                <input
                  type="checkbox"
                  bind:checked={includePlumbing}
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700">Plumbing Updates (+$3,500)</span>
              </label>
              
              <label class="flex items-center">
                <input
                  type="checkbox"
                  bind:checked={includeElectrical}
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700">Electrical Updates (+$2,500)</span>
              </label>
              
              <label class="flex items-center">
                <input
                  type="checkbox"
                  bind:checked={includePainting}
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700">Professional Painting (+$8/sq ft)</span>
              </label>
            </div>
          </div>
          
          <!-- Buttons -->
          <div class="flex gap-3">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isCalculating}
              fullWidth={true}
            >
              {isCalculating ? 'Calculating...' : 'Calculate Cost'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              on:click={resetForm}
            >
              Reset
            </Button>
          </div>
        </form>
      </Card>
      
      <!-- Results -->
      <div class="space-y-6">
        {#if estimate}
          <Card variant="elevated" padding="lg">
            <h2 class="text-xl font-bold mb-4">Cost Estimate</h2>
            
            <div class="bg-green-50 rounded-lg p-6 mb-6">
              <h3 class="text-lg font-semibold text-green-900 mb-2">
                {estimate.roomName} Remodel ({estimate.size} sq ft)
              </h3>
              <div class="text-3xl font-bold text-green-600 mb-2">
                {formatCurrency(estimate.low)} - {formatCurrency(estimate.high)}
              </div>
              <div class="text-sm text-green-700">
                Average: {formatCurrency(estimate.average)}
              </div>
            </div>
            
            <!-- Cost Breakdown -->
            <div class="space-y-3 mb-6">
              <h4 class="font-semibold text-gray-900">Cost Breakdown:</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span>Base Remodel:</span>
                  <span>{formatCurrency(estimate.breakdown.base)}</span>
                </div>
                {#if estimate.breakdown.appliances > 0}
                  <div class="flex justify-between">
                    <span>Appliances:</span>
                    <span>{formatCurrency(estimate.breakdown.appliances)}</span>
                  </div>
                {/if}
                {#if estimate.breakdown.flooring > 0}
                  <div class="flex justify-between">
                    <span>Flooring:</span>
                    <span>{formatCurrency(estimate.breakdown.flooring)}</span>
                  </div>
                {/if}
                {#if estimate.breakdown.plumbing > 0}
                  <div class="flex justify-between">
                    <span>Plumbing:</span>
                    <span>{formatCurrency(estimate.breakdown.plumbing)}</span>
                  </div>
                {/if}
                {#if estimate.breakdown.electrical > 0}
                  <div class="flex justify-between">
                    <span>Electrical:</span>
                    <span>{formatCurrency(estimate.breakdown.electrical)}</span>
                  </div>
                {/if}
                {#if estimate.breakdown.painting > 0}
                  <div class="flex justify-between">
                    <span>Painting:</span>
                    <span>{formatCurrency(estimate.breakdown.painting)}</span>
                  </div>
                {/if}
              </div>
            </div>
            
            <div class="space-y-3 text-sm text-gray-600 mb-6">
              <p>• Estimates include materials and labor</p>
              <p>• Costs may vary by location and contractor</p>
              <p>• Get detailed quotes from verified professionals</p>
            </div>
            
            <div class="space-y-3">
              <Button href="/services" variant="primary" fullWidth={true}>
                Find Contractors
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 class="text-lg font-medium mb-2">Calculate Your Remodel</h3>
              <p>Fill out the form to get a detailed cost estimate</p>
            </div>
          </Card>
        {/if}
        
        <!-- Tips -->
        <Card variant="elevated" padding="lg">
          <h3 class="text-lg font-bold mb-4">Remodeling Tips</h3>
          <div class="space-y-3 text-sm text-gray-600">
            <p>• Plan for 10-20% contingency budget</p>
            <p>• Kitchen remodels typically take 4-6 weeks</p>
            <p>• Bathroom remodels usually take 2-3 weeks</p>
            <p>• Get multiple quotes from licensed contractors</p>
            <p>• Check permits required in your area</p>
          </div>
        </Card>
      </div>
    </div>
  </div>
</section>
