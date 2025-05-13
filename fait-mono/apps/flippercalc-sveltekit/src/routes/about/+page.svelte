<script>
  import { Info } from 'lucide-svelte';
</script>

<div>
  <div class="flex items-center mb-6">
    <Info class="w-6 h-6 text-primary-600 mr-2" />
    <h1 class="text-3xl font-bold text-gray-900">About FlipperCalc</h1>
  </div>
  
  <div class="bg-white p-6 rounded-lg shadow-md mb-8">
    <h2 class="text-xl font-semibold mb-4">Our Mission</h2>
    <p class="text-gray-600 mb-4">
      FlipperCalc was created to help real estate investors make informed decisions about their house flipping projects. 
      Our goal is to provide accurate, easy-to-use tools that help you estimate costs, calculate potential profits, 
      and manage your projects effectively.
    </p>
    <p class="text-gray-600">
      Whether you're a seasoned house flipper or just getting started in real estate investing, 
      FlipperCalc gives you the insights you need to maximize your returns and minimize risks.
    </p>
  </div>
  
  <div class="bg-white p-6 rounded-lg shadow-md mb-8">
    <h2 class="text-xl font-semibold mb-4">How It Works</h2>
    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-medium text-gray-800">1. Enter Your Project Details</h3>
        <p class="text-gray-600">
          Input your purchase price, estimated repair costs, holding costs, and other relevant expenses.
        </p>
      </div>
      <div>
        <h3 class="text-lg font-medium text-gray-800">2. Calculate Potential Profits</h3>
        <p class="text-gray-600">
          Our calculator will estimate your total investment, potential profit, and return on investment.
        </p>
      </div>
      <div>
        <h3 class="text-lg font-medium text-gray-800">3. Track Your Projects</h3>
        <p class="text-gray-600">
          Save your projects, track actual expenses, and compare them to your initial estimates.
        </p>
      </div>
    </div>
  </div>
  
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">Contact Us</h2>
    <p class="text-gray-600 mb-4">
      Have questions or suggestions? We'd love to hear from you!
    </p>
    <div class="bg-gray-50 p-4 rounded-md border border-gray-200">
      <p class="text-gray-600">Email: <a href="mailto:support@flippercalc.com" class="text-primary-600 hover:underline">support@flippercalc.com</a></p>
      <p class="text-gray-600">Phone: (555) 123-4567</p>
    </div>
  </div>
</div>
