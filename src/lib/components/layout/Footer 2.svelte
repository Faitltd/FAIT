<script lang="ts">
  const currentYear = new Date().getFullYear();
  
  // Footer navigation items
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' }
  ];
  
  // Social media links
  const socialLinks = [
    { label: 'Facebook', href: 'https://facebook.com', icon: 'facebook' },
    { label: 'Twitter', href: 'https://twitter.com', icon: 'twitter' },
    { label: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
    { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'linkedin' }
  ];
</script>

<footer class="bg-fait-dark text-white py-8">
  <div class="container-custom">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Company Info -->
      <div>
        <h3 class="text-xl font-ivy mb-4">FAIT</h3>
        <p class="text-gray-300 mb-4">Empowering communities through cooperative services.</p>
        <div class="flex space-x-4">
          {#each socialLinks as link}
            <a 
              href={link.href} 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-gray-300 hover:text-white transition-colors"
              aria-label={link.label}
            >
              {#if link.icon === 'facebook'}
                <span class="font-icomoon">📘</span>
              {:else if link.icon === 'twitter'}
                <span class="font-icomoon">🐦</span>
              {:else if link.icon === 'instagram'}
                <span class="font-icomoon">📷</span>
              {:else if link.icon === 'linkedin'}
                <span class="font-icomoon">🔗</span>
              {/if}
            </a>
          {/each}
        </div>
      </div>
      
      <!-- Quick Links -->
      <div>
        <h4 class="text-lg font-medium mb-4">Quick Links</h4>
        <ul class="space-y-2">
          {#each navItems as item}
            <li>
              <a href={item.href} class="text-gray-300 hover:text-white transition-colors">
                {item.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
      
      <!-- Contact Info -->
      <div>
        <h4 class="text-lg font-medium mb-4">Contact</h4>
        <ul class="space-y-2 text-gray-300">
          <li class="flex items-start">
            <span class="mr-2">📧</span>
            <span>info@itsfait.com</span>
          </li>
          <li class="flex items-start">
            <span class="mr-2">📱</span>
            <span>(555) 123-4567</span>
          </li>
          <li class="flex items-start">
            <span class="mr-2">📍</span>
            <span>123 Cooperative Way<br />San Francisco, CA 94110</span>
          </li>
        </ul>
      </div>
    </div>
    
    <!-- Copyright -->
    <div class="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
      <p>&copy; {currentYear} FAIT Cooperative. All rights reserved.</p>
    </div>
  </div>
</footer>
