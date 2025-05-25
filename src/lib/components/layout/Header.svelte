<script lang="ts">
  import { page } from '$app/stores';
  import Button from '$lib/components/ui/Button.svelte';
  
  // Navigation items
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' }
  ];
  
  // Mobile menu state
  let mobileMenuOpen = false;
  
  // Toggle mobile menu
  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }
  
  // Close mobile menu when route changes
  $: if ($page.url.pathname) {
    mobileMenuOpen = false;
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
      
      <!-- CTA Button (Desktop) -->
      <div class="hidden md:block">
        <Button href="/services" variant="primary">Find Services</Button>
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
          <Button href="/services" variant="primary" fullWidth={true}>Find Services</Button>
        </div>
      </div>
    {/if}
  </div>
</header>
