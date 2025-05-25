<script lang="ts">
  import { onMount } from 'svelte';
  import SlideSection from '$lib/components/SlideSection.svelte';
  import HoverCard from '$lib/components/HoverCard.svelte';
  import Carousel from '$lib/components/Carousel.svelte';
  import AnimatedBackground from '$lib/components/AnimatedBackground.svelte';
  import TabGroup from '$lib/components/TabGroup.svelte';
  import ScrollProgress from '$lib/components/ScrollProgress.svelte';

  // Features for the homepage
  const features = [
    {
      title: 'Find Service Agents',
      description: 'Connect with qualified professionals for your home projects',
      icon: '🔍',
      href: '/services'
    },
    {
      title: 'Book Services',
      description: 'Schedule appointments with verified service providers',
      icon: '📅',
      href: '/services/book'
    },
    {
      title: 'Track Progress',
      description: 'Monitor your projects from start to finish',
      icon: '📊',
      href: '/dashboard'
    }
  ];

  // Categories for the homepage
  const categories = [
    { label: 'Assembly', href: '/services/assembly', icon: '🔧' },
    { label: 'Mounting', href: '/services/mounting', icon: '🖼️' },
    { label: 'Moving', href: '/services/moving', icon: '📦' },
    { label: 'Cleaning', href: '/services/cleaning', icon: '✨' },
    { label: 'Outdoor Help', href: '/services/outdoor', icon: '🌱' },
    { label: 'Home Repairs', href: '/services/repairs', icon: '🔨' },
    { label: 'Painting', href: '/services/painting', icon: '🎨' },
    { label: 'Handyman', href: '/services/handyman', icon: '🛠️' }
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'John D.',
      location: 'New York, NY',
      text: 'The service was excellent! The provider arrived on time and completed the furniture assembly quickly and professionally.',
      rating: 5,
      avatar: 'J'
    },
    {
      name: 'Sarah M.',
      location: 'Chicago, IL',
      text: 'I needed help with moving some furniture and the service provider was amazing. Very careful with my belongings and super efficient.',
      rating: 5,
      avatar: 'S'
    },
    {
      name: 'Robert K.',
      location: 'Los Angeles, CA',
      text: 'The TV mounting service was perfect. The provider helped me choose the best spot and made sure everything was level and secure.',
      rating: 5,
      avatar: 'R'
    }
  ];

  // App features tabs
  const appFeatureTabs = [
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'book', label: 'Book', icon: '📅' },
    { id: 'track', label: 'Track', icon: '📊' }
  ];
  let activeFeatureTab = 'search';

  // Sections for scroll progress
  const sections = [
    { id: 'hero', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'services', label: 'Services' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'cta', label: 'Get Started' }
  ];

  // Initialize animations
  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });

    return () => {
      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.unobserve(el);
      });
    };
  });
</script>

<svelte:head>
  <title>FAIT - Book trusted help for home services</title>
  <meta name="description" content="FAIT connects you with skilled professionals for furniture assembly, mounting, moving, cleaning, and more." />
</svelte:head>

<!-- Scroll Progress Indicator -->
<ScrollProgress {sections} position="right" showLabels={true} />

<!-- HERO SECTION -->
<section id="hero" class="relative min-h-[90vh] flex items-center">
  <AnimatedBackground type="gradient" />

  <div class="container-xl relative z-10">
    <div class="flex flex-col md:flex-row items-center gap-8">
      <div class="md:w-1/2">
        <motion:div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div class="inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-600 text-xs font-medium mb-4">
            FAIT CO-OP PLATFORM
          </div>
          <h1 class="text-4xl sm:text-5xl font-bold text-gray-800 mb-4 leading-tight">
            Fantastic Search for Home Tasks, Jobs, and Projects
          </h1>
          <p class="text-gray-600 mb-6 text-lg">
            Connect with trusted service agents for all your home improvement needs. Book, track, and pay for services all in one place.
          </p>

          <div class="flex flex-wrap gap-3 mb-6">
            <a
              href="/services"
              class="btn btn-primary hover-scale"
            >
              Get Started
            </a>
            <a
              href="/learn-more"
              class="btn btn-secondary hover-scale"
            >
              Learn More
            </a>
          </div>
        </motion:div>
      </div>

      <div class="md:w-1/2">
        <motion:div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          class="relative"
        >
          <div class="bg-white rounded-xl shadow-lg p-4 mb-4 ml-auto max-w-xs">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                <span class="text-sm">1</span>
              </div>
              <span class="font-medium text-gray-800">Search</span>
            </div>
            <div class="flex items-center gap-3 mb-2">
              <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                <span class="text-sm">2</span>
              </div>
              <span class="font-medium text-gray-800">Book</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                <span class="text-sm">3</span>
              </div>
              <span class="font-medium text-gray-800">Done</span>
            </div>
          </div>

          <img
            src="https://images.unsplash.com/photo-1586473219010-2ffc57b0d282?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
            alt="Mobile app interface"
            class="rounded-xl shadow-lg max-w-xs mx-auto"
            loading="lazy"
          />
        </motion:div>
      </div>
    </div>
  </div>
</section>

<!-- FEATURES SECTION -->
<SlideSection id="features" className="section bg-white" direction="left">
  <div class="container-xl">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold text-gray-800 mb-3">Find Service Agents for Home Tasks</h2>
      <p class="text-gray-600 max-w-2xl mx-auto">Connect with qualified professionals for all your home improvement needs</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each features as feature}
        <HoverCard scale={true} lift={true} shadow={true} color={true}>
          <div class="text-3xl mb-4">{feature.icon}</div>
          <h3 class="text-lg font-semibold mb-2 text-gray-800">{feature.title}</h3>
          <p class="text-gray-600 text-sm">{feature.description}</p>
          <a href={feature.href} class="mt-4 inline-block text-primary-600 text-sm font-medium hover:text-primary-700">Learn more →</a>
        </HoverCard>
      {/each}
    </div>
  </div>
</SlideSection>

<!-- SERVICES GRID SECTION -->
<SlideSection id="services" className="section bg-gray-50" direction="right" delay={0.2}>
  <div class="container-xl">
    <div class="text-center mb-10">
      <h2 class="text-3xl font-bold text-gray-800 mb-3">Our Services</h2>
      <p class="text-gray-600 max-w-2xl mx-auto">Browse our most popular service categories</p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      {#each categories as cat}
        <a
          href={cat.href}
          class="bg-white rounded-xl p-4 text-center hover:shadow-md transition-all duration-150 hover:-translate-y-1"
        >
          <div class="text-3xl mb-2">{cat.icon}</div>
          <h3 class="font-medium text-gray-800">{cat.label}</h3>
        </a>
      {/each}
    </div>
  </div>
</SlideSection>

<!-- HOW IT WORKS SECTION -->
<SlideSection id="how-it-works" className="section bg-white" direction="left" delay={0.3}>
  <div class="container-xl">
    <div class="text-center mb-10">
      <h2 class="text-3xl font-bold text-gray-800 mb-3">How It Works</h2>
      <p class="text-gray-600 max-w-2xl mx-auto">Our platform makes it easy to find and book services</p>
    </div>

    <div class="max-w-3xl mx-auto">
      <TabGroup tabs={appFeatureTabs} bind:activeTab={activeFeatureTab} variant="pills" />

      {#if activeFeatureTab === 'search'}
        <div class="bg-gray-50 rounded-xl p-6 shadow-sm">
          <div class="flex flex-col md:flex-row gap-6 items-center">
            <div class="md:w-1/2">
              <h3 class="text-xl font-bold text-gray-800 mb-3">Find the Perfect Service Provider</h3>
              <p class="text-gray-600 mb-4">Search for services by category, location, or specific needs. Browse profiles, reviews, and ratings to find the right professional for your job.</p>
              <ul class="space-y-2">
                <li class="flex items-center text-gray-600">
                  <svg class="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Filter by service type</span>
                </li>
                <li class="flex items-center text-gray-600">
                  <svg class="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Read verified reviews</span>
                </li>
                <li class="flex items-center text-gray-600">
                  <svg class="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Compare prices</span>
                </li>
              </ul>
            </div>
            <div class="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Search for services"
                class="rounded-lg shadow-md"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      {:else if activeFeatureTab === 'book'}
        <div class="bg-gray-50 rounded-xl p-6 shadow-sm">
          <div class="flex flex-col md:flex-row gap-6 items-center">
            <div class="md:w-1/2">
              <h3 class="text-xl font-bold text-gray-800 mb-3">Book with Confidence</h3>
              <p class="text-gray-600 mb-4">Schedule appointments at your convenience. Our secure booking system makes it easy to find available times and confirm your service.</p>
              <ul class="space-y-2">
                <li class="flex items-center text-gray-600">
                  <svg class="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Choose your preferred time</span>
                </li>
                <li class="flex items-center text-gray-600">
                  <svg class="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Secure payment processing</span>
                </li>
                <li class="flex items-center text-gray-600">
                  <svg class="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Instant confirmation</span>
                </li>
              </ul>
            </div>
            <div class="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Book services"
                class="rounded-lg shadow-md"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      {:else if activeFeatureTab === 'track'}
        <div class="bg-gray-50 rounded-xl p-6 shadow-sm">
          <div class="flex flex-col md:flex-row gap-6 items-center">
            <div class="md:w-1/2">
              <h3 class="text-xl font-bold text-gray-800 mb-3">Track Your Service</h3>
              <p class="text-gray-600 mb-4">Stay updated on your service status. Get notifications when your provider is on the way and when the job is complete.</p>
              <ul class="space-y-2">
                <li class="flex items-center text-gray-600">
                  <svg class="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Real-time updates</span>
                </li>
                <li class="flex items-center text-gray-600">
                  <svg class="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Provider location tracking</span>
                </li>
                <li class="flex items-center text-gray-600">
                  <svg class="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Service completion confirmation</span>
                </li>
              </ul>
            </div>
            <div class="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Track services"
                class="rounded-lg shadow-md"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</SlideSection>

<!-- TESTIMONIALS SECTION -->
<SlideSection id="testimonials" className="section bg-gray-50" direction="right" delay={0.4}>
  <div class="container-xl">
    <div class="text-center mb-10">
      <h2 class="text-3xl font-bold text-gray-800 mb-3">What People Are Saying</h2>
      <p class="text-gray-600 max-w-2xl mx-auto">Hear from our satisfied customers</p>
    </div>

    <Carousel autoplay={true} interval={5000}>
      {#each testimonials as testimonial}
        <div class="carousel-item px-4">
          <div class="bg-white rounded-xl p-6 shadow-sm max-w-3xl mx-auto">
            <div class="flex items-center mb-4">
              <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                <span class="font-medium">{testimonial.avatar}</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800">{testimonial.name}</h3>
                <p class="text-gray-500 text-xs">{testimonial.location}</p>
              </div>
            </div>
            <p class="text-gray-600 text-lg italic mb-4">"{testimonial.text}"</p>
            <div class="flex text-yellow-400 text-sm">
              {'★'.repeat(testimonial.rating)}
            </div>
          </div>
        </div>
      {/each}
    </Carousel>
  </div>
</SlideSection>

<!-- CTA SECTION -->
<SlideSection id="cta" className="section bg-primary-600" direction="up" delay={0.5}>
  <div class="container-xl">
    <div class="text-center">
      <h2 class="text-3xl font-bold text-white mb-4">Ready To Get Started?</h2>
      <p class="text-primary-100 mb-8 max-w-2xl mx-auto">Join thousands of satisfied customers who have found reliable service providers through our platform</p>
      <div class="flex flex-wrap justify-center gap-4">
        <a
          href="/services"
          class="px-6 py-3 rounded-lg bg-white text-primary-600 font-medium shadow-sm hover:bg-gray-100 transition-all duration-150 hover:scale-105"
        >
          Find Services
        </a>
        <a
          href="/register"
          class="px-6 py-3 rounded-lg border border-white text-white font-medium hover:bg-primary-700 transition-all duration-150 hover:scale-105"
        >
          Sign Up
        </a>
      </div>
    </div>
  </div>
</SlideSection>