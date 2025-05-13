<script>
  import '../app.css';
  import { Home, Shield, Calculator, Heart, Wrench, Construction, Menu, X } from 'lucide-svelte';
  import { page } from '$app/stores';

  let isMenuOpen = false;

  const tools = [
    {
      id: 'fait-coop',
      name: 'FAIT Cooperative Platform',
      description: 'The main FAIT Cooperative Platform',
      icon: Home,
      url: 'http://localhost:3000',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'flippercalc',
      name: 'FlipperCalc',
      description: 'House flipping budget planner',
      icon: Calculator,
      url: 'http://localhost:5174',
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'offershield',
      name: 'OfferShield',
      description: 'Contractor quote risk analyzer',
      icon: Shield,
      url: 'http://localhost:5175',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'home-health-score',
      name: 'Home Health Score',
      description: 'Live voice/chat-based home health report',
      icon: Heart,
      url: 'http://localhost:5176',
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 'handyman-calculator',
      name: 'Handyman Calculator',
      description: 'While-You\'re-Here handyman task cost estimator',
      icon: Wrench,
      url: 'http://localhost:5177',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 'remodeling-calculator',
      name: 'Remodeling Calculator',
      description: 'Scope-based remodel cost estimator',
      icon: Construction,
      url: 'http://localhost:5178',
      color: 'bg-indigo-100 text-indigo-600'
    }
  ];

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }
</script>

<div class="min-h-screen bg-gray-50 flex flex-col">
  <header class="bg-primary-600 text-white sticky top-0 z-50 shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <div class="flex items-center">
          <a href="/" class="flex items-center">
            <span class="text-xl font-bold">FAIT Hub</span>
          </a>
        </div>

        <!-- Desktop navigation -->
        <nav class="hidden md:flex space-x-6">
          <a
            href="/"
            class="text-white hover:text-primary-100 px-3 py-2 rounded-md text-sm font-medium"
            class:text-primary-100={$page.url.pathname === '/'}
          >
            Home
          </a>
          <a
            href="/tools"
            class="text-white hover:text-primary-100 px-3 py-2 rounded-md text-sm font-medium flex items-center"
            class:text-primary-100={$page.url.pathname === '/tools'}
          >
            <span>Beta Projects</span>
            <span class="ml-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">Beta</span>
          </a>
          <a
            href="/#about"
            class="text-white hover:text-primary-100 px-3 py-2 rounded-md text-sm font-medium"
          >
            About
          </a>
        </nav>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            type="button"
            class="text-white hover:text-primary-100 focus:outline-none"
            on:click={toggleMenu}
            aria-label="Toggle menu"
          >
            {#if isMenuOpen}
              <X class="w-6 h-6" />
            {:else}
              <Menu class="w-6 h-6" />
            {/if}
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    {#if isMenuOpen}
      <div class="md:hidden bg-primary-700">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a
            href="/"
            class="flex items-center text-white hover:bg-primary-500 block px-3 py-2 rounded-md text-base font-medium"
            class:bg-primary-500={$page.url.pathname === '/'}
            on:click={() => isMenuOpen = false}
          >
            Home
          </a>
          <a
            href="/tools"
            class="flex items-center text-white hover:bg-primary-500 block px-3 py-2 rounded-md text-base font-medium"
            class:bg-primary-500={$page.url.pathname === '/tools'}
            on:click={() => isMenuOpen = false}
          >
            <span>Beta Projects</span>
            <span class="ml-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">Beta</span>
          </a>
          <a
            href="/#about"
            class="flex items-center text-white hover:bg-primary-500 block px-3 py-2 rounded-md text-base font-medium"
            on:click={() => isMenuOpen = false}
          >
            About
          </a>
        </div>
      </div>
    {/if}
  </header>

  <main class="flex-grow">
    <slot />
  </main>

  <footer class="bg-white mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid md:grid-cols-3 gap-8">
        <div>
          <h3 class="text-lg font-bold text-gray-900 mb-4">FAIT Hub</h3>
          <p class="text-gray-600">
            Access all FAIT tools from one central location. Streamline your workflow with our integrated platform.
          </p>
        </div>

        <div>
          <div class="flex items-center mb-4">
            <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mr-2">Beta Projects</h3>
            <span class="bg-blue-100 text-blue-800 text-xs font-medium px-1.5 py-0.5 rounded-full">Beta</span>
          </div>
          <ul class="space-y-2">
            {#each tools.slice(0, 3) as tool}
              <li>
                <a href={tool.url} class="text-gray-600 hover:text-primary-600" target="_blank" rel="noopener noreferrer">
                  {tool.name}
                </a>
              </li>
            {/each}
          </ul>
        </div>

        <div>
          <div class="flex items-center mb-4">
            <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mr-2">More Beta Projects</h3>
            <span class="bg-blue-100 text-blue-800 text-xs font-medium px-1.5 py-0.5 rounded-full">Beta</span>
          </div>
          <ul class="space-y-2">
            {#each tools.slice(3) as tool}
              <li>
                <a href={tool.url} class="text-gray-600 hover:text-primary-600" target="_blank" rel="noopener noreferrer">
                  {tool.name}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      </div>

      <div class="mt-8 pt-8 border-t border-gray-200">
        <p class="text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} FAIT. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</div>
