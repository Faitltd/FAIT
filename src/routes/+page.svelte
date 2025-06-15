<script>
	import { supabase } from '$lib/supabase.js';
	
	let showLoginForm = false;
	let email = 'admin@geargrab.com';
	let password = 'admin123';
	let isLoading = false;
	let error = '';
	let user = null;

	// Check if user is logged in
	supabase.auth.getSession().then(({ data: { session } }) => {
		user = session?.user ?? null;
	});

	// Listen for auth changes
	supabase.auth.onAuthStateChange((event, session) => {
		user = session?.user ?? null;
	});

	function toggleLogin() {
		showLoginForm = !showLoginForm;
		error = '';
	}

	async function handleLogin() {
		if (!email || !password) {
			error = 'Please enter email and password';
			return;
		}

		isLoading = true;
		error = '';

		try {
			const { data, error: loginError } = await supabase.auth.signInWithPassword({
				email,
				password
			});

			if (loginError) {
				error = loginError.message;
			} else {
				showLoginForm = false;
				user = data.user;
			}
		} catch (err) {
			error = 'An unexpected error occurred';
		} finally {
			isLoading = false;
		}
	}

	async function handleLogout() {
		await supabase.auth.signOut();
		user = null;
	}
</script>

<svelte:head>
	<title>GearGrab - Outdoor Gear Rental Marketplace</title>
</svelte:head>

<div style="min-height: 100vh; background: linear-gradient(135deg, #2d5a27, #40798c); color: white;">
	<!-- Header -->
	<header style="padding: 1rem 2rem; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
		<div style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto;">
			<h1 style="font-size: 2rem; font-weight: bold; margin: 0;">🏕️ GearGrab</h1>
			<nav style="display: flex; gap: 2rem; align-items: center;">
				<a href="/admin" style="color: white; text-decoration: none; padding: 0.5rem 1rem; border-radius: 8px; background: rgba(255,255,255,0.1);">Admin</a>
				
				{#if user}
					<span style="color: white;">Welcome, {user.email}!</span>
					<button on:click={handleLogout} style="color: white; text-decoration: none; padding: 0.5rem 1rem; border-radius: 8px; background: rgba(255,255,255,0.1); border: none; cursor: pointer;">Logout</button>
				{:else}
					<button on:click={toggleLogin} style="color: white; text-decoration: none; padding: 0.5rem 1rem; border-radius: 8px; background: rgba(255,255,255,0.1); border: none; cursor: pointer;">Login</button>
				{/if}
			</nav>
		</div>
	</header>

	<!-- Login Form (if shown) -->
	{#if showLoginForm}
		<div style="background: rgba(0,0,0,0.8); position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1000; display: flex; align-items: center; justify-content: center;">
			<div style="background: white; padding: 2rem; border-radius: 12px; max-width: 400px; width: 90%;">
				<h3 style="margin: 0 0 1rem 0; color: #333;">Sign In to GearGrab</h3>

				{#if error}
					<div style="background: #fee; border: 1px solid #fcc; color: #c33; padding: 0.5rem; border-radius: 4px; margin-bottom: 1rem; font-size: 0.9rem;">
						{error}
					</div>
				{/if}

				<form on:submit|preventDefault={handleLogin}>
					<div style="margin-bottom: 1rem;">
						<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Email:</label>
						<input
							type="email"
							bind:value={email}
							style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;"
							placeholder="admin@geargrab.com"
						/>
					</div>

					<div style="margin-bottom: 1.5rem;">
						<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Password:</label>
						<input
							type="password"
							bind:value={password}
							style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;"
							placeholder="admin123"
						/>
					</div>

					<div style="display: flex; gap: 1rem;">
						<button
							type="submit"
							disabled={isLoading}
							style="flex: 1; background: #70a9a1; color: white; padding: 0.75rem; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; opacity: {isLoading ? 0.7 : 1};"
						>
							{isLoading ? 'Signing In...' : 'Sign In'}
						</button>
						<button
							type="button"
							on:click={toggleLogin}
							style="flex: 1; background: #ccc; color: #333; padding: 0.75rem; border: none; border-radius: 6px; font-weight: 500; cursor: pointer;"
						>
							Cancel
						</button>
					</div>
				</form>

				<p style="margin-top: 1rem; font-size: 0.9rem; color: #666; text-align: center;">
					Demo: admin@geargrab.com / admin123
				</p>
			</div>
		</div>
	{/if}

	<!-- Hero Section -->
	<main style="padding: 4rem 2rem; text-align: center; max-width: 1200px; margin: 0 auto;">
		<div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border-radius: 24px; padding: 3rem; margin-bottom: 3rem; border: 1px solid rgba(255,255,255,0.3);">
			<h2 style="font-size: 3rem; font-weight: bold; margin-bottom: 1rem; line-height: 1.2;">
				Rent Outdoor Gear from
				<span style="color: #70a9a1;">Fellow Adventurers</span>
			</h2>
			<p style="font-size: 1.5rem; margin-bottom: 2rem; opacity: 0.9;">
				Grab Your Gear and Get Out There! Peer-to-peer outdoor equipment sharing.
			</p>

			<!-- Action Buttons -->
			<div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
				<a href="/browse" style="background: #70a9a1; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 1.2rem; display: inline-block; transition: all 0.3s;">
					Browse Gear
				</a>
				<a href="/list" style="border: 2px solid white; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 1.2rem; display: inline-block; transition: all 0.3s;">
					List Your Gear
				</a>
			</div>
		</div>

		<!-- Status Display -->
		{#if user}
			<div style="background: rgba(0,255,0,0.2); padding: 1rem; border-radius: 12px; margin-bottom: 2rem;">
				<h3 style="color: #90EE90; margin: 0;">✅ Authentication Working!</h3>
				<p style="margin: 0.5rem 0 0 0;">Logged in as: {user.email}</p>
				<p style="margin: 0.5rem 0 0 0;">User ID: {user.id}</p>
			</div>
		{/if}

		<!-- Popular Categories -->
		<div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 24px; padding: 3rem; border: 1px solid rgba(255,255,255,0.2);">
			<h3 style="font-size: 2rem; font-weight: bold; margin-bottom: 2rem;">Popular Categories</h3>
			<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
				<div style="background: rgba(255,255,255,0.15); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.2);">
					<h4 style="font-size: 1.3rem; font-weight: bold; margin-bottom: 0.5rem;">🏕️ Camping & Shelter</h4>
					<p style="opacity: 0.8;">Tents, sleeping bags, camping stoves</p>
				</div>
				<div style="background: rgba(255,255,255,0.15); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.2);">
					<h4 style="font-size: 1.3rem; font-weight: bold; margin-bottom: 0.5rem;">🥾 Hiking & Backpacking</h4>
					<p style="opacity: 0.8;">Backpacks, boots, trekking poles</p>
				</div>
				<div style="background: rgba(255,255,255,0.15); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.2);">
					<h4 style="font-size: 1.3rem; font-weight: bold; margin-bottom: 0.5rem;">🧗 Climbing & Mountaineering</h4>
					<p style="opacity: 0.8;">Harnesses, ropes, carabiners</p>
				</div>
				<div style="background: rgba(255,255,255,0.15); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.2);">
					<h4 style="font-size: 1.3rem; font-weight: bold; margin-bottom: 0.5rem;">🚣 Water Sports</h4>
					<p style="opacity: 0.8;">Kayaks, SUPs, wetsuits</p>
				</div>
			</div>
		</div>
	</main>
</div>
