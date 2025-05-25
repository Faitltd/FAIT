<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    let heroSection: HTMLElement;
    let scrollY = 0;
    let searchQuery = '';
    let searchLocation = '';

    onMount(() => {
        const handleScroll = () => {
            scrollY = window.scrollY;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    });

    // Handle search functionality
    function handleSearch() {
        if (!searchQuery.trim()) {
            // If no search query, go to services page
            goto('/services');
            return;
        }

        // Create URL with search parameters
        const params = new URLSearchParams();
        params.set('search', searchQuery.trim());
        if (searchLocation.trim()) {
            params.set('location', searchLocation.trim());
        }

        // Navigate to services page with search parameters
        goto(`/services?${params.toString()}`);
    }

    // Handle Enter key press
    function handleKeyPress(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            handleSearch();
        }
    }

    // Service categories data
    const serviceCategories = [
        {
            title: "Home Cleaning",
            description: "Professional house cleaning services",
            icon: "🏠",
            image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop&auto=format&q=80"
        },
        {
            title: "Handyman Services",
            description: "Repairs, installations, and maintenance",
            icon: "🔧",
            image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop&auto=format&q=80"
        },
        {
            title: "Gardening & Landscaping",
            description: "Lawn care and garden maintenance",
            icon: "🌱",
            image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&auto=format&q=80"
        },
        {
            title: "Moving Services",
            description: "Professional moving and packing",
            icon: "📦",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format&q=80"
        }
    ];

    const testimonials = [
        {
            name: "Sarah Johnson",
            service: "House Cleaning",
            rating: 5,
            text: "Amazing service! My house has never been cleaner. The team was professional and thorough."
        },
        {
            name: "Mike Chen",
            service: "Handyman",
            rating: 5,
            text: "Fixed my kitchen sink and installed new shelves. Great work and fair pricing."
        },
        {
            name: "Emily Rodriguez",
            service: "Gardening",
            rating: 5,
            text: "Transformed my backyard into a beautiful garden. Highly recommend!"
        }
    ];
</script>

<svelte:head>
    <title>FAIT - Professional Services Platform</title>
    <meta name="description" content="Connect with trusted local service providers for home cleaning, handyman services, gardening, and more." />
</svelte:head>

<svelte:window bind:scrollY />

<!-- Hero Section with Parallax -->
<section bind:this={heroSection} class="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
    <!-- Parallax Background -->
    <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style="background-image: url('https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1920&h=1080&fit=crop'); transform: translateY({scrollY * 0.5}px)"
    ></div>

    <!-- Hero Content -->
    <div class="relative z-10 text-center text-white px-8 sm:px-12 lg:px-6 max-w-4xl mx-auto">
        <h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Find Trusted Local
            <span class="text-yellow-400">Service Providers</span>
        </h1>
        <p class="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Connect with verified professionals in your community for home services, repairs, and more.
        </p>

        <!-- Search Bar -->
        <div class="bg-white rounded-lg p-2 shadow-2xl max-w-2xl mx-auto mb-6">
            <div class="flex flex-col md:flex-row gap-2">
                <input
                    type="text"
                    placeholder="What service do you need?"
                    bind:value={searchQuery}
                    on:keypress={handleKeyPress}
                    class="flex-1 px-4 py-3 text-gray-900 rounded-md border-0 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                    type="text"
                    placeholder="Enter your location"
                    bind:value={searchLocation}
                    on:keypress={handleKeyPress}
                    class="flex-1 px-4 py-3 text-gray-900 rounded-md border-0 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                    on:click={handleSearch}
                    class="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold"
                >
                    Search
                </button>
            </div>
        </div>

        <!-- Quick Search Suggestions -->
        <div class="flex flex-wrap justify-center gap-2 mb-8 max-w-2xl mx-auto">
            <span class="text-blue-100 text-sm mr-2">Popular:</span>
            {#each ['House Cleaning', 'Handyman', 'Plumbing', 'Lawn Care'] as suggestion}
                <button
                    class="text-sm bg-white/20 text-white px-3 py-1 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
                    on:click={() => {searchQuery = suggestion; handleSearch();}}
                >
                    {suggestion}
                </button>
            {/each}
        </div>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/services" class="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors shadow-lg">
                Find Services
            </a>
            <a href="/signup" class="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-900 transition-colors">
                Become a Provider
            </a>
        </div>
    </div>

    <!-- Scroll Indicator -->
    <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
    </div>
</section>

<!-- Service Categories Section -->
<section class="py-20 bg-white">
    <div class="container mx-auto px-8 sm:px-12 lg:px-6">
        <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-900 mb-4">Popular Services</h2>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover the most requested services in your area
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {#each serviceCategories as category}
                <a
                    href="/services?search={encodeURIComponent(category.title)}"
                    class="group cursor-pointer block"
                >
                    <div class="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                        <img
                            src={category.image}
                            alt={category.title}
                            class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <div class="text-3xl mb-2">{category.icon}</div>
                            <h3 class="text-xl font-bold mb-2">{category.title}</h3>
                            <p class="text-sm text-gray-200">{category.description}</p>
                        </div>
                    </div>
                </a>
            {/each}
        </div>
    </div>
</section>

<!-- How It Works Section -->
<section class="py-20 bg-gray-50">
    <div class="container mx-auto px-8 sm:px-12 lg:px-6">
        <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-900 mb-4">How FAIT Works</h2>
            <p class="text-xl text-gray-600">Simple steps to get the help you need</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center">
                <div class="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
                <h3 class="text-xl font-bold text-gray-900 mb-4">Describe Your Need</h3>
                <p class="text-gray-600">Tell us what service you need and where you're located</p>
            </div>
            <div class="text-center">
                <div class="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
                <h3 class="text-xl font-bold text-gray-900 mb-4">Get Matched</h3>
                <p class="text-gray-600">We connect you with verified local professionals</p>
            </div>
            <div class="text-center">
                <div class="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
                <h3 class="text-xl font-bold text-gray-900 mb-4">Book & Relax</h3>
                <p class="text-gray-600">Schedule your service and enjoy peace of mind</p>
            </div>
        </div>
    </div>
</section>

<!-- Testimonials Section -->
<section class="py-20 bg-white">
    <div class="container mx-auto px-8 sm:px-12 lg:px-6">
        <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p class="text-xl text-gray-600">Real reviews from real customers</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            {#each testimonials as testimonial}
                <div class="bg-gray-50 rounded-xl p-8 shadow-lg">
                    <div class="flex items-center mb-4">
                        {#each Array(testimonial.rating) as _}
                            <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                        {/each}
                    </div>
                    <p class="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                    <div>
                        <p class="font-bold text-gray-900">{testimonial.name}</p>
                        <p class="text-sm text-gray-600">{testimonial.service}</p>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</section>

<!-- Call to Action Section -->
<section class="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
    <div class="container mx-auto px-8 sm:px-12 lg:px-6 text-center">
        <h2 class="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
        <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust FAIT for their service needs
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/services" class="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors shadow-lg">
                Find Services Now
            </a>
            <a href="/signup" class="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-900 transition-colors">
                Become a Provider
            </a>
        </div>
    </div>
</section>
