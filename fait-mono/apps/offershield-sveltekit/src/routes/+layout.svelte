<script>
  import '../app.css';
  import { Shield, Menu, X } from 'lucide-svelte';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { MainMenu } from '@fait/sveltekit-ui';

  let isMenuOpen = false;
  let isScrolled = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  onMount(() => {
    const handleScroll = () => {
      isScrolled = window.scrollY > 10;
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<div class="min-h-screen flex flex-col bg-gray-50">
  <MainMenu currentApp="offershield" />

  <header class="sticky top-0 z-50 transition-all duration-200" class:bg-white={isScrolled} class:shadow-md={isScrolled}>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <div class="flex items-center">
          <a href="/" class="flex items-center">
            <Shield class="w-8 h-8 text-primary-600 mr-2" />
            <h1 class="text-xl font-bold text-primary-600">OfferShield</h1>
          </a>
        </div>

        <!-- Desktop navigation -->
        <nav class="hidden md:flex space-x-8">
          <a
            href="/"
            class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            class:text-primary-600={$page.url.pathname === '/'}
          >
            Home
          </a>
          <a
            href="/analyze"
            class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            class:text-primary-600={$page.url.pathname === '/analyze'}
          >
            Analyze Quote
          </a>
          <a
            href="/dashboard"
            class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            class:text-primary-600={$page.url.pathname === '/dashboard'}
          >
            Dashboard
          </a>
          <a
            href="/pricing"
            class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            class:text-primary-600={$page.url.pathname === '/pricing'}
          >
            Pricing
          </a>
        </nav>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            type="button"
            class="text-gray-600 hover:text-primary-600 focus:outline-none"
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
      <div class="md:hidden bg-white shadow-lg">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a
            href="/"
            class="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
            class:text-primary-600={$page.url.pathname === '/'}
            on:click={() => isMenuOpen = false}
          >
            Home
          </a>
          <a
            href="/analyze"
            class="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
            class:text-primary-600={$page.url.pathname === '/analyze'}
            on:click={() => isMenuOpen = false}
          >
            Analyze Quote
          </a>
          <a
            href="/dashboard"
            class="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
            class:text-primary-600={$page.url.pathname === '/dashboard'}
            on:click={() => isMenuOpen = false}
          >
            Dashboard
          </a>
          <a
            href="/pricing"
            class="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
            class:text-primary-600={$page.url.pathname === '/pricing'}
            on:click={() => isMenuOpen = false}
          >
            Pricing
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
          <div class="flex items-center mb-4">
            <Shield class="w-6 h-6 text-primary-600 mr-2" />
            <h2 class="text-lg font-bold text-gray-900">OfferShield</h2>
          </div>
          <p class="text-gray-600">
            Protecting homeowners from contractor quote risks with AI-powered analysis.
          </p>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Resources</h3>
          <ul class="space-y-2">
            <li><a href="/blog" class="text-gray-600 hover:text-primary-600">Blog</a></li>
            <li><a href="/guides" class="text-gray-600 hover:text-primary-600">Guides</a></li>
            <li><a href="/faq" class="text-gray-600 hover:text-primary-600">FAQ</a></li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Company</h3>
          <ul class="space-y-2">
            <li><a href="/about" class="text-gray-600 hover:text-primary-600">About</a></li>
            <li><a href="/contact" class="text-gray-600 hover:text-primary-600">Contact</a></li>
            <li><a href="/privacy" class="text-gray-600 hover:text-primary-600">Privacy</a></li>
            <li><a href="/terms" class="text-gray-600 hover:text-primary-600">Terms</a></li>
          </ul>
        </div>
      </div>

      <div class="mt-8 pt-8 border-t border-gray-200">
        <p class="text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} OfferShield. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</div>
