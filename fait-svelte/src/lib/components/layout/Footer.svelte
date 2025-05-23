<script lang="ts">
  const currentYear = new Date().getFullYear();

  // Footer navigation categories
  const footerLinks = [
    {
      title: "For Clients",
      links: [
        { label: "Find Services", href: "/services" },
        { label: "How It Works", href: "/how-it-works" },
        { label: "Pricing", href: "/pricing" },
        { label: "Reviews", href: "/reviews" },
        { label: "Gift Cards", href: "/gift-cards" }
      ]
    },
    {
      title: "For Providers",
      links: [
        { label: "Join as a Pro", href: "/providers/join" },
        { label: "Pro Resources", href: "/providers/resources" },
        { label: "Success Stories", href: "/providers/stories" },
        { label: "Pro Community", href: "/providers/community" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Press", href: "/press" },
        { label: "Blog", href: "/blog" },
        { label: "Contact Us", href: "/contact" }
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "/help" },
        { label: "Safety", href: "/safety" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Accessibility", href: "/accessibility" }
      ]
    }
  ];

  // Social media links with SVG icons
  const socialLinks = [
    {
      label: 'Facebook',
      href: 'https://facebook.com',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
            </svg>`
    },
    {
      label: 'Twitter',
      href: 'https://twitter.com',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
            </svg>`
    },
    {
      label: 'Instagram',
      href: 'https://instagram.com',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>`
    },
    {
      label: 'LinkedIn',
      href: 'https://linkedin.com',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
            </svg>`
    }
  ];

  // App store links
  const appStoreLinks = [
    {
      label: 'App Store',
      href: '#',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z"/>
            </svg>`
    },
    {
      label: 'Google Play',
      href: '#',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 20.562l7.969-5.281L3 9.78v10.782zm0-12.562l7.969 5.281L3 18.22V8zm9 5.469l8.969 5.969L12 13.469zm8.969-7.969L12 11.53 3 5.5l8.969-5.969 9 5.969z"/>
            </svg>`
    }
  ];
</script>

<footer class="bg-fait-green-dark text-white pt-16 pb-8">
  <div class="container-custom">
    <!-- Top Section with Logo, Description, and Newsletter -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12 pb-12 border-b border-white/10">
      <!-- Logo and Description -->
      <div class="lg:col-span-2">
        <a href="/" class="inline-flex items-center mb-4">
          <svg class="w-8 h-8 mr-2 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7.5 12H16.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 7.5V16.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="text-2xl font-ivy font-bold">FAIT</span>
        </a>
        <p class="text-white/80 mb-6 max-w-md">
          FAIT is a cooperative platform connecting skilled professionals with clients who need their services. We're building a more equitable gig economy that works for everyone.
        </p>

        <!-- App Store Links -->
        <div class="flex flex-wrap gap-4 mb-6">
          {#each appStoreLinks as link}
            <a
              href={link.href}
              class="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200"
              aria-label={link.label}
            >
              <span class="text-white mr-2">{@html link.icon}</span>
              <div>
                <div class="text-xs text-white/70">Download on</div>
                <div class="text-sm font-medium">{link.label}</div>
              </div>
            </a>
          {/each}
        </div>

        <!-- Social Links -->
        <div class="flex space-x-4">
          {#each socialLinks as link}
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              class="text-white/80 hover:text-white transition-colors duration-200"
              aria-label={link.label}
            >
              {@html link.icon}
            </a>
          {/each}
        </div>
      </div>

      <!-- Newsletter Signup -->
      <div class="lg:col-span-3 bg-white/10 rounded-xl p-6">
        <h3 class="text-xl font-semibold mb-2">Stay in the loop</h3>
        <p class="text-white/80 mb-4">Subscribe to our newsletter for the latest updates, tips, and special offers.</p>
        <form class="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            placeholder="Your email address"
            class="flex-grow px-4 py-3 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
            required
          />
          <button
            type="submit"
            class="px-6 py-3 bg-white text-fait-green font-medium rounded-lg transition-colors duration-200 hover:bg-white/90"
          >
            Subscribe
          </button>
        </form>
        <p class="text-xs text-white/60 mt-3">
          By subscribing, you agree to our Privacy Policy and consent to receive updates from FAIT.
        </p>
      </div>
    </div>

    <!-- Footer Links -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
      {#each footerLinks as category}
        <div>
          <h4 class="text-lg font-semibold mb-4">{category.title}</h4>
          <ul class="space-y-2">
            {#each category.links as link}
              <li>
                <a
                  href={link.href}
                  class="text-white/70 hover:text-white transition-colors duration-200 text-sm"
                >
                  {link.label}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>

    <!-- Bottom Section -->
    <div class="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
      <p class="text-white/60 text-sm mb-4 md:mb-0">
        &copy; {currentYear} FAIT Cooperative. All rights reserved.
      </p>
      <div class="flex space-x-6">
        <a href="/terms" class="text-white/60 hover:text-white text-sm">Terms</a>
        <a href="/privacy" class="text-white/60 hover:text-white text-sm">Privacy</a>
        <a href="/cookies" class="text-white/60 hover:text-white text-sm">Cookies</a>
        <a href="/sitemap" class="text-white/60 hover:text-white text-sm">Sitemap</a>
      </div>
    </div>
  </div>
</footer>
