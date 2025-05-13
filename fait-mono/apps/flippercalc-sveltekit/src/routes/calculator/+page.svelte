<script lang="ts">
  import { onMount } from 'svelte';
  import { Calculator } from 'lucide-svelte';
  
  // Form state
  let purchasePrice = 200000;
  let repairCosts = 50000;
  let holdingCosts = 5000;
  let sellingCosts = 15000;
  let afterRepairValue = 300000;
  
  // Results
  let totalInvestment = 0;
  let estimatedProfit = 0;
  let roi = 0;
  
  // Calculate results whenever inputs change
  $: {
    totalInvestment = purchasePrice + repairCosts + holdingCosts + sellingCosts;
    estimatedProfit = afterRepairValue - totalInvestment;
    roi = totalInvestment > 0 ? (estimatedProfit / totalInvestment) * 100 : 0;
  }
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format percentage
  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };
</script>

<div>
  <div class="flex items-center mb-6">
    <Calculator class="w-6 h-6 text-primary-600 mr-2" />
    <h1 class="text-3xl font-bold text-gray-900">House Flipping Calculator</h1>
  </div>
  
  <div class="grid md:grid-cols-2 gap-8">
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Project Costs</h2>
      
      <div class="space-y-4">
        <div>
          <label for="purchasePrice" class="block text-sm font-medium text-gray-700 mb-1">
            Purchase Price
          </label>
          <input
            type="number"
            id="purchasePrice"
            bind:value={purchasePrice}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <div>
          <label for="repairCosts" class="block text-sm font-medium text-gray-700 mb-1">
            Repair Costs
          </label>
          <input
            type="number"
            id="repairCosts"
            bind:value={repairCosts}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <div>
          <label for="holdingCosts" class="block text-sm font-medium text-gray-700 mb-1">
            Holding Costs
          </label>
          <input
            type="number"
            id="holdingCosts"
            bind:value={holdingCosts}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <div>
          <label for="sellingCosts" class="block text-sm font-medium text-gray-700 mb-1">
            Selling Costs
          </label>
          <input
            type="number"
            id="sellingCosts"
            bind:value={sellingCosts}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <div>
          <label for="afterRepairValue" class="block text-sm font-medium text-gray-700 mb-1">
            After Repair Value (ARV)
          </label>
          <input
            type="number"
            id="afterRepairValue"
            bind:value={afterRepairValue}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
    </div>
    
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Results</h2>
      
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium text-gray-700">Total Investment</h3>
          <p class="text-3xl font-bold text-primary-600">{formatCurrency(totalInvestment)}</p>
        </div>
        
        <div>
          <h3 class="text-lg font-medium text-gray-700">Estimated Profit</h3>
          <p class="text-3xl font-bold" class:text-green-600={estimatedProfit > 0} class:text-red-600={estimatedProfit < 0}>
            {formatCurrency(estimatedProfit)}
          </p>
        </div>
        
        <div>
          <h3 class="text-lg font-medium text-gray-700">Return on Investment</h3>
          <p class="text-3xl font-bold" class:text-green-600={roi > 0} class:text-red-600={roi < 0}>
            {formatPercentage(roi)}
          </p>
        </div>
        
        <div class="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 class="text-md font-medium text-gray-700 mb-2">Investment Breakdown</h3>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">Purchase Price:</span>
              <span class="font-medium">{formatCurrency(purchasePrice)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Repair Costs:</span>
              <span class="font-medium">{formatCurrency(repairCosts)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Holding Costs:</span>
              <span class="font-medium">{formatCurrency(holdingCosts)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Selling Costs:</span>
              <span class="font-medium">{formatCurrency(sellingCosts)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
