<script lang="ts">
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { name: 'Home Cleaning', href: '/services/cleaning' },
      { name: 'Handyman', href: '/services/handyman' },
      { name: 'Gardening', href: '/services/gardening' },
      { name: 'Moving', href: '/services/moving' }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Careers', href: '/careers' },
      { name: 'Blog', href: '/blog' }
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Safety', href: '/safety' },
      { name: 'Community Guidelines', href: '/guidelines' },
      { name: 'Trust & Safety', href: '/trust' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Accessibility', href: '/accessibility' }
    ]
  };

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: 'facebook' },
    { name: 'Twitter', href: '#', icon: 'twitter' },
    { name: 'Instagram', href: '#', icon: 'instagram' },
    { name: 'LinkedIn', href: '#', icon: 'linkedin' }
  ];
</script>

<footer class="bg-gray-900 text-white">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <!-- Main Footer Content -->
    <div class="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
      <!-- Brand Section -->
      <div class="lg:col-span-1">
        <div class="flex items-center mb-4">
          <span class="text-2xl font-bold text-blue-400">FAIT</span>
        </div>
        <p class="text-gray-400 text-sm mb-4">
          Connecting communities through trusted local services. Find reliable professionals for all your home and business needs.
        </p>
        <!-- Social Links -->
        <div class="flex space-x-4">
          {#each socialLinks as social}
            <a href={social.href} class="text-gray-400 hover:text-white transition-colors">
              <span class="sr-only">{social.name}</span>
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                {#if social.icon === 'facebook'}
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                {:else if social.icon === 'twitter'}
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                {:else if social.icon === 'instagram'}
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM12 16.624c-2.563 0-4.637-2.074-4.637-4.637S9.437 7.35 12 7.35s4.637 2.074 4.637 4.637S14.563 16.624 12 16.624zm4.875-8.362c-.6 0-1.088-.488-1.088-1.088s.488-1.088 1.088-1.088 1.088.488 1.088 1.088-.488 1.088-1.088 1.088z"/>
                {:else if social.icon === 'linkedin'}
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                {/if}
              </svg>
            </a>
          {/each}
        </div>
      </div>

      <!-- Services -->
      <div>
        <h3 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">Services</h3>
        <ul class="space-y-2">
          {#each footerLinks.services as link}
            <li>
              <a href={link.href} class="text-gray-400 hover:text-white text-sm transition-colors">
                {link.name}
              </a>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Company -->
      <div>
        <h3 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
        <ul class="space-y-2">
          {#each footerLinks.company as link}
            <li>
              <a href={link.href} class="text-gray-400 hover:text-white text-sm transition-colors">
                {link.name}
              </a>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Support -->
      <div>
        <h3 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">Support</h3>
        <ul class="space-y-2">
          {#each footerLinks.support as link}
            <li>
              <a href={link.href} class="text-gray-400 hover:text-white text-sm transition-colors">
                {link.name}
              </a>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Legal -->
      <div>
        <h3 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h3>
        <ul class="space-y-2">
          {#each footerLinks.legal as link}
            <li>
              <a href={link.href} class="text-gray-400 hover:text-white text-sm transition-colors">
                {link.name}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </div>

    <!-- Bottom Footer -->
    <div class="border-t border-gray-800 py-6">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-400 text-sm">
          © {currentYear} FAIT. All rights reserved.
        </p>
        <p class="text-gray-400 text-sm mt-2 md:mt-0">
          Made for local communities
        </p>
      </div>
    </div>
  </div>
</footer>
