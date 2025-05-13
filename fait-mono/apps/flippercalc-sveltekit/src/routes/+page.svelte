<script>
  import { Home, Calculator, ArrowRight } from 'lucide-svelte';
</script>

<div class="text-center">
  <h1 class="text-4xl font-bold text-gray-900 mb-6">House Flipping Budget Planner</h1>
  <p class="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
    Plan your house flipping projects with precision. Calculate costs, estimate profits, and make informed decisions.
  </p>
  
  <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
    <div class="bg-white p-6 rounded-lg shadow-md">
      <div class="flex justify-center mb-4">
        <Calculator class="w-12 h-12 text-primary-600" />
      </div>
      <h2 class="text-2xl font-semibold mb-3">Budget Calculator</h2>
      <p class="text-gray-600 mb-4">
        Our comprehensive calculator helps you estimate all costs associated with your flipping project.
      </p>
      <a href="/calculator" class="inline-flex items-center text-primary-600 font-medium hover:text-primary-700">
        Try the calculator <ArrowRight class="w-4 h-4 ml-1" />
      </a>
    </div>
    
    <div class="bg-white p-6 rounded-lg shadow-md">
      <div class="flex justify-center mb-4">
        <Home class="w-12 h-12 text-primary-600" />
      </div>
      <h2 class="text-2xl font-semibold mb-3">Project Management</h2>
      <p class="text-gray-600 mb-4">
        Keep track of your flipping projects, monitor expenses, and analyze your profit margins.
      </p>
      <a href="/projects" class="inline-flex items-center text-primary-600 font-medium hover:text-primary-700">
        Manage projects <ArrowRight class="w-4 h-4 ml-1" />
      </a>
    </div>
  </div>
  
  <div class="mt-12 bg-gray-100 p-8 rounded-lg max-w-4xl mx-auto">
    <h2 class="text-2xl font-semibold mb-4">Why Use FlipperCalc?</h2>
    <div class="grid md:grid-cols-3 gap-6 text-left">
      <div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Accurate Estimates</h3>
        <p class="text-gray-600">Get precise cost estimates based on real market data and industry standards.</p>
      </div>
      <div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Profit Analysis</h3>
        <p class="text-gray-600">Calculate potential ROI and profit margins before committing to a project.</p>
      </div>
      <div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Project Tracking</h3>
        <p class="text-gray-600">Monitor your expenses and stay on budget throughout your flipping journey.</p>
      </div>
    </div>
  </div>
</div>
