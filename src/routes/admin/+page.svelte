<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth';

	let stats = {
		totalServices: 0,
		activeServices: 0,
		totalProviders: 0,
		totalBookings: 0
	};

	let recentActivity = [
		{ id: 1, action: 'New service created', user: 'John Doe', time: '2 hours ago' },
		{ id: 2, action: 'Provider verified', user: 'Jane Smith', time: '4 hours ago' },
		{ id: 3, action: 'Booking completed', user: 'Mike Johnson', time: '6 hours ago' }
	];

	onMount(() => {
		// Load dashboard stats
		loadStats();
	});

	async function loadStats() {
		// Simulate loading stats
		stats = {
			totalServices: 156,
			activeServices: 142,
			totalProviders: 89,
			totalBookings: 1247
		};
	}
</script>

<svelte:head>
	<title>Admin Dashboard - FAIT</title>
	<meta name="description" content="FAIT Admin Dashboard for managing services and providers" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-white shadow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center py-6">
				<div class="flex items-center">
					<a href="/" class="text-2xl font-bold text-blue-600">FAIT</a>
					<span class="ml-4 text-gray-500">Admin Dashboard</span>
				</div>
				<div class="flex items-center space-x-4">
					<span class="text-gray-700">Welcome, {$auth.user?.name}</span>
					<button
						on:click={() => auth.update(state => ({ ...state, user: null, isAuthenticated: false }))}
						class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
					>
						Logout
					</button>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
		<!-- Stats Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
							</svg>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Total Services</dt>
								<dd class="text-lg font-medium text-gray-900">{stats.totalServices}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Active Services</dt>
								<dd class="text-lg font-medium text-gray-900">{stats.activeServices}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg class="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
							</svg>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Total Providers</dt>
								<dd class="text-lg font-medium text-gray-900">{stats.totalProviders}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
								<dd class="text-lg font-medium text-gray-900">{stats.totalBookings}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Quick Actions -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
			<a href="/admin/services" class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<svg class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
						</svg>
					</div>
					<div class="ml-4">
						<h3 class="text-lg font-medium text-gray-900">Manage Services</h3>
						<p class="text-sm text-gray-500">Create and manage service listings</p>
					</div>
				</div>
			</a>

			<a href="/admin/providers" class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
						</svg>
					</div>
					<div class="ml-4">
						<h3 class="text-lg font-medium text-gray-900">Manage Providers</h3>
						<p class="text-sm text-gray-500">Review and approve service providers</p>
					</div>
				</div>
			</a>

			<a href="/admin/bookings" class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<svg class="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
						</svg>
					</div>
					<div class="ml-4">
						<h3 class="text-lg font-medium text-gray-900">Manage Bookings</h3>
						<p class="text-sm text-gray-500">Monitor and manage all bookings</p>
					</div>
				</div>
			</a>
			<a href="/admin/users" class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<svg class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
						</svg>
					</div>
					<div class="ml-4">
						<h3 class="text-lg font-medium text-gray-900">Manage Users</h3>
						<p class="text-sm text-gray-500">View and manage all users</p>
					</div>
				</div>
			</a>

			<a href="/admin/messages" class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<svg class="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
					</div>
					<div class="ml-4">
						<h3 class="text-lg font-medium text-gray-900">Messages</h3>
						<p class="text-sm text-gray-500">View and respond to messages</p>
					</div>
				</div>
			</a>

			<a href="/admin/settings" class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<svg class="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
					</div>
					<div class="ml-4">
						<h3 class="text-lg font-medium text-gray-900">Settings</h3>
						<p class="text-sm text-gray-500">Configure platform settings</p>
					</div>
				</div>
			</a>
		</div>

		<!-- Recent Activity -->
		<div class="bg-white shadow rounded-lg">
			<div class="px-4 py-5 sm:p-6">
				<h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
				<div class="flow-root">
					<ul class="-mb-8">
						{#each recentActivity as activity, index}
							<li>
								<div class="relative pb-8">
									{#if index !== recentActivity.length - 1}
										<span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
									{/if}
									<div class="relative flex space-x-3">
										<div>
											<span class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
												<svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
													<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
												</svg>
											</span>
										</div>
										<div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
											<div>
												<p class="text-sm text-gray-500">{activity.action} by <span class="font-medium text-gray-900">{activity.user}</span></p>
											</div>
											<div class="text-right text-sm whitespace-nowrap text-gray-500">
												<time>{activity.time}</time>
											</div>
										</div>
									</div>
								</div>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</main>
</div>
