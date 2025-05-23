<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  // Categories for the homepage
  const categories = [
    { label: 'Assembly', href: '/services/assembly', icon: '/images/icons/assembly.svg' },
    { label: 'Mounting', href: '/services/mounting', icon: '/images/icons/mounting.svg' },
    { label: 'Moving', href: '/services/moving', icon: '/images/icons/moving.svg' },
    { label: 'Cleaning', href: '/services/cleaning', icon: '/images/icons/cleaning.svg' },
    { label: 'Outdoor Help', href: '/services/outdoor', icon: '/images/icons/outdoor.svg' },
    { label: 'Home Repairs', href: '/services/repairs', icon: '/images/icons/repairs.svg' },
    { label: 'Painting', href: '/services/painting', icon: '/images/icons/painting.svg' },
    { label: 'Handyman', href: '/services/handyman', icon: '/images/icons/handyman.svg' }
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
    },
    {
      title: 'Home & Apartment Cleaning',
      desc: 'Projects starting at $85',
      image: 'https://images.ctfassets.net/vwt5n1ljn95x/6Cvtn4D1JLzEfKYlTxRxjb/2a8ae4eedf0afd6e1f64a9e5d87b8582/Cleaning.jpg?w=640&q=75&fm=webp',
      alt: 'Home & Apartment Cleaning',
      link: '/services/cleaning'
    },
    {
      title: 'Minor Plumbing Repairs',
      desc: 'Projects starting at $94',
      image: 'https://images.ctfassets.net/vwt5n1ljn95x/5Lk6fvvnYYiOcwWO0qgOeW/c5f97cf5d3c0f3d9c73d9d9a980d1460/Plumbing.jpg?w=640&q=75&fm=webp',
      alt: 'Minor Plumbing Repairs',
      link: '/services/plumbing'
    },
    {
      title: 'Electrical Help',
      desc: 'Projects starting at $85',
      image: 'https://images.ctfassets.net/vwt5n1ljn95x/5Lk6fvvnYYiOcwWO0qgOeW/c5f97cf5d3c0f3d9c73d9d9a980d1460/Electrical.jpg?w=640&q=75&fm=webp',
      alt: 'Electrical Help',
      link: '/services/electrical'
    },
    {
      title: 'Heavy Lifting',
      desc: 'Projects starting at $54',
      image: 'https://images.ctfassets.net/vwt5n1ljn95x/5RdOpgNLV7GFgjHegMSn4S/4da60b993bc3b03fcef4d19645c38e59/Heavy_Lifting.jpg?w=640&q=75&fm=webp',
      alt: 'Heavy Lifting',
      link: '/services/heavy-lifting'
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

  // Assembly subcategories
  const assemblySubcategories = [
    { label: 'General Furniture Assembly', href: '/services/general-furniture-assembly' },
    { label: 'IKEA Assembly', href: '/services/ikea-assembly' },
    { label: 'Crib Assembly', href: '/services/crib-assembly' },
    { label: 'PAX Assembly', href: '/services/pax-assembly' },
    { label: 'Bookshelf Assembly', href: '/services/bookshelf-assembly' },
    { label: 'Desk Assembly', href: '/services/desk-assembly' }
  ];

  // Add fade-in effect for elements
  onMount(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => {
      observer.observe(el);
    });

    return () => {
      document.querySelectorAll('.fade-in').forEach(el => {
        observer.unobserve(el);
      });
    };
  });
</script>

<style>
  .fade-in {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  }

  .fade-in.active {
    opacity: 1;
    transform: translateY(0);
  }
</style>

<svelte:head>
  <title>FAIT - Book trusted help for home tasks</title>
  <meta name="description" content="FAIT connects you with skilled professionals for furniture assembly, mounting, moving, cleaning, and more." />
</svelte:head>

<!-- HERO SECTION -->
<section class="relative bg-[#2d3138] py-24 md:py-32 overflow-hidden">
  <!-- Background elements -->
  <div class="absolute inset-0">
    <div class="absolute top-20 left-10 w-72 h-72 bg-[#65d6ad]/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-20 right-10 w-96 h-96 bg-[#65d6ad]/3 rounded-full blur-3xl"></div>
  </div>

  <div class="section-container relative z-10">
    <div class="flex flex-col md:flex-row items-center gap-16">
      <div class="flex-1 fade-in">
        <h1 class="text-5xl md:text-7xl font-ivy font-bold text-white mb-6 leading-tight">
          Book trusted help
        </h1>
        <h2 class="text-4xl md:text-6xl font-ivy font-bold text-white mb-10 leading-tight">
          for home tasks
        </h2>

        <form class="flex w-full max-w-2xl mb-8 shadow-lg">
          <input
            type="text"
            placeholder="What do you need help with?"
            class="flex-1 px-8 py-5 rounded-l-2xl border-2 border-gray-200 text-lg focus:outline-none focus:border-[#65d6ad] transition-colors bg-white"
          />
          <button
            type="submit"
            aria-label="Search for services"
            class="bg-[#65d6ad] text-white font-semibold px-10 py-5 rounded-r-2xl hover:bg-[#65d6ad]/90 transition-all duration-300 transform hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        <div class="flex flex-wrap gap-3">
          {#each categories as cat}
            <a
              href={cat.href}
              class="px-6 py-3 rounded-full border-2 border-white/20 text-white font-medium bg-white/5 backdrop-blur-sm hover:bg-[#65d6ad] hover:text-white hover:border-[#65d6ad] transition-all duration-300 transform hover:scale-105"
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
          <div class="absolute -bottom-6 -right-6 w-24 h-24 bg-[#65d6ad]/10 rounded-full blur-xl"></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CATEGORY ICONS SECTION -->
<section class="py-12 bg-white">
  <div class="section-container">
    <div class="grid grid-cols-4 md:grid-cols-8 gap-4 justify-center">
      {#each categories as cat}
        <a href={cat.href} class="flex flex-col items-center group">
          <div class="w-16 h-16 mb-2 flex items-center justify-center bg-gray-100 rounded-full group-hover:bg-[#65d6ad]/10 transition-colors duration-300">
            <img src={cat.icon} alt={cat.label} class="w-8 h-8" />
          </div>
          <span class="text-sm text-center font-medium">{cat.label}</span>
        </a>
      {/each}
    </div>
  </div>
</section>

<!-- ASSEMBLY SUBCATEGORIES SECTION -->
<section class="py-6 bg-white border-t border-gray-200">
  <div class="section-container">
    <div class="flex flex-wrap justify-center gap-4">
      {#each assemblySubcategories as subcat}
        <a href={subcat.href} class="px-4 py-2 text-sm bg-gray-100 rounded-full hover:bg-[#65d6ad]/10 transition-colors duration-300">
          {subcat.label}
        </a>
      {/each}
    </div>
  </div>
</section>

<!-- POPULAR PROJECTS SECTION -->
<section class="py-16 bg-white">
  <div class="section-container">
    <h2 class="text-2xl font-bold mb-8">Popular Projects</h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each popularProjects.slice(0, 4) as project}
        <a href={project.link} class="block group">
          <div class="rounded-lg overflow-hidden mb-3">
            <img
              src={project.image}
              alt={project.alt}
              class="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <h3 class="font-bold text-lg mb-1">{project.title}</h3>
          <p class="text-gray-600">{project.desc}</p>
        </a>
      {/each}
    </div>
  </div>
</section>

<!-- STATS SECTION -->
<section class="py-16 bg-[#f9fafb]">
  <div class="section-container">
    <div class="text-center mb-12">
      <h2 class="text-2xl font-bold mb-2">Millions of tasks completed</h2>
      <p class="text-gray-600">Taskers have helped people accomplish millions of projects across a variety of categories.</p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
      {#each stats as stat}
        <div class="fade-in">
          <div class="text-3xl font-bold text-[#65d6ad] mb-2">{stat.value}</div>
          <div class="text-sm text-gray-600">{stat.label}</div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- MORE PROJECTS SECTION -->
<section class="py-16 bg-white">
  <div class="section-container">
    <h2 class="text-2xl font-bold mb-8">More Projects</h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each popularProjects.slice(4, 8) as project}
        <a href={project.link} class="block group">
          <div class="rounded-lg overflow-hidden mb-3">
            <img
              src={project.image}
              alt={project.alt}
              class="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <h3 class="font-bold text-lg mb-1">{project.title}</h3>
          <p class="text-gray-600">{project.desc}</p>
        </a>
      {/each}
    </div>
  </div>
</section>

<!-- TASKER SECTION -->
<section class="py-16 bg-[#f9fafb]">
  <div class="section-container">
    <div class="flex flex-col md:flex-row items-center gap-12">
      <div class="flex-1">
        <h2 class="text-3xl font-bold mb-4">Become a Tasker</h2>
        <p class="text-gray-600 mb-6">
          Set your own schedule, be your own boss, and earn money helping people in your community.
        </p>
        <a
          href="/register"
          class="inline-block px-8 py-3 bg-[#65d6ad] text-white font-semibold rounded-lg hover:bg-[#65d6ad]/90 transition-all duration-300"
        >
          Get started
        </a>
      </div>
      <div class="flex-1">
        <img
          src="https://images.ctfassets.net/vwt5n1ljn95x/4FZhCLsj7O8SZR3r8Fz8oa/e3c5a9b5a9d0e9d5ba5a5f9c9c1b1b1a/Tasker_Acquisition_Homepage_Refresh.png?w=800&q=75&fm=webp"
          alt="Become a Tasker"
          class="rounded-lg shadow-lg"
        />
      </div>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="bg-[#2d3138] text-white py-12">
  <div class="section-container">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <h3 class="text-lg font-bold mb-4">FAIT</h3>
        <p class="text-gray-300 text-sm mb-4">
          Book trusted help for home tasks. FAIT connects you with skilled professionals for furniture assembly, mounting, moving, cleaning, and more.
        </p>
        <div class="flex space-x-4">
          <a href="/social/facebook" class="text-gray-300 hover:text-white">
            <span class="sr-only">Facebook</span>
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
            </svg>
          </a>
          <a href="/social/instagram" class="text-gray-300 hover:text-white">
            <span class="sr-only">Instagram</span>
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd" />
            </svg>
          </a>
          <a href="/social/twitter" class="text-gray-300 hover:text-white">
            <span class="sr-only">Twitter</span>
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </a>
        </div>
      </div>

      <div>
        <h3 class="text-lg font-bold mb-4">Popular Categories</h3>
        <ul class="space-y-2">
          <li><a href="/services/assembly" class="text-gray-300 hover:text-white text-sm">Furniture Assembly</a></li>
          <li><a href="/services/mounting" class="text-gray-300 hover:text-white text-sm">TV Mounting</a></li>
          <li><a href="/services/moving" class="text-gray-300 hover:text-white text-sm">Moving Help</a></li>
          <li><a href="/services/cleaning" class="text-gray-300 hover:text-white text-sm">Home Cleaning</a></li>
          <li><a href="/services/handyman" class="text-gray-300 hover:text-white text-sm">Handyman Services</a></li>
        </ul>
      </div>

      <div>
        <h3 class="text-lg font-bold mb-4">Company</h3>
        <ul class="space-y-2">
          <li><a href="/about" class="text-gray-300 hover:text-white text-sm">About Us</a></li>
          <li><a href="/careers" class="text-gray-300 hover:text-white text-sm">Careers</a></li>
          <li><a href="/blog" class="text-gray-300 hover:text-white text-sm">Blog</a></li>
          <li><a href="/press" class="text-gray-300 hover:text-white text-sm">Press</a></li>
          <li><a href="/contact" class="text-gray-300 hover:text-white text-sm">Contact Us</a></li>
        </ul>
      </div>

      <div>
        <h3 class="text-lg font-bold mb-4">Support</h3>
        <ul class="space-y-2">
          <li><a href="/help" class="text-gray-300 hover:text-white text-sm">Help Center</a></li>
          <li><a href="/faq" class="text-gray-300 hover:text-white text-sm">FAQs</a></li>
          <li><a href="/privacy" class="text-gray-300 hover:text-white text-sm">Privacy Policy</a></li>
          <li><a href="/terms" class="text-gray-300 hover:text-white text-sm">Terms of Service</a></li>
          <li><a href="/trust" class="text-gray-300 hover:text-white text-sm">Trust & Safety</a></li>
        </ul>
      </div>
    </div>

    <div class="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400 text-sm">
      <p>&copy; {new Date().getFullYear()} FAIT. All rights reserved.</p>
    </div>
  </div>
</footer>