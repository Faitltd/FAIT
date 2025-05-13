<script lang="ts">
  import { Menu, X, ChevronDown } from 'lucide-svelte';
  import { onMount } from 'svelte';
  
  export let currentApp: string = '';
  
  let isMenuOpen = false;
  let isDropdownOpen = false;
  
  const apps = [
    { id: 'fait-coop', name: 'FAIT Coop', url: 'http://localhost:3000' },
    { id: 'flippercalc', name: 'FlipperCalc', url: 'http://localhost:5173' },
    { id: 'offershield', name: 'OfferShield', url: 'http://localhost:5174' },
    { id: 'home-health-score', name: 'Home Health Score', url: 'http://localhost:5175' },
    { id: 'handyman-calculator', name: 'Handyman Calculator', url: 'http://localhost:5176' },
    { id: 'remodeling-calculator', name: 'Remodeling Calculator', url: 'http://localhost:5177' }
  ];
  
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }
  
  function toggleDropdown() {
    isDropdownOpen = !isDropdownOpen;
  }
  
  function closeDropdown() {
    isDropdownOpen = false;
  }
  
  function getCurrentApp() {
    return apps.find(app => app.id === currentApp) || apps[0];
  }
  
  onMount(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        closeDropdown();
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<div class="bg-primary-600 text-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16 items-center">
      <div class="flex items-center">
        <span class="text-xl font-bold">FAIT</span>
      </div>
      
      <!-- Desktop navigation -->
      <nav class="hidden md:flex space-x-8 items-center">
        <div class="dropdown-container relative">
          <button 
            type="button" 
            class="flex items-center text-white hover:text-primary-100 px-3 py-2 rounded-md text-sm font-medium"
            on:click|stopPropagation={toggleDropdown}
          >
            {getCurrentApp().name}
            <ChevronDown class="w-4 h-4 ml-1" />
          </button>
          
          {#if isDropdownOpen}
            <div class="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
              <div class="py-1" role="menu" aria-orientation="vertical">
                {#each apps as app}
                  <a 
                    href={app.url} 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    class:bg-gray-100={app.id === currentApp}
                    role="menuitem"
                  >
                    {app.name}
                  </a>
                {/each}
              </div>
            </div>
          {/if}
        </div>
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
    <div class="md:hidden">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        {#each apps as app}
          <a 
            href={app.url} 
            class="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700"
            class:bg-primary-700={app.id === currentApp}
            on:click={() => isMenuOpen = false}
          >
            {app.name}
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>
