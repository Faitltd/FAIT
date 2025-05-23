<script lang="ts">
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  import Button from '$lib/components/ui/Button.svelte';
  import NotificationBell from '$lib/components/notifications/NotificationBell.svelte';

  // Navigation items
  const publicNavItems = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' }
  ];

  // Additional nav items for authenticated users
  const authNavItems = [
    { label: 'My Bookings', href: '/bookings' }
  ];

  // Computed nav items based on auth state
  $: navItems = $auth.isAuthenticated
    ? [...publicNavItems, ...authNavItems]
    : publicNavItems;

  // Mobile menu state
  let mobileMenuOpen = false;
  let userMenuOpen = false;

  // Toggle mobile menu
  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
    if (mobileMenuOpen) userMenuOpen = false;
  }

  // Toggle user menu
  function toggleUserMenu() {
    userMenuOpen = !userMenuOpen;
  }

  // Handle logout
  function handleLogout() {
    auth.logout();
    userMenuOpen = false;
  }

  // Close mobile menu when route changes
  $: if ($page.url.pathname) {
    mobileMenuOpen = false;
    userMenuOpen = false;
  }
</script>

<header class="bg-white shadow-sm">
  <div class="container-custom py-4">
    <nav class="flex justify-between items-center">
      <!-- Logo -->
      <a href="/" class="text-2xl font-ivy text-fait-dark">FAIT</a>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex space-x-6">
        {#each navItems as item}
          <a
            href={item.href}
            class="font-medium {$page.url.pathname === item.href ? 'text-fait-blue' : 'text-fait-dark hover:text-fait-blue'}"
          >
            {item.label}
          </a>
        {/each}
      </div>

      <!-- Auth Buttons (Desktop) -->
      <div class="hidden md:flex items-center space-x-4">
        {#if $auth.isAuthenticated}
          <!-- Notification Bell -->
          <NotificationBell />

          <div class="relative">
            <button
              class="flex items-center space-x-2 focus:outline-none"
              on:click={toggleUserMenu}
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <div class="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                {#if $auth.user?.avatar}
                  <img src={$auth.user.avatar} alt={$auth.user.name} class="w-full h-full object-cover" />
                {:else}
                  <div class="w-full h-full flex items-center justify-center text-gray-500">
                    {$auth.user?.name.charAt(0).toUpperCase()}
                  </div>
                {/if}
              </div>
              <span class="font-medium">{$auth.user?.name}</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>

            {#if userMenuOpen}
              <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <a href="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                <a href="/bookings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Bookings</a>
                {#if $auth.user?.role === 'provider'}
                  <a href="/dashboard" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Provider Dashboard</a>
                  <a href="/earnings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Earnings</a>
                {/if}
                <button
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  on:click={handleLogout}
                >
                  Log Out
                </button>
              </div>
            {/if}
          </div>
        {:else}
          <a href="/login" class="font-medium text-fait-dark hover:text-fait-blue">Log In</a>
          <Button href="/register" variant="primary">Sign Up</Button>
        {/if}
      </div>

      <!-- Mobile Menu Button -->
      <button
        class="md:hidden text-fait-dark p-2"
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
    </nav>

    <!-- Mobile Navigation -->
    {#if mobileMenuOpen}
      <div class="md:hidden mt-4 py-4 border-t border-gray-200">
        <div class="flex flex-col space-y-4">
          {#each navItems as item}
            <a
              href={item.href}
              class="font-medium {$page.url.pathname === item.href ? 'text-fait-blue' : 'text-fait-dark hover:text-fait-blue'}"
            >
              {item.label}
            </a>
          {/each}

          {#if $auth.isAuthenticated}
            <div class="pt-4 border-t border-gray-200">
              <div class="flex items-center space-x-2 mb-4">
                <div class="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                  {#if $auth.user?.avatar}
                    <img src={$auth.user.avatar} alt={$auth.user.name} class="w-full h-full object-cover" />
                  {:else}
                    <div class="w-full h-full flex items-center justify-center text-gray-500">
                      {$auth.user?.name.charAt(0).toUpperCase()}
                    </div>
                  {/if}
                </div>
                <span class="font-medium">{$auth.user?.name}</span>
              </div>

              <a href="/profile" class="block py-2 font-medium text-fait-dark hover:text-fait-blue">Profile</a>
              <a href="/bookings" class="block py-2 font-medium text-fait-dark hover:text-fait-blue">My Bookings</a>
              {#if $auth.user?.role === 'provider'}
                <a href="/provider/dashboard" class="block py-2 font-medium text-fait-dark hover:text-fait-blue">Provider Dashboard</a>
              {/if}
              <button
                class="block w-full text-left py-2 font-medium text-fait-dark hover:text-fait-blue"
                on:click={handleLogout}
              >
                Log Out
              </button>
            </div>
          {:else}
            <div class="pt-4 border-t border-gray-200 flex flex-col space-y-4">
              <a href="/login" class="font-medium text-fait-dark hover:text-fait-blue">Log In</a>
              <Button href="/register" variant="primary" fullWidth={true}>Sign Up</Button>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</header>
