<script>
  import { ArrowRight, CheckCircle, Home, Shield, Calculator, Heart, Wrench, Construction } from 'lucide-svelte';
</script>

<div>
  <!-- Hero Section -->
  <section class="bg-gradient-to-b from-primary-50 to-white py-16 md:py-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Welcome to FAIT
          </h1>
          <p class="text-xl text-gray-600 mb-8">
            FAIT provides innovative solutions for homeowners, contractors, and real estate investors. Our suite of tools helps you make informed decisions and streamline your workflow.
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <a
              href="/tools"
              class="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Explore Our Tools
            </a>
            <a
              href="#about"
              class="inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Learn More
            </a>
          </div>
        </div>
        <div class="hidden md:flex justify-center">
          <div class="relative">
            <div class="absolute -inset-1 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg blur opacity-25"></div>
            <div class="relative bg-white p-6 rounded-lg shadow-xl">
              <div class="space-y-4">
                <div class="flex items-start">
                  <CheckCircle class="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p class="text-gray-600">Comprehensive suite of home improvement tools</p>
                </div>
                <div class="flex items-start">
                  <CheckCircle class="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p class="text-gray-600">Data-driven insights for better decision making</p>
                </div>
                <div class="flex items-start">
                  <CheckCircle class="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p class="text-gray-600">User-friendly interfaces built with modern technology</p>
                </div>
                <div class="flex items-start">
                  <CheckCircle class="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p class="text-gray-600">Trusted by homeowners and professionals alike</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Featured Tools Section -->
  <section class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Our Featured Beta Projects</h2>
        <div class="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
          Beta Release
        </div>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover some of our most popular beta tools designed to help you with your home improvement and real estate needs
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-white rounded-lg shadow-md p-6 text-center">
          <div class="flex justify-center mb-4">
            <div class="bg-blue-100 p-3 rounded-full">
              <Home class="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div class="flex items-center justify-center mb-2">
            <h3 class="text-xl font-semibold text-gray-900 mr-2">FAIT Cooperative Platform</h3>
            <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">Beta</span>
          </div>
          <p class="text-gray-600 mb-4">
            Our main platform for connecting homeowners with trusted contractors and service providers.
          </p>
          <a
            href="/tools"
            class="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
          >
            Learn more <ArrowRight class="w-4 h-4 ml-1" />
          </a>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 text-center">
          <div class="flex justify-center mb-4">
            <div class="bg-purple-100 p-3 rounded-full">
              <Shield class="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div class="flex items-center justify-center mb-2">
            <h3 class="text-xl font-semibold text-gray-900 mr-2">OfferShield</h3>
            <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded-full">Beta</span>
          </div>
          <p class="text-gray-600 mb-4">
            Protect yourself from contractor quote risks with our AI-powered analysis tool.
          </p>
          <a
            href="/tools"
            class="inline-flex items-center text-purple-600 font-medium hover:text-purple-700"
          >
            Learn more <ArrowRight class="w-4 h-4 ml-1" />
          </a>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 text-center">
          <div class="flex justify-center mb-4">
            <div class="bg-green-100 p-3 rounded-full">
              <Calculator class="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div class="flex items-center justify-center mb-2">
            <h3 class="text-xl font-semibold text-gray-900 mr-2">FlipperCalc</h3>
            <span class="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">Beta</span>
          </div>
          <p class="text-gray-600 mb-4">
            Plan your house flipping projects with precision using our comprehensive budget planner.
          </p>
          <a
            href="/tools"
            class="inline-flex items-center text-green-600 font-medium hover:text-green-700"
          >
            Learn more <ArrowRight class="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>

      <div class="mt-12 text-center">
        <a
          href="/tools"
          class="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          View All Beta Projects
        </a>
      </div>
    </div>
  </section>

  <!-- About Section -->
  <section id="about" class="py-16 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">About FAIT</h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          We're on a mission to transform the home improvement and real estate industry with innovative digital solutions
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h3 class="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h3>
          <p class="text-gray-600 mb-4">
            At FAIT, we believe that everyone deserves access to reliable, data-driven tools that make home improvement and real estate decisions easier and more transparent.
          </p>
          <p class="text-gray-600 mb-4">
            Our suite of applications is designed to empower homeowners, contractors, and investors with the information they need to make confident decisions.
          </p>
          <p class="text-gray-600">
            From analyzing contractor quotes to planning house flipping budgets, our tools provide valuable insights that save time, money, and stress.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-white p-4 rounded-lg shadow-md">
            <div class="flex justify-center mb-2">
              <Heart class="w-6 h-6 text-red-600" />
            </div>
            <h4 class="text-lg font-medium text-center text-gray-900 mb-2">User-Focused</h4>
            <p class="text-sm text-gray-600 text-center">
              We design our tools with real users in mind, focusing on simplicity and usability.
            </p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-md">
            <div class="flex justify-center mb-2">
              <Shield class="w-6 h-6 text-purple-600" />
            </div>
            <h4 class="text-lg font-medium text-center text-gray-900 mb-2">Trustworthy</h4>
            <p class="text-sm text-gray-600 text-center">
              Our data-driven approach ensures reliable, accurate information you can count on.
            </p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-md">
            <div class="flex justify-center mb-2">
              <Wrench class="w-6 h-6 text-yellow-600" />
            </div>
            <h4 class="text-lg font-medium text-center text-gray-900 mb-2">Innovative</h4>
            <p class="text-sm text-gray-600 text-center">
              We continuously improve our tools with the latest technology and industry insights.
            </p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-md">
            <div class="flex justify-center mb-2">
              <Construction class="w-6 h-6 text-indigo-600" />
            </div>
            <h4 class="text-lg font-medium text-center text-gray-900 mb-2">Comprehensive</h4>
            <p class="text-sm text-gray-600 text-center">
              Our suite of tools covers all aspects of home improvement and real estate.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="py-16 bg-primary-600">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 class="text-3xl font-bold text-white mb-6">Ready to Try Our Beta Projects?</h2>
      <p class="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
        Explore our suite of beta tools and discover how FAIT can help you with your home improvement and real estate needs.
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <a
          href="/tools"
          class="inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-600 focus:ring-white"
        >
          Explore Our Beta Projects
        </a>
      </div>
    </div>
  </section>
</div>
