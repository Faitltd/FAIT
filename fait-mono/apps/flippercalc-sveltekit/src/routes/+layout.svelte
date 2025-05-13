<script>
  import '../app.css';
  import { MainMenu } from '@fait/sveltekit-ui';
</script>

<div class="min-h-screen bg-gray-50">
  <MainMenu currentApp="flippercalc" />

  <header class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <div class="flex items-center">
          <h1 class="text-xl font-bold text-primary-600">FlipperCalc</h1>
        </div>
        <nav class="flex space-x-4">
          <a href="/" class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Home</a>
          <a href="/calculator" class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Calculator</a>
          <a href="/about" class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">About</a>
        </nav>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <slot />
  </main>

  <footer class="bg-white mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <p class="text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} FAIT FlipperCalc. All rights reserved.
      </p>
    </div>
  </footer>
</div>
