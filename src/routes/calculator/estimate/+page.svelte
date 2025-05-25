<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';

  // Form state
  let projectType = '';
  let projectSize = '';
  let location = '';
  let timeline = '';
  let budget = '';
  let description = '';
  let estimate = null;
  let isCalculating = false;

  // Project types with base costs
  const projectTypes = [
    { id: 'kitchen', name: 'Kitchen Remodel', baseCost: 25000 },
    { id: 'bathroom', name: 'Bathroom Remodel', baseCost: 15000 },
    { id: 'flooring', name: 'Flooring Installation', baseCost: 8000 },
    { id: 'painting', name: 'Interior Painting', baseCost: 3000 },
    { id: 'roofing', name: 'Roof Repair/Replacement', baseCost: 12000 },
    { id: 'plumbing', name: 'Plumbing Work', baseCost: 2500 },
    { id: 'electrical', name: 'Electrical Work', baseCost: 3500 },
    { id: 'hvac', name: 'HVAC Installation', baseCost: 8000 },
    { id: 'landscaping', name: 'Landscaping', baseCost: 5000 },
    { id: 'other', name: 'Other', baseCost: 5000 }
  ];

  // Size multipliers
  const sizeMultipliers = {
    'small': 0.7,
    'medium': 1.0,
    'large': 1.5,
    'extra-large': 2.0
  };

  // Timeline multipliers (rush jobs cost more)
  const timelineMultipliers = {
    'asap': 1.3,
    '1-week': 1.2,
    '2-4-weeks': 1.0,
    '1-3-months': 0.95,
    'flexible': 0.9
  };

  // Calculate estimate
  async function calculateEstimate() {
    if (!projectType || !projectSize || !timeline) {
      alert('Please fill in all required fields');
      return;
    }

    isCalculating = true;

    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const selectedProject = projectTypes.find(p => p.id === projectType);
    const baseCost = selectedProject?.baseCost || 5000;
    const sizeMultiplier = sizeMultipliers[projectSize] || 1.0;
    const timelineMultiplier = timelineMultipliers[timeline] || 1.0;

    // Add some randomness for realism
    const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2

    const calculatedCost = baseCost * sizeMultiplier * timelineMultiplier * randomFactor;
    const lowEstimate = Math.round(calculatedCost * 0.8);
    const highEstimate = Math.round(calculatedCost * 1.2);

    estimate = {
      low: lowEstimate,
      high: highEstimate,
      average: Math.round((lowEstimate + highEstimate) / 2),
      projectName: selectedProject?.name || 'Project'
    };

    isCalculating = false;
  }

  // Reset form
  function resetForm() {
    projectType = '';
    projectSize = '';
    location = '';
    timeline = '';
    budget = '';
    description = '';
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
  <title>Free Instant Estimate - FAIT</title>
  <meta name="description" content="Get a free instant estimate for your home improvement project with FAIT's calculator." />
</svelte:head>

<section class="bg-fait-light py-8">
  <div class="container-custom max-w-4xl">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-ivy font-bold text-fait-dark mb-4">Free Instant Estimate</h1>
      <p class="text-lg text-gray-600">Get an estimated cost for your home improvement project in minutes</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Form -->
      <Card variant="elevated" padding="lg">
        <h2 class="text-xl font-bold mb-6">Project Details</h2>

        <form on:submit|preventDefault={calculateEstimate} class="space-y-6">
          <!-- Project Type -->
          <div>
            <label for="projectType" class="block text-sm font-medium text-gray-700 mb-2">
              Project Type *
            </label>
            <select
              id="projectType"
              bind:value={projectType}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a project type</option>
              {#each projectTypes as project}
                <option value={project.id}>{project.name}</option>
              {/each}
            </select>
          </div>

          <!-- Project Size -->
          <div>
            <label for="projectSize" class="block text-sm font-medium text-gray-700 mb-2">
              Project Size *
            </label>
            <select
              id="projectSize"
              bind:value={projectSize}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select project size</option>
              <option value="small">Small (&lt; 100 sq ft)</option>
              <option value="medium">Medium (100-500 sq ft)</option>
              <option value="large">Large (500-1000 sq ft)</option>
              <option value="extra-large">Extra Large (&gt; 1000 sq ft)</option>
            </select>
          </div>

          <!-- Location -->
          <div>
            <label for="location" class="block text-sm font-medium text-gray-700 mb-2">
              Location (City, State)
            </label>
            <input
              type="text"
              id="location"
              bind:value={location}
              placeholder="e.g., Austin, TX"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Timeline -->
          <div>
            <label for="timeline" class="block text-sm font-medium text-gray-700 mb-2">
              Timeline *
            </label>
            <select
              id="timeline"
              bind:value={timeline}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select timeline</option>
              <option value="asap">ASAP (Rush job)</option>
              <option value="1-week">Within 1 week</option>
              <option value="2-4-weeks">2-4 weeks</option>
              <option value="1-3-months">1-3 months</option>
              <option value="flexible">Flexible timing</option>
            </select>
          </div>

          <!-- Budget Range -->
          <div>
            <label for="budget" class="block text-sm font-medium text-gray-700 mb-2">
              Budget Range (Optional)
            </label>
            <select
              id="budget"
              bind:value={budget}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select budget range</option>
              <option value="under-5k">Under $5,000</option>
              <option value="5k-15k">$5,000 - $15,000</option>
              <option value="15k-30k">$15,000 - $30,000</option>
              <option value="30k-50k">$30,000 - $50,000</option>
              <option value="over-50k">Over $50,000</option>
            </select>
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
              Project Description (Optional)
            </label>
            <textarea
              id="description"
              bind:value={description}
              rows="3"
              placeholder="Describe your project in more detail..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          <!-- Buttons -->
          <div class="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              disabled={isCalculating}
              fullWidth={true}
            >
              {isCalculating ? 'Calculating...' : 'Get Estimate'}
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
            <h2 class="text-xl font-bold mb-4">Your Estimate</h2>

            <div class="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 class="text-lg font-semibold text-blue-900 mb-2">{estimate.projectName}</h3>
              <div class="text-3xl font-bold text-blue-600 mb-2">
                {formatCurrency(estimate.low)} - {formatCurrency(estimate.high)}
              </div>
              <div class="text-sm text-blue-700">
                Average: {formatCurrency(estimate.average)}
              </div>
            </div>

            <div class="space-y-3 text-sm text-gray-600">
              <p>• This is a rough estimate based on typical project costs</p>
              <p>• Actual costs may vary based on materials, labor, and location</p>
              <p>• Get a detailed quote from our verified professionals</p>
            </div>

            <div class="mt-6 space-y-3">
              <Button href="/services" variant="primary" fullWidth={true}>
                Find Professionals
              </Button>
              <Button href="/calculator/remodeling" variant="outline" fullWidth={true}>
                Try Detailed Calculator
              </Button>
            </div>
          </Card>
        {:else}
          <Card variant="elevated" padding="lg">
            <div class="text-center text-gray-500">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h3 class="text-lg font-medium mb-2">Get Your Estimate</h3>
              <p>Fill out the form to get an instant estimate for your project</p>
            </div>
          </Card>
        {/if}

        <!-- Quick Links -->
        <Card variant="elevated" padding="lg">
          <h3 class="text-lg font-bold mb-4">Other Calculators</h3>
          <div class="space-y-2">
            <Button href="/calculator/remodeling" variant="outline" fullWidth={true} size="sm">
              Remodeling Calculator
            </Button>
            <Button href="/calculator/handyman" variant="outline" fullWidth={true} size="sm">
              Handyman Task Estimator
            </Button>
          </div>
        </Card>
      </div>
    </div>
  </div>
</section>
