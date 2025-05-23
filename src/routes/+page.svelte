<script lang="ts">
  import { onMount } from 'svelte';

  // Example data for categories, projects, stats, testimonials
  const categories = [
    { label: 'Assembly', href: '/services/assembly' },
    { label: 'Mounting', href: '/services/mounting' },
    { label: 'Moving', href: '/services/moving' },
    { label: 'Cleaning', href: '/services/cleaning' },
    { label: 'Outdoor Help', href: '/services/outdoor' },
    { label: 'Home Repairs', href: '/services/repairs' },
    { label: 'Painting', href: '/services/painting' },
    { label: 'Trending', href: '/services/trending' }
  ];

  // Popular projects/services
  const popularProjects = [
    {
      title: 'Furniture Assembly',
      desc: 'Projects starting at $49',
      image: 'https://images.ctfassets.net/vwt5n1ljn95x/15JB3WRwRtvEsf5rcVKmnK/610c440541b1cca93bee3534037379e7/Furniture_Assembly.jpeg?w=640&q=75&fm=webp',
      alt: 'Furniture Assembly',
      link: '/services/assembly'
    },
    {
      title: 'Mount Art or Shelves',
      desc: 'Projects starting at $65',
      image: 'https://images.ctfassets.net/vwt5n1ljn95x/3sbIHOfdhBhVilGyaApius/829a05b423c4aff40b3bb007668e85cb/Hang_Pictures.jpeg?w=640&q=75&fm=webp',
      alt: 'Mount Art or Shelves',
      link: '/services/mounting'
    },
    {
      title: 'Mount a TV',
      desc: 'Projects starting at $69',
      image: 'https://images.ctfassets.net/vwt5n1ljn95x/3yZJxfcMurN3fYgm2VIw3v/1f0aee924e621fd5e2684f01f92ca7b2/Mount_TV.jpg?w=640&q=75&fm=webp',
      alt: 'Mount a TV',
      link: '/services/tv-mounting'
    },
    {
      title: 'Help Moving',
      desc: 'Projects starting at $67',
      image: 'https://images.ctfassets.net/vwt5n1ljn95x/5RdOpgNLV7GFgjHegMSn4S/4da60b993bc3b03fcef4d19645c38e59/Help_Moving.jpg?w=640&q=75&fm=webp',
      alt: 'Help Moving',
      link: '/services/moving'
    }
  ];

  // Stats
  const stats = [
    { label: 'Furniture Assemblies', value: '3.4M+' },
    { label: 'Moving tasks', value: '1.5M+' },
    { label: 'Items mounted', value: '1M+' },
    { label: 'Home Repairs', value: '700K+' },
    { label: 'Homes cleaned', value: '890K+' }
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'Elizabeth P.',
      text: 'Vitalii assembled the IKEA Norli drawer chest for me in less than 30 minutes, and he assembled a metal wire shelving unit as well in about 10 minutes. He also fixed a drawer on an already assembled desk so it extends further.',
      service: 'IKEA Furniture Assembly'
    },
    {
      name: 'Tiffany B.',
      text: 'David did an awesome job assembling crib and dresser for nursery. Really appreciate this! He cleaned up the area after his work, organized the boxes for easy disposal and went through the directions with us in the event we have to change crib settings.',
      service: 'Furniture Assembly'
    }
  ];

  // Parallax effect
  onMount(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax');
      
      parallaxElements.forEach((element) => {
        const speed = element.dataset.speed || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });

      // Fade in animations
      const fadeElements = document.querySelectorAll('.fade-in');
      fadeElements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>

<!-- HERO SECTION -->
<section class="relative bg-gradient-to-br from-fait-green-light via-white to-fait-green-light py-24 md:py-32 overflow-hidden">
  <!-- Parallax background elements -->
  <div class="absolute inset-0 parallax" data-speed="0.3">
    <div class="absolute top-20 left-10 w-72 h-72 bg-fait-green/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-20 right-10 w-96 h-96 bg-fait-green/3 rounded-full blur-3xl"></div>
  </div>
  
  <div class="section-container relative z-10">
    <div class="flex flex-col md:flex-row items-center gap-16">
      <div class="flex-1 fade-in">
        <div class="inline-block px-4 py-2 rounded-full bg-fait-green/10 text-fait-green text-sm font-semibold mb-6">
          TRUSTED PROFESSIONALS
        </div>
        <h1 class="text-5xl md:text-7xl font-ivy font-bold text-fait-green-dark mb-6 leading-tight">
          Book trusted help
        </h1>
        <h2 class="text-4xl md:text-6xl font-ivy font-bold text-fait-green-dark mb-10 leading-tight">
          for home tasks
        </h2>
        
        <form class="flex w-full max-w-2xl mb-8 shadow-lg">
          <input
            type="text"
            placeholder="What do you need help with?"
            class="flex-1 px-8 py-5 rounded-l-2xl border-2 border-gray-200 text-lg focus:outline-none focus:border-fait-green transition-colors bg-white"
          />
          <button
            type="submit"
            class="bg-fait-green text-white font-semibold px-10 py-5 rounded-r-2xl hover:bg-fait-green-dark transition-all duration-300 transform hover:scale-105"
          >
            Search
          </button>
        </form>
        
        <div class="flex flex-wrap gap-3">
          {#each categories as cat}
            <a 
              href={cat.href} 
              class="px-6 py-3 rounded-full border-2 border-fait-green/20 text-fait-green-dark font-medium bg-white/80 backdrop-blur-sm hover:bg-fait-green hover:text-white hover:border-fait-green transition-all duration-300 transform hover:scale-105"
            >
              {cat.label}
            </a>
          {/each}
        </div>
      </div>
      
      <div class="flex-1 flex justify-center fade-in">
        <div class="relative">
          <img
            src="https://images.ctfassets.net/vwt5n1ljn95x/2zLfFEV2MrXbcska0MocE7/32575342bd9f30397d58ccb663c71744/Homepage_Assembly.png?w=800&q=75&fm=webp"
            alt="Assembly illustration"
            class="rounded-3xl shadow-2xl w-full max-w-lg transform hover:scale-105 transition-transform duration-500"
          />
          <div class="absolute -bottom-6 -right-6 w-24 h-24 bg-fait-green/10 rounded-full blur-xl"></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Smooth divider -->
<div class="relative h-24 bg-gradient-to-b from-fait-green-light to-white">
  <svg class="absolute bottom-0 w-full h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity="0.25" fill="currentColor"></path>
    <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity="0.5" fill="currentColor"></path>
    <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
  </svg>
</div>

<!-- POPULAR PROJECTS -->
<section class="py-24 bg-white relative">
  <div class="section-container">
    <div class="text-center mb-16 fade-in">
      <div class="inline-block px-4 py-2 rounded-full bg-fait-green/10 text-fait-green text-sm font-semibold mb-4">
        MOST REQUESTED
      </div>
      <h2 class="text-4xl md:text-6xl font-ivy font-bold text-fait-green-dark mb-6">Popular Projects</h2>
      <p class="text-fait-gray text-lg max-w-2xl mx-auto">
        Discover the services our community loves most
      </p>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {#each popularProjects as project, i}
        <a 
          href={project.link} 
          class="group block rounded-3xl overflow-hidden shadow-lg bg-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 fade-in"
          style="animation-delay: {i * 100}ms"
        >
          <div class="relative overflow-hidden">
            <img 
              src={project.image} 
              alt={project.alt} 
              class="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div class="p-8">
            <h3 class="font-bold text-xl mb-3 text-fait-green-dark group-hover:text-fait-green transition-colors duration-300">
              {project.title}
            </h3>
            <p class="text-fait-gray mb-4 text-base">{project.desc}</p>
            <span class="inline-flex items-center text-fait-green font-semibold text-sm group-hover:gap-2 transition-all duration-300">
              Learn more
              <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </span>
          </div>
        </a>
      {/each}
    </div>
  </div>
</section>

<!-- Smooth divider -->
<div class="relative h-24 bg-gradient-to-b from-white to-fait-green-light">
  <svg class="absolute top-0 w-full h-24 rotate-180" viewBox="0 0 1200 120" preserveAspectRatio="none">
    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity="0.25" fill="currentColor"></path>
    <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity="0.5" fill="currentColor"></path>
    <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
  </svg>
</div>

<!-- STATS SECTION -->
<section class="py-20 bg-fait-green-light relative overflow-hidden">
  <div class="absolute inset-0 parallax" data-speed="0.2">
    <div class="absolute top-0 left-1/4 w-64 h-64 bg-fait-green/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 right-1/4 w-80 h-80 bg-fait-green/3 rounded-full blur-3xl"></div>
  </div>
  
  <div class="section-container relative z-10">
    <div class="grid grid-cols-2 md:grid-cols-5 gap-8 text-center fade-in">
      {#each stats as stat, i}
        <div class="transform hover:scale-105 transition-transform duration-300" style="animation-delay: {i * 100}ms">
          <div class="text-4xl md:text-5xl font-bold text-fait-green mb-2">{stat.value}</div>
          <div class="text-fait-gray text-base font-medium">{stat.label}</div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- TESTIMONIALS -->
<section class="py-32 bg-gradient-to-br from-fait-gray-light via-white to-fait-gray-light relative overflow-hidden">
  <div class="absolute inset-0 parallax" data-speed="0.4">
    <div class="absolute top-1/4 -left-20 w-96 h-96 bg-fait-green/3 rounded-full blur-3xl"></div>
    <div class="absolute bottom-1/4 -right-20 w-80 h-80 bg-fait-green/5 rounded-full blur-3xl"></div>
  </div>
  
  <div class="section-container relative z-10">
    <div class="text-center mb-20 max-w-4xl mx-auto fade-in">
      <div class="inline-block px-4 py-2 rounded-full bg-fait-green/10 text-fait-green text-sm font-semibold mb-6">
        REAL EXPERIENCES
      </div>
      <h2 class="text-4xl md:text-6xl font-ivy font-bold mb-8 text-fait-green-dark">What Our Community Says</h2>
      <p class="text-fait-gray text-xl max-w-3xl mx-auto leading-relaxed">
        Hear from our satisfied clients and service providers about their experiences with FAIT.
      </p>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
      {#each testimonials as t, i}
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-10 flex flex-col transform hover:scale-105 transition-all duration-500 fade-in" style="animation-delay: {i * 200}ms">
          <div class="flex items-center mb-6">
            <div class="h-16 w-16 rounded-full bg-gradient-to-br from-fait-green to-fait-green-dark flex items-center justify-center text-2xl font-bold text-white mr-6">
              {t.name.charAt(0)}
            </div>
            <div>
              <div class="font-bold text-lg text-fait-green-dark">{t.name}</div>
              <div class="text-fait-green font-medium">{t.service}</div>
            </div>
          </div>
          <div class="text-fait-gray text-lg leading-relaxed flex-1">"{t.text}"</div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="py-32 bg-white relative">
  <div class="section-container">
    <div class="text-center mb-20 fade-in">
      <div class="inline-block px-4 py-2 rounded-full bg-fait-green/10 text-fait-green text-sm font-semibold mb-6">
        SIMPLE PROCESS
      </div>
      <h2 class="text-4xl md:text-6xl font-ivy font-bold text-fait-green-dark mb-8">How it works</h2>
      <p class="text-fait-gray text-xl max-w-3xl mx-auto">
        Get help in three simple steps
      </p>
    </div>
    
    <div class="flex flex-col lg:flex-row justify-center gap-16 max-w-6xl mx-auto">
      {#each [
        { step: '1', title: 'Choose a Pro', desc: 'Browse by price, skills, and reviews to find the right person for your task.' },
        { step: '2', title: 'Schedule Easily', desc: 'Book a time that works for you, as early as today.' },
        { step: '3', title: 'All-in-One Platform', desc: 'Chat, pay, tip, and review all in one place for a seamless experience.' }
      ] as item, i}
        <div class="flex-1 flex flex-col items-center text-center fade-in" style="animation-delay: {i * 200}ms">
          <div class="relative mb-8">
            <div class="bg-gradient-to-br from-fait-green to-fait-green-dark rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold text-white shadow-lg transform hover:scale-110 transition-transform duration-300">
              {item.step}
            </div>
            {#if i < 2}
              <div class="hidden lg:block absolute top-10 left-20 w-32 h-0.5 bg-gradient-to-r from-fait-green to-transparent"></div>
            {/if}
          </div>
          <h3 class="text-2xl font-bold mb-4 text-fait-green-dark">{item.title}</h3>
          <p class="text-fait-gray text-lg leading-relaxed max-w-sm">{item.desc}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- CTA SECTION -->
<section class="py-32 bg-gradient-to-br from-fait-green via-fait-green-dark to-fait-green text-white relative overflow-hidden">
  <div class="absolute inset-0 parallax" data-speed="0.3">
    <div class="absolute top-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-20 right-20 w-80 h-80 bg-white/3 rounded-full blur-3xl"></div>
  </div>
  
  <div class="section-container text-center relative z-10">
    <div class="max-w-4xl mx-auto fade-in">
      <h2 class="text-4xl md:text-6xl font-ivy font-bold mb-8">Ready to get started?</h2>
      <p class="text-xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-90">
        Join FAIT today and experience a better way to get things done. Whether you need help or want to offer your skills, we're here for you.
      </p>
      <div class="flex flex-col sm:flex-row justify-center gap-6">
        <a 
          href="/register" 
          class="px-10 py-5 rounded-full bg-white text-fait-green font-bold text-lg shadow-lg hover:bg-fait-green-light hover:text-fait-green-dark transition-all duration-300 transform hover:scale-105"
        >
          Sign Up
        </a>
        <a 
          href="/services" 
          class="px-10 py-5 rounded-full border-2 border-white text-white font-bold text-lg shadow-lg hover:bg-white hover:text-fait-green transition-all duration-300 transform hover:scale-105"
        >
          Browse Services
        </a>
      </div>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="bg-fait-dark text-white py-16">
  <div class="container-custom">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
      <!-- Company Info -->
      <div>
        <h3 class="text-2xl font-ivy font-bold mb-6">FAIT</h3>
        <p class="text-gray-300 mb-8 text-lg leading-relaxed">Empowering communities through cooperative services.</p>
        <div class="flex space-x-6">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="text-gray-300 hover:text-white transition-colors text-lg font-medium" aria-label="Facebook">
            Facebook
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="text-gray-300 hover:text-white transition-colors text-lg font-medium" aria-label="Twitter">
            Twitter
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="text-gray-300 hover:text-white transition-colors text-lg font-medium" aria-label="Instagram">
            Instagram
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="text-gray-300 hover:text-white transition-colors text-lg font-medium" aria-label="LinkedIn">
            LinkedIn
          </a>
        </div>
      </div>
      
      <!-- Quick Links -->
      <div>
        <h4 class="text-xl font-bold mb-6">Quick Links</h4>
        <ul class="space-y-4">
          <li><a href="/" class="text-gray-300 hover:text-white transition-colors text-lg">Home</a></li>
          <li><a href="/services" class="text-gray-300 hover:text-white transition-colors text-lg">Services</a></li>
          <li><a href="/about" class="text-gray-300 hover:text-white transition-colors text-lg">About</a></li>
          <li><a href="/contact" class="text-gray-300 hover:text-white transition-colors text-lg">Contact</a></li>
          <li><a href="/privacy" class="text-gray-300 hover:text-white transition-colors text-lg">Privacy Policy</a></li>
          <li><a href="/terms" class="text-gray-300 hover:text-white transition-colors text-lg">Terms of Service</a></li>
        </ul>
      </div>
      
      <!-- Contact Info -->
      <div>
        <h4 class="text-xl font-bold mb-6">Contact</h4>
        <ul class="space-y-4 text-gray-300">
          <li class="flex items-start text-lg">
            <span class="font-medium mr-3">Email:</span>
            <span>info@itsfait.com</span>
          </li>
          <li class="flex items-start text-lg">
            <span class="font-medium mr-3">Phone:</span>
            <span>(555) 123-4567</span>
          </li>
          <li class="flex items-start text-lg">
            <span class="font-medium mr-3">Address:</span>
            <span>123 Cooperative Way<br />San Francisco, CA 94110</span>
          </li>
        </ul>
      </div>
    </div>
    
    <div class="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400">
      <p class="text-lg">&copy; {new Date().getFullYear()} FAIT Cooperative. All rights reserved.</p>
    </div>
  </div>
</footer>

<style>
  .section-container {
    @apply max-w-7xl mx-auto px-6;
  }
  .container-custom {
    @apply max-w-6xl mx-auto px-6;
  }

  .fade-in {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s ease-out;
  }

  .fade-in.active {
    opacity: 1;
    transform: translateY(0);
  }

  .parallax {
    will-change: transform;
  }

  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }

  /* Custom animations */
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  .float {
    animation: float 6s ease-in-out infinite;
  }
</style>
