<script>
  import { ArrowRight } from 'lucide-svelte';
</script>

<div class="py-16 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">FAIT Beta Projects</h1>
      <div class="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
        Beta Release
      </div>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        Explore our comprehensive suite of beta tools designed to streamline your workflow
      </p>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <a
        href="http://localhost:3000"
        target="_blank"
        rel="noopener noreferrer"
        class="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
      >
        <div class="bg-blue-600 h-2"></div>
        <div class="p-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">FAIT Cooperative Platform</h3>
            <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">Beta</span>
          </div>
          <p class="text-gray-600 mb-4">The main FAIT Cooperative Platform</p>
          <div class="flex justify-end">
            <ArrowRight class="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </a>

      <a
        href="http://localhost:5174"
        target="_blank"
        rel="noopener noreferrer"
        class="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
      >
        <div class="bg-green-600 h-2"></div>
        <div class="p-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors">FlipperCalc</h3>
            <span class="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">Beta</span>
          </div>
          <p class="text-gray-600 mb-4">House flipping budget planner</p>
          <div class="flex justify-end">
            <ArrowRight class="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </a>

      <a
        href="http://localhost:5175"
        target="_blank"
        rel="noopener noreferrer"
        class="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
      >
        <div class="bg-purple-600 h-2"></div>
        <div class="p-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">OfferShield</h3>
            <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded-full">Beta</span>
          </div>
          <p class="text-gray-600 mb-4">Contractor quote risk analyzer</p>
          <div class="flex justify-end">
            <ArrowRight class="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </a>

      <a
        href="http://localhost:5176"
        target="_blank"
        rel="noopener noreferrer"
        class="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
      >
        <div class="bg-red-600 h-2"></div>
        <div class="p-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xl font-semibold text-gray-900 group-hover:text-red-600 transition-colors">Home Health Score</h3>
            <span class="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">Beta</span>
          </div>
          <p class="text-gray-600 mb-4">Live voice/chat-based home health report</p>
          <div class="flex justify-end">
            <ArrowRight class="w-5 h-5 text-red-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </a>

      <a
        href="http://localhost:5177"
        target="_blank"
        rel="noopener noreferrer"
        class="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
      >
        <div class="bg-yellow-600 h-2"></div>
        <div class="p-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xl font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors">Handyman Calculator</h3>
            <span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">Beta</span>
          </div>
          <p class="text-gray-600 mb-4">While-You're-Here handyman task cost estimator</p>
          <div class="flex justify-end">
            <ArrowRight class="w-5 h-5 text-yellow-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </a>

      <a
        href="http://localhost:5178"
        target="_blank"
        rel="noopener noreferrer"
        class="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
      >
        <div class="bg-indigo-600 h-2"></div>
        <div class="p-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">Remodeling Calculator</h3>
            <span class="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-0.5 rounded-full">Beta</span>
          </div>
          <p class="text-gray-600 mb-4">Scope-based remodel cost estimator</p>
          <div class="flex justify-end">
            <ArrowRight class="w-5 h-5 text-indigo-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </a>
    </div>
  </div>
</div>
