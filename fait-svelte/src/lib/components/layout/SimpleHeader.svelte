<script lang="ts">
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  import Button from '$lib/components/ui/Button.svelte';
  import { onMount, tick } from 'svelte';
  import { slide } from 'svelte/transition';

  // Navigation items - simplified for Taskrabbit style
  const navItems = [
    {
      label: 'Services',
      href: '/services'
    }
  ];

  // Mobile menu state
  let mobileMenuOpen = false;
  let scrolled = false;
  let headerHeight = 0;
  let headerElement: HTMLElement;

  // Toggle mobile menu
  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  // Handle scroll events to change header appearance
  function handleScroll() {
    scrolled = window.scrollY > 20;
  }

  // Update header height for the spacer
  async function updateHeaderHeight() {
    await tick();
    if (headerElement) {
      headerHeight = headerElement.offsetHeight;
    }
  }

  onMount(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateHeaderHeight);
    };
  });

  // Close mobile menu when route changes
  $: if ($page.url.pathname) {
    mobileMenuOpen = false;
  }

  // Update header height when scrolled state changes
  $: if (scrolled !== undefined) {
    updateHeaderHeight();
  }
</script>

<header
  bind:this={headerElement}
  class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#2d3138] py-3"
>
  <div class="container-custom">
    <div class="flex items-center justify-between">
      <!-- Logo -->
      <a
        href="/"
        class="text-white text-2xl font-bold"
      >
        <span class="flex items-center">
          <svg class="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7.5 12H16.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 7.5V16.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          FAIT
        </span>
      </a>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center space-x-6">
        {#each navItems as item}
          <a
            href={item.href}
            class="text-white text-sm font-medium hover:text-white/80 transition-colors duration-200"
          >
            {item.label}
          </a>
        {/each}

        <!-- Auth Buttons (Desktop) -->
        {#if $auth.isAuthenticated}
          <a href="/profile" class="text-white text-sm font-medium hover:text-white/80">
            My Account
          </a>
          <Button
            on:click={() => auth.logout()}
            variant="outline"
            size="sm"
            class="border-white text-white hover:bg-white/10"
          >
            Log Out
          </Button>
        {:else}
          <a href="/login" class="text-white text-sm font-medium hover:text-white/80">
            Sign up / Log in
          </a>
          <a href="/register" class="ml-4 text-white text-sm font-medium border border-white rounded px-4 py-2 hover:bg-white/10">
            Become a Tasker
          </a>
        {/if}
      </div>

      <!-- Mobile Menu Button -->
      <button
        class="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset text-white focus:ring-white"
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        on:click={toggleMobileMenu}
      >
        {#if mobileMenuOpen}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        {/if}
      </button>
    </div>
  </div>

  <!-- Mobile Navigation Menu -->
  {#if mobileMenuOpen}
    <div
      transition:slide={{ duration: 300, axis: 'y' }}
      class="md:hidden bg-[#2d3138] border-t border-gray-700 shadow-lg"
    >
      <div class="container-custom py-3">
        <nav class="flex flex-col space-y-1 pb-3 pt-2">
          {#each navItems as item}
            <a
              href={item.href}
              class="px-3 py-2 rounded-md text-base font-medium flex items-center text-white hover:bg-gray-700"
            >
              {item.label}
            </a>
          {/each}
        </nav>

        <div class="pt-4 pb-3 border-t border-gray-700">
          {#if $auth.isAuthenticated}
            <div class="flex items-center px-3">
              <div class="flex-shrink-0">
                <div class="h-10 w-10 rounded-full bg-gray-600 text-white flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div class="ml-3">
                <div class="text-base font-medium text-white">My Account</div>
                <div class="text-sm font-medium text-gray-300">user@example.com</div>
              </div>
            </div>
            <div class="mt-3 space-y-1">
              <a
                href="/profile"
                class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Your Profile
              </a>
              <a
                href="/provider/services"
                class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Your Services
              </a>
              <a
                href="/bookings"
                class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Your Bookings
              </a>
              <button
                on:click={() => auth.logout()}
                class="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Sign Out
              </button>
            </div>
          {:else}
            <div class="space-y-2 px-3">
              <Button
                href="/login"
                variant="outline"
                fullWidth={true}
                class="justify-center border-gray-500 text-white hover:bg-gray-700"
              >
                Sign up / Log in
              </Button>
              <Button
                href="/register"
                variant="primary"
                fullWidth={true}
                class="justify-center bg-white text-[#2d3138] border-white hover:bg-gray-200"
              >
                Become a Tasker
              </Button>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</header>

<!-- Spacer to prevent content from being hidden under the fixed header -->
<div style="height: {headerHeight}px;" class="transition-all duration-300"></div>
