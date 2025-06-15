<svelte:head>
  <title>Booking Confirmed - FAIT</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-2xl mx-auto text-center">
    <div class="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
      <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
    </div>

    <h1 class="text-3xl font-bold text-gray-800 mb-4">Booking Confirmed!</h1>
    <p class="text-xl text-gray-600 mb-8">
      Thank you for choosing FAIT. We'll contact you shortly to confirm the details.
    </p>

    <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">What happens next?</h2>
      <div class="space-y-3 text-left">
        <div class="flex items-center">
          <span class="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3">1</span>
          <span>We'll review your booking request</span>
        </div>
        <div class="flex items-center">
          <span class="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3">2</span>
          <span>A service provider will contact you within 24 hours</span>
        </div>
        <div class="flex items-center">
          <span class="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3">3</span>
          <span>Schedule your service at a convenient time</span>
        </div>
      </div>
    </div>

    <div class="space-x-4">
      <a href="/" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">
        Return Home
      </a>
      <a href="/services" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg">
        Browse Services
      </a>
    </div>
  </div>
</div>