<script>
  import { Shield, CheckCircle, AlertTriangle, DollarSign, Clock } from 'lucide-svelte';
</script>

<div>
  <!-- Hero Section -->
  <section class="bg-gradient-to-b from-primary-50 to-white py-16 md:py-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Protect Yourself From Contractor Quote Risks
          </h1>
          <p class="text-xl text-gray-600 mb-8">
            OfferShield uses AI to analyze contractor quotes, identify potential risks, and help you make informed decisions.
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <a 
              href="/analyze" 
              class="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Analyze a Quote
            </a>
            <a 
              href="/how-it-works" 
              class="inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              How It Works
            </a>
          </div>
        </div>
        <div class="flex justify-center">
          <div class="relative">
            <div class="absolute -inset-1 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg blur opacity-25"></div>
            <div class="relative bg-white p-6 rounded-lg shadow-xl">
              <div class="flex justify-center mb-6">
                <Shield class="w-16 h-16 text-primary-600" />
              </div>
              <div class="space-y-4">
                <div class="flex items-start">
                  <CheckCircle class="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p class="text-gray-600">Identify hidden costs and potential overcharges</p>
                </div>
                <div class="flex items-start">
                  <CheckCircle class="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p class="text-gray-600">Compare quotes against industry standards</p>
                </div>
                <div class="flex items-start">
                  <CheckCircle class="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p class="text-gray-600">Detect vague language and potential contract issues</p>
                </div>
                <div class="flex items-start">
                  <CheckCircle class="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p class="text-gray-600">Get recommendations for negotiation points</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- How It Works Section -->
  <section class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">How OfferShield Works</h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Our AI-powered platform analyzes contractor quotes in minutes, giving you peace of mind and saving you money.
        </p>
      </div>
      
      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-gray-50 p-6 rounded-lg">
          <div class="flex justify-center mb-4">
            <div class="bg-primary-100 p-3 rounded-full">
              <Clock class="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <h3 class="text-xl font-semibold text-center mb-3">1. Upload Your Quote</h3>
          <p class="text-gray-600 text-center">
            Simply upload your contractor's quote in PDF format or take a photo of a printed quote.
          </p>
        </div>
        
        <div class="bg-gray-50 p-6 rounded-lg">
          <div class="flex justify-center mb-4">
            <div class="bg-primary-100 p-3 rounded-full">
              <Shield class="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <h3 class="text-xl font-semibold text-center mb-3">2. AI Analysis</h3>
          <p class="text-gray-600 text-center">
            Our AI analyzes the quote for pricing issues, vague terms, and potential risks.
          </p>
        </div>
        
        <div class="bg-gray-50 p-6 rounded-lg">
          <div class="flex justify-center mb-4">
            <div class="bg-primary-100 p-3 rounded-full">
              <CheckCircle class="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <h3 class="text-xl font-semibold text-center mb-3">3. Get Results</h3>
          <p class="text-gray-600 text-center">
            Receive a detailed report with risk assessment and recommendations for negotiation.
          </p>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Features Section -->
  <section class="py-16 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          OfferShield provides comprehensive protection against common contractor quote issues.
        </p>
      </div>
      
      <div class="grid md:grid-cols-2 gap-8">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex items-start mb-4">
            <div class="bg-red-100 p-2 rounded-full mr-4">
              <AlertTriangle class="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-2">Risk Detection</h3>
              <p class="text-gray-600">
                Identifies vague language, missing details, and potential contract issues that could lead to disputes.
              </p>
            </div>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex items-start mb-4">
            <div class="bg-green-100 p-2 rounded-full mr-4">
              <DollarSign class="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-2">Price Analysis</h3>
              <p class="text-gray-600">
                Compares quote prices against industry standards to identify potential overcharging.
              </p>
            </div>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex items-start mb-4">
            <div class="bg-blue-100 p-2 rounded-full mr-4">
              <CheckCircle class="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-2">Negotiation Tips</h3>
              <p class="text-gray-600">
                Provides specific recommendations for negotiating better terms with your contractor.
              </p>
            </div>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex items-start mb-4">
            <div class="bg-purple-100 p-2 rounded-full mr-4">
              <Shield class="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-2">Quote Comparison</h3>
              <p class="text-gray-600">
                Compare multiple quotes side-by-side to make the best decision for your project.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- CTA Section -->
  <section class="py-16 bg-primary-600">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 class="text-3xl font-bold text-white mb-6">Ready to Protect Your Home Improvement Investment?</h2>
      <p class="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
        Don't risk thousands on unclear contractor quotes. Get peace of mind with OfferShield's AI analysis.
      </p>
      <a 
        href="/analyze" 
        class="inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-600 focus:ring-white"
      >
        Analyze Your Quote Now
      </a>
    </div>
  </section>
</div>
