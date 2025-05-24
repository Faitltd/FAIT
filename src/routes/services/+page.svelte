<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import LoginSignupModal from '$lib/components/auth/LoginSignupModal.svelte';

	let searchQuery = '';
	let selectedCategory = 'all';
	let selectedLocation = '';
	let hasSearched = false;
	let showLoginModal = false;
	let pendingServiceId: number | null = null;

	const categories = [
		{ id: 'all', name: 'All Services', icon: '🔍' },
		{ id: 'home', name: 'Home & Garden', icon: '🏠' },
		{ id: 'cleaning', name: 'Cleaning', icon: '🧹' },
		{ id: 'repair', name: 'Repair & Maintenance', icon: '🔧' },
		{ id: 'design', name: 'Design & Renovation', icon: '🎨' }
	];

	const services = [
		// Home Cleaning Services
		{
			id: 1,
			title: 'House Cleaning',
			category: 'cleaning',
			price: '$80-150',
			rating: 4.9,
			reviews: 234,
			image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
			description: 'Professional deep cleaning for your entire home including kitchens, bathrooms, bedrooms, and living areas'
		},
		{
			id: 2,
			title: 'Office Cleaning',
			category: 'cleaning',
			price: '$100-200',
			rating: 4.8,
			reviews: 156,
			image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
			description: 'Commercial office cleaning services including desks, floors, restrooms, and common areas'
		},

		// Handyman Services (from calculator)
		{
			id: 3,
			title: 'Hang Pictures/Artwork',
			category: 'repair',
			price: '$75',
			rating: 4.8,
			reviews: 189,
			image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
			description: 'Professional picture and artwork hanging service for up to 5 items. Includes proper wall anchors and leveling'
		},
		{
			id: 4,
			title: 'TV Wall Mounting',
			category: 'repair',
			price: '$150',
			rating: 4.9,
			reviews: 267,
			image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop',
			description: 'Safe and secure TV wall mounting with cable management. Includes mounting bracket and all hardware'
		},
		{
			id: 5,
			title: 'Shelf Installation',
			category: 'repair',
			price: '$100',
			rating: 4.7,
			reviews: 145,
			image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
			description: 'Custom shelf installation and mounting. Perfect for books, decor, or storage solutions'
		},
		{
			id: 6,
			title: 'Leaky Faucet Repair',
			category: 'repair',
			price: '$125',
			rating: 4.8,
			reviews: 198,
			image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop',
			description: 'Professional faucet repair service. Fix drips, replace washers, and restore proper water flow'
		},
		{
			id: 7,
			title: 'Light Fixture Installation',
			category: 'repair',
			price: '$175',
			rating: 4.8,
			reviews: 134,
			image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400&h=300&fit=crop',
			description: 'Electrical light fixture installation including ceiling lights, chandeliers, and pendant lights'
		},
		{
			id: 8,
			title: 'Ceiling Fan Installation',
			category: 'repair',
			price: '$200',
			rating: 4.9,
			reviews: 167,
			image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
			description: 'Professional ceiling fan installation with proper electrical connections and balancing'
		},
		{
			id: 9,
			title: 'Drywall Hole Patching',
			category: 'repair',
			price: '$80',
			rating: 4.6,
			reviews: 156,
			image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop',
			description: 'Professional drywall repair and patching service. Includes sanding, priming, and touch-up paint'
		},
		{
			id: 10,
			title: 'Bathroom/Kitchen Caulking',
			category: 'repair',
			price: '$120',
			rating: 4.7,
			reviews: 189,
			image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop',
			description: 'Professional caulking service for bathrooms and kitchens. Prevents water damage and improves appearance'
		},
		{
			id: 11,
			title: 'Door Hardware Installation',
			category: 'repair',
			price: '$60',
			rating: 4.8,
			reviews: 145,
			image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
			description: 'Install door knobs, handles, locks, and hinges. Includes proper alignment and adjustment'
		},
		{
			id: 12,
			title: 'Electrical Outlet Replacement',
			category: 'repair',
			price: '$90',
			rating: 4.9,
			reviews: 178,
			image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
			description: 'Replace old or damaged electrical outlets. Includes GFCI outlets for bathrooms and kitchens'
		},
		{
			id: 13,
			title: 'Window Blinds Installation',
			category: 'repair',
			price: '$85',
			rating: 4.7,
			reviews: 134,
			image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
			description: 'Professional window blinds and shade installation. Includes measuring and mounting hardware'
		},
		{
			id: 14,
			title: 'Squeaky Door Repair',
			category: 'repair',
			price: '$45',
			rating: 4.6,
			reviews: 167,
			image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
			description: 'Fix squeaky doors and hinges. Includes lubrication and hinge adjustment or replacement'
		},
		{
			id: 15,
			title: 'Grab Bar Installation',
			category: 'repair',
			price: '$110',
			rating: 4.8,
			reviews: 145,
			image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop',
			description: 'Safety grab bar installation for bathrooms and stairways. Includes proper wall anchoring'
		},
		{
			id: 16,
			title: 'Toilet Seat Replacement',
			category: 'repair',
			price: '$65',
			rating: 4.7,
			reviews: 123,
			image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop',
			description: 'Replace old or broken toilet seats. Includes proper fitting and adjustment'
		},
		{
			id: 17,
			title: 'Smoke Detector Installation',
			category: 'repair',
			price: '$95',
			rating: 4.9,
			reviews: 189,
			image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
			description: 'Install smoke detectors and carbon monoxide detectors. Includes battery installation and testing'
		},
		{
			id: 18,
			title: 'Weather Stripping Installation',
			category: 'repair',
			price: '$70',
			rating: 4.6,
			reviews: 134,
			image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
			description: 'Install weather stripping around doors and windows to improve energy efficiency'
		},
		{
			id: 19,
			title: 'Touch-up Painting',
			category: 'repair',
			price: '$100',
			rating: 4.7,
			reviews: 167,
			image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=300&fit=crop',
			description: 'Professional touch-up painting service for walls, trim, and small areas'
		},
		{
			id: 20,
			title: 'Hook and Towel Bar Installation',
			category: 'repair',
			price: '$55',
			rating: 4.8,
			reviews: 145,
			image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop',
			description: 'Install hooks, towel bars, and bathroom accessories. Up to 3 items included'
		},

		// Remodeling Services (from remodeling calculator)
		{
			id: 21,
			title: 'Kitchen Remodel',
			category: 'design',
			price: '$15,000-45,000',
			rating: 4.9,
			reviews: 89,
			image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
			description: 'Complete kitchen remodeling including cabinets, countertops, appliances, and flooring. Custom design and professional installation'
		},
		{
			id: 22,
			title: 'Bathroom Remodel',
			category: 'design',
			price: '$10,000-30,000',
			rating: 4.8,
			reviews: 67,
			image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&h=300&fit=crop',
			description: 'Full bathroom renovation including tile work, fixtures, vanity, and plumbing. Modern design and quality materials'
		},
		{
			id: 23,
			title: 'Living Room Renovation',
			category: 'design',
			price: '$8,000-20,000',
			rating: 4.7,
			reviews: 45,
			image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
			description: 'Living room makeover including flooring, paint, lighting, and built-in features. Transform your space'
		},
		{
			id: 24,
			title: 'Bedroom Renovation',
			category: 'design',
			price: '$5,000-15,000',
			rating: 4.6,
			reviews: 34,
			image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
			description: 'Bedroom renovation including flooring, paint, closet organization, and lighting upgrades'
		},
		{
			id: 25,
			title: 'Basement Finishing',
			category: 'design',
			price: '$12,000-25,000',
			rating: 4.8,
			reviews: 56,
			image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
			description: 'Complete basement finishing including framing, drywall, flooring, and electrical work'
		},
		{
			id: 26,
			title: 'Attic Conversion',
			category: 'design',
			price: '$10,000-22,000',
			rating: 4.7,
			reviews: 23,
			image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
			description: 'Convert your attic into usable living space. Includes insulation, flooring, and electrical work'
		},

		// Appliance Installation (from remodeling calculator)
		{
			id: 27,
			title: 'Appliance Installation',
			category: 'repair',
			price: '$150-400',
			rating: 4.8,
			reviews: 178,
			image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
			description: 'Professional appliance installation including dishwashers, ovens, refrigerators, and washers/dryers'
		},

		// Flooring Services (from remodeling calculator)
		{
			id: 28,
			title: 'Hardwood Flooring Installation',
			category: 'home',
			price: '$8-15/sq ft',
			rating: 4.9,
			reviews: 234,
			image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
			description: 'Premium hardwood flooring installation. Includes materials, installation, and finishing'
		},
		{
			id: 29,
			title: 'Tile Flooring Installation',
			category: 'home',
			price: '$10-20/sq ft',
			rating: 4.8,
			reviews: 189,
			image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&h=300&fit=crop',
			description: 'Ceramic, porcelain, and natural stone tile installation. Perfect for kitchens and bathrooms'
		},
		{
			id: 30,
			title: 'Carpet Installation',
			category: 'home',
			price: '$3-8/sq ft',
			rating: 4.6,
			reviews: 156,
			image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
			description: 'Professional carpet installation with padding and trim. Wide selection of styles and colors'
		},
		{
			id: 31,
			title: 'Laminate Flooring Installation',
			category: 'home',
			price: '$5-12/sq ft',
			rating: 4.7,
			reviews: 167,
			image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
			description: 'Durable laminate flooring installation. Looks like hardwood at a fraction of the cost'
		},

		// Plumbing Services (from remodeling calculator)
		{
			id: 32,
			title: 'Plumbing Updates',
			category: 'repair',
			price: '$2,500-5,000',
			rating: 4.8,
			reviews: 145,
			image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop',
			description: 'Complete plumbing updates including new pipes, fixtures, and water heater installation'
		},
		{
			id: 33,
			title: 'Toilet Installation',
			category: 'repair',
			price: '$200-400',
			rating: 4.7,
			reviews: 234,
			image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop',
			description: 'Professional toilet installation and removal. Includes all necessary plumbing connections'
		},
		{
			id: 34,
			title: 'Sink Installation',
			category: 'repair',
			price: '$250-500',
			rating: 4.8,
			reviews: 189,
			image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop',
			description: 'Kitchen and bathroom sink installation with faucet and plumbing connections'
		},

		// Electrical Services (from remodeling calculator)
		{
			id: 35,
			title: 'Electrical Updates',
			category: 'repair',
			price: '$1,500-4,000',
			rating: 4.9,
			reviews: 123,
			image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
			description: 'Electrical system updates including new wiring, outlets, switches, and panel upgrades'
		},
		{
			id: 36,
			title: 'Electrical Panel Upgrade',
			category: 'repair',
			price: '$1,200-2,500',
			rating: 4.8,
			reviews: 89,
			image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
			description: 'Upgrade your electrical panel to handle modern electrical demands safely'
		},

		// Painting Services (from remodeling calculator)
		{
			id: 37,
			title: 'Interior Painting',
			category: 'design',
			price: '$3-8/sq ft',
			rating: 4.7,
			reviews: 345,
			image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=300&fit=crop',
			description: 'Professional interior painting service. Includes prep work, primer, and two coats of premium paint'
		},
		{
			id: 38,
			title: 'Exterior Painting',
			category: 'design',
			price: '$4-10/sq ft',
			rating: 4.8,
			reviews: 267,
			image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=300&fit=crop',
			description: 'Exterior house painting with weather-resistant paint. Includes pressure washing and prep work'
		},

		// Lawn Care & Landscaping Services (from estimate calculator)
		{
			id: 39,
			title: 'Lawn Mowing',
			category: 'home',
			price: '$40-80',
			rating: 4.7,
			reviews: 456,
			image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
			description: 'Regular lawn mowing service including edging and cleanup. Weekly, bi-weekly, or monthly options'
		},
		{
			id: 40,
			title: 'Garden Maintenance',
			category: 'home',
			price: '$60-120',
			rating: 4.8,
			reviews: 234,
			image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
			description: 'Complete garden maintenance including weeding, pruning, fertilizing, and seasonal cleanup'
		},
		{
			id: 41,
			title: 'Landscaping Design',
			category: 'home',
			price: '$2,000-8,000',
			rating: 4.9,
			reviews: 89,
			image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
			description: 'Professional landscaping design and installation. Transform your outdoor space'
		},
		{
			id: 42,
			title: 'Tree Trimming',
			category: 'home',
			price: '$200-800',
			rating: 4.6,
			reviews: 167,
			image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
			description: 'Professional tree trimming and pruning. Improve tree health and safety'
		},

		// HVAC Services (from estimate calculator)
		{
			id: 43,
			title: 'HVAC Installation',
			category: 'repair',
			price: '$3,000-12,000',
			rating: 4.8,
			reviews: 145,
			image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
			description: 'Complete HVAC system installation including heating, ventilation, and air conditioning'
		},
		{
			id: 44,
			title: 'Air Conditioning Repair',
			category: 'repair',
			price: '$150-500',
			rating: 4.7,
			reviews: 234,
			image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
			description: 'AC repair and maintenance service. Keep your home cool and comfortable'
		},
		{
			id: 45,
			title: 'Heating System Repair',
			category: 'repair',
			price: '$200-600',
			rating: 4.8,
			reviews: 189,
			image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
			description: 'Heating system repair and maintenance. Furnace, boiler, and heat pump services'
		},

		// Roofing Services (from estimate calculator)
		{
			id: 46,
			title: 'Roof Repair',
			category: 'repair',
			price: '$300-1,500',
			rating: 4.7,
			reviews: 178,
			image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
			description: 'Professional roof repair service. Fix leaks, replace shingles, and restore roof integrity'
		},
		{
			id: 47,
			title: 'Roof Replacement',
			category: 'repair',
			price: '$8,000-20,000',
			rating: 4.8,
			reviews: 89,
			image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
			description: 'Complete roof replacement with quality materials. Protect your home for decades'
		},
		{
			id: 48,
			title: 'Gutter Installation',
			category: 'repair',
			price: '$800-2,000',
			rating: 4.6,
			reviews: 134,
			image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
			description: 'Gutter installation and repair. Protect your foundation with proper drainage'
		},

		// Furniture Assembly Services (from handyman calculator)
		{
			id: 49,
			title: 'Furniture Assembly',
			category: 'repair',
			price: '$80-200',
			rating: 4.7,
			reviews: 345,
			image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
			description: 'Professional furniture assembly service. IKEA, Wayfair, and all major brands'
		},
		{
			id: 50,
			title: 'IKEA Assembly',
			category: 'repair',
			price: '$100-250',
			rating: 4.8,
			reviews: 267,
			image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
			description: 'Expert IKEA furniture assembly. Fast, reliable, and stress-free assembly service'
		},

		// Additional Services
		{
			id: 51,
			title: 'Pressure Washing',
			category: 'cleaning',
			price: '$150-400',
			rating: 4.6,
			reviews: 189,
			image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
			description: 'Pressure washing for driveways, decks, siding, and outdoor surfaces'
		},
		{
			id: 52,
			title: 'Window Cleaning',
			category: 'cleaning',
			price: '$100-250',
			rating: 4.7,
			reviews: 234,
			image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
			description: 'Professional window cleaning service for interior and exterior windows'
		},
		{
			id: 53,
			title: 'Carpet Cleaning',
			category: 'cleaning',
			price: '$120-300',
			rating: 4.8,
			reviews: 178,
			image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
			description: 'Deep carpet cleaning service. Remove stains, odors, and allergens'
		},
		{
			id: 54,
			title: 'Move-in/Move-out Cleaning',
			category: 'cleaning',
			price: '$200-500',
			rating: 4.9,
			reviews: 156,
			image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
			description: 'Comprehensive move-in or move-out cleaning service. Leave your space spotless'
		}
	];

	let filteredServices = services;

	// Get handyman services for fallback
	const handymanServices = services.filter(service =>
		service.title.toLowerCase().includes('handyman') ||
		service.category === 'repair' ||
		service.title.toLowerCase().includes('assembly') ||
		service.title.toLowerCase().includes('mounting') ||
		service.title.toLowerCase().includes('installation') ||
		service.title.toLowerCase().includes('repair')
	);

	function filterServices() {
		const query = searchQuery.toLowerCase().trim();

		// Handle special search categories
		const handymanKeywords = ['handyman', 'handy man', 'repair', 'fix', 'install', 'mount', 'hang', 'assembly', 'maintenance'];
		const cleaningKeywords = ['clean', 'cleaning', 'house cleaning', 'office cleaning', 'maid'];
		const lawnKeywords = ['lawn', 'grass', 'mowing', 'yard', 'garden', 'landscaping'];
		const plumbingKeywords = ['plumb', 'plumbing', 'faucet', 'toilet', 'sink', 'pipe'];
		const electricalKeywords = ['electric', 'electrical', 'wiring', 'outlet', 'light', 'fixture'];
		const paintingKeywords = ['paint', 'painting', 'interior paint', 'exterior paint'];

		const isHandymanSearch = handymanKeywords.some(keyword => query.includes(keyword));
		const isCleaningSearch = cleaningKeywords.some(keyword => query.includes(keyword));
		const isLawnSearch = lawnKeywords.some(keyword => query.includes(keyword));
		const isPlumbingSearch = plumbingKeywords.some(keyword => query.includes(keyword));
		const isElectricalSearch = electricalKeywords.some(keyword => query.includes(keyword));
		const isPaintingSearch = paintingKeywords.some(keyword => query.includes(keyword));

		let results = services.filter(service => {
			// Basic text matching
			const matchesSearch = service.title.toLowerCase().includes(query) ||
								service.description.toLowerCase().includes(query);

			// Category matching
			const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;

			// Smart category search logic
			if (isHandymanSearch && service.category === 'repair') {
				return matchesCategory;
			}
			if (isCleaningSearch && service.category === 'cleaning') {
				return matchesCategory;
			}
			if (isLawnSearch && service.category === 'home') {
				return matchesCategory;
			}
			if (isPlumbingSearch && (service.title.toLowerCase().includes('plumb') || service.title.toLowerCase().includes('faucet') || service.title.toLowerCase().includes('toilet') || service.title.toLowerCase().includes('sink'))) {
				return matchesCategory;
			}
			if (isElectricalSearch && (service.title.toLowerCase().includes('electric') || service.title.toLowerCase().includes('light') || service.title.toLowerCase().includes('outlet'))) {
				return matchesCategory;
			}
			if (isPaintingSearch && service.title.toLowerCase().includes('paint')) {
				return matchesCategory;
			}

			return matchesSearch && matchesCategory;
		});

		// If no results found and there was a search query, default to handyman services
		if (results.length === 0 && query && selectedCategory === 'all') {
			results = handymanServices;
		}

		filteredServices = results;
	}

	onMount(() => {
		// Handle URL search parameters
		const urlParams = new URLSearchParams(window.location.search);
		const searchParam = urlParams.get('search');
		const locationParam = urlParams.get('location');

		if (searchParam) {
			searchQuery = searchParam;
			hasSearched = true;
		}
		if (locationParam) {
			selectedLocation = locationParam;
		}

		// Animate elements on scroll
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('show');
				}
			});
		}, { threshold: 0.1 });

		document.querySelectorAll('.animate-on-scroll').forEach((el) => {
			observer.observe(el);
		});

		return () => observer.disconnect();
	});

	function handleServiceClick(serviceId: number) {
		console.log('Service clicked:', serviceId);
		console.log('Auth state:', $auth);
		console.log('Is authenticated:', $auth.isAuthenticated);

		// Check if user is authenticated
		if (!$auth.isAuthenticated) {
			console.log('User not authenticated, showing modal');
			pendingServiceId = serviceId;
			showLoginModal = true;
			return;
		}

		console.log('User authenticated, proceeding to booking');
		// User is authenticated, proceed to booking
		goto(`/book/${serviceId}`);
	}

	function handleLoginSuccess() {
		showLoginModal = false;
		// If there's a pending service, navigate to it
		if (pendingServiceId) {
			goto(`/book/${pendingServiceId}`);
			pendingServiceId = null;
		}
	}

	function handleLoginClose() {
		showLoginModal = false;
		pendingServiceId = null;
	}

	$: {
		searchQuery, selectedCategory;
		filterServices();
	}
</script>

<svelte:head>
	<title>Services - FAIT Professional Services Platform</title>
	<meta name="description" content="Browse our extensive directory of professional services. Find trusted experts for home improvement, cleaning, design, business services, and more." />
</svelte:head>

<!-- Hero Section -->
<section class="py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
	<div class="container mx-auto px-6 sm:px-8 lg:px-4">
		<div class="text-center mb-8">
			<h1 class="text-5xl font-bold text-gray-900 mb-6">Find Professional Services</h1>
			<p class="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
				Browse our extensive directory of verified professionals ready to help with your next project.
			</p>

			<!-- Enhanced Search Bar -->
			<div class="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div class="relative">
						<svg class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
						</svg>
						<input
							type="text"
							placeholder="What service do you need?"
							bind:value={searchQuery}
							class="w-full pl-10 pr-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
						/>
					</div>
					<div class="relative">
						<svg class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
						</svg>
						<input
							type="text"
							placeholder="Enter your location"
							bind:value={selectedLocation}
							class="w-full pl-10 pr-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
						/>
					</div>
					<button class="bg-blue-600 text-white text-lg px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg">
						Search Services
					</button>
				</div>

				<!-- Quick Filters -->
				<div class="mt-6 flex flex-wrap gap-2 justify-center">
					<span class="text-sm text-gray-600 mr-2">Popular:</span>
					{#each ['House Cleaning', 'Plumbing', 'Lawn Care', 'Tutoring'] as quickFilter}
						<button
							class="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
							on:click={() => searchQuery = quickFilter}
						>
							{quickFilter}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Services Grid -->
<section class="py-8 bg-gray-50">
	<div class="container mx-auto px-6 sm:px-8 lg:px-4">
		<!-- Results Header -->
		{#if searchQuery || selectedCategory !== 'all'}
			<div class="mb-6 text-center">
				<h2 class="text-3xl font-bold text-gray-900 mb-4">
					{#if searchQuery}
						Search Results
					{:else}
						{categories.find(c => c.id === selectedCategory)?.name} Services
					{/if}
				</h2>
				<p class="text-lg text-gray-600">
					Showing {filteredServices.length} results
					{#if searchQuery}for "{searchQuery}"{/if}
					{#if selectedCategory !== 'all' && !searchQuery}in {categories.find(c => c.id === selectedCategory)?.name}{/if}
				</p>
			</div>
		{:else}
			<div class="mb-6 text-center">
				<h2 class="text-3xl font-bold text-gray-900 mb-4">All Services</h2>
				<p class="text-lg text-gray-600">
					Browse all {filteredServices.length} available services
				</p>
			</div>
		{/if}

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{#each filteredServices as service}
				<button
					class="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden cursor-pointer text-left w-full group"
					on:click={() => handleServiceClick(service.id)}
				>
					<!-- Service Image -->
					<div class="h-48 overflow-hidden">
						<img
							src={service.image}
							alt={service.title}
							class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
							loading="lazy"
						/>
					</div>

					<div class="p-6">
						<div class="mb-4">
							<h3 class="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{service.title}</h3>
							<p class="text-gray-600 text-sm mb-4">{service.description}</p>
						</div>

						<div class="flex items-center justify-between">
							<div class="flex items-center space-x-1">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
									<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
								</svg>
								<span class="text-sm font-medium text-gray-900">{service.rating}</span>
								<span class="text-sm text-gray-500">({service.reviews})</span>
							</div>
							<div class="text-lg font-bold text-blue-600 group-hover:text-blue-700 transition-colors">{service.price}</div>
						</div>
					</div>
				</button>
			{/each}
		</div>

		{#if filteredServices.length === 0}
			<div class="text-center py-12">
				<div class="text-6xl mb-4">🔍</div>
				<h3 class="text-2xl font-bold text-gray-900 mb-2">No services found</h3>
				<p class="text-gray-600 mb-6">Try adjusting your search criteria or browse all categories.</p>
				<button
					class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
					on:click={() => {searchQuery = ''; selectedCategory = 'all';}}
				>
					Show All Services
				</button>
			</div>
		{:else if filteredServices === handymanServices && searchQuery.trim() && selectedCategory === 'all'}
			<!-- Show message when displaying handyman services as fallback -->
			<div class="text-center py-8 mb-8">
				<div class="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
					<div class="text-4xl mb-3">🔨</div>
					<h3 class="text-xl font-bold text-blue-900 mb-2">No exact matches found</h3>
					<p class="text-blue-700 mb-4">
						We couldn't find services matching "{searchQuery}", so we're showing handyman services that might help with your needs.
					</p>
					<button
						class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
						on:click={() => {searchQuery = ''; selectedCategory = 'all';}}
					>
						Show All Services
					</button>
				</div>
			</div>
		{/if}
	</div>
</section>

<!-- Categories Section -->
<section class="py-16 bg-white">
	<div class="container mx-auto px-6 sm:px-8 lg:px-4">
		<div>
			<h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Browse by Category</h2>
			<div class="flex flex-wrap justify-center gap-4 mb-12">
				{#each categories as category}
					<button
						class="flex items-center space-x-2 px-6 py-3 rounded-full border-2 transition-all duration-200 transform hover:scale-105 {selectedCategory === category.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600 hover:shadow-md'}"
						on:click={() => selectedCategory = category.id}
					>
						<span class="text-lg">{category.icon}</span>
						<span class="font-medium">{category.name}</span>
					</button>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="py-20 bg-blue-600">
	<div class="container mx-auto px-6 sm:px-8 lg:px-4 text-center">
		<div>
			<h2 class="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
			<p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
				Join thousands of satisfied customers who have found the perfect professional for their projects.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<a href="/signup" class="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 rounded-lg font-semibold transition-colors transform hover:scale-105 shadow-lg">
					Get Started
				</a>
				<a href="/about" class="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 rounded-lg font-semibold transition-colors transform hover:scale-105">
					Learn More
				</a>
			</div>
		</div>
	</div>
</section>

<!-- Login/Signup Modal -->
<LoginSignupModal
	isOpen={showLoginModal}
	on:success={handleLoginSuccess}
	on:close={handleLoginClose}
/>