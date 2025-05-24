<script lang="ts">
  import Button from './ui/Button.svelte';
  import { auth, authActions } from '$lib/stores/auth';
  import { page } from '$app/stores';

  let mobileMenuOpen = false;

  // Base navigation for all users
  const baseNavigation = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  // Authenticated user navigation
  const authenticatedNavigation = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'My Bookings', href: '/bookings' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  // Reactive navigation based on auth state
  $: navigation = $auth.isAuthenticated ? authenticatedNavigation : baseNavigation;

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }
</script>

<header class="bg-white shadow-sm border-b border-gray-200">
  <nav class="mx-auto max-w-7xl px-8 sm:px-12 lg:px-8">
    <div class="flex h-16 justify-between items-center">
      <!-- Logo -->
      <div class="flex items-center">
        <a href="/" class="flex items-center">
          <span class="text-2xl font-bold text-blue-600">FAIT</span>
        </a>
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex md:items-center md:space-x-8">
        {#each navigation as item}
          <a
            href={item.href}
            class="px-3 py-2 text-sm font-medium transition-colors {$page.url.pathname === item.href ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}"
          >
            {item.name}
          </a>
        {/each}
      </div>

      <!-- Desktop Auth Buttons -->
      <div class="hidden md:flex md:items-center md:space-x-4">
        {#if $auth.isAuthenticated}
          <span class="text-sm text-gray-700">Welcome, {$auth.user?.name || 'User'}!</span>
          <Button variant="ghost" on:click={authActions.logout}>Sign Out</Button>
        {:else}
          <Button variant="ghost" href="/login">Sign In</Button>
          <Button variant="primary" href="/signup">Get Started</Button>
        {/if}
      </div>

      <!-- Mobile menu button -->
      <div class="md:hidden">
        <button
          type="button"
          class="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
          on:click={toggleMobileMenu}
        >
          <span class="sr-only">Open main menu</span>
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation -->
    {#if mobileMenuOpen}
      <div class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
          {#each navigation as item}
            <a
              href={item.href}
              class="block px-3 py-2 text-base font-medium rounded-md transition-colors {$page.url.pathname === item.href ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'}"
              on:click={() => mobileMenuOpen = false}
            >
              {item.name}
            </a>
          {/each}
          <div class="pt-4 pb-3 border-t border-gray-200">
            <div class="flex items-center px-3 space-x-3">
              {#if $auth.isAuthenticated}
                <span class="text-sm text-gray-700">Welcome, {$auth.user?.name || 'User'}!</span>
                <Button variant="ghost" size="sm" on:click={authActions.logout}>Sign Out</Button>
              {:else}
                <Button variant="ghost" href="/login" size="sm">Sign In</Button>
                <Button variant="primary" href="/signup" size="sm">Get Started</Button>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/if}
  </nav>
</header>
