<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { payment } from '$lib/stores/payment';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { fade } from 'svelte/transition';

  // Active tab
  let activeTab = 'profile';

  // Form state
  let name = '';
  let email = '';
  let phone = '';
  let address = '';
  let bio = '';
  let success = false;

  // Password change form
  let currentPassword = '';
  let newPassword = '';
  let confirmPassword = '';
  let passwordErrors: Record<string, string> = {};
  let passwordSuccess = false;

  // Initialize form with user data
  onMount(async () => {
    // Check if user is authenticated
    await auth.checkAuth();

    if ($auth.user) {
      name = $auth.user.name;
      email = $auth.user.email;
      phone = $auth.user.phone || '';
      address = $auth.user.address || '';
      bio = $auth.user.bio || '';

      // Load payment methods
      await payment.loadPaymentMethods();
    } else {
      // Redirect to login if not authenticated
      goto('/login');
    }
  });

  async function handleSubmit() {
    // Update user profile
    const result = await auth.updateProfile({
      name,
      phone,
      address,
      bio
    });

    if (result.success) {
      success = true;

      // Reset success message after 3 seconds
      setTimeout(() => {
        success = false;
      }, 3000);
    }
  }

  // Validate password form
  function validatePasswordForm(): boolean {
    passwordErrors = {};

    if (!currentPassword) {
      passwordErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      passwordErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      passwordErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      passwordErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      passwordErrors.confirmPassword = 'Passwords do not match';
    }

    return Object.keys(passwordErrors).length === 0;
  }

  // Change password
  async function changePassword() {
    if (!validatePasswordForm()) return;

    // In a real app, this would call an API to change the password
    // For now, we'll simulate a successful password change
    await new Promise(resolve => setTimeout(resolve, 1000));

    passwordSuccess = true;
    currentPassword = '';
    newPassword = '';
    confirmPassword = '';

    // Reset success message after 3 seconds
    setTimeout(() => {
      passwordSuccess = false;
    }, 3000);
  }

  // Set default payment method
  async function setDefaultPaymentMethod(id: string) {
    await payment.setDefaultPaymentMethod(id);
  }

  // Remove payment method
  async function removePaymentMethod(id: string) {
    if (confirm('Are you sure you want to remove this payment method?')) {
      await payment.removePaymentMethod(id);
    }
  }

  // Format card brand for display
  function formatCardBrand(brand?: string): string {
    if (!brand) return '';

    return brand.charAt(0).toUpperCase() + brand.slice(1);
  }
</script>

<svelte:head>
  <title>Profile - FAIT</title>
  <meta name="description" content="Manage your FAIT profile and account settings." />
</svelte:head>

<section class="bg-fait-light py-12">
  <div class="container-custom">
    <h1 class="text-3xl font-ivy font-bold text-fait-dark mb-6">Your Profile</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Sidebar -->
      <div class="md:col-span-1">
        <Card variant="elevated" padding="md">
          <div class="flex flex-col items-center text-center">
            <div class="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-4">
              {#if $auth.user?.avatar}
                <img src={$auth.user.avatar} alt={$auth.user.name} class="w-full h-full object-cover" />
              {:else}
                <div class="w-full h-full flex items-center justify-center text-gray-500 text-4xl">
                  {$auth.user?.name.charAt(0).toUpperCase()}
                </div>
              {/if}
            </div>

            <h2 class="text-xl font-bold mb-1">{$auth.user?.name}</h2>
            <p class="text-gray-600 mb-4">{$auth.user?.email}</p>

            <div class="w-full border-t border-gray-200 pt-4 mt-2">
              <nav class="flex flex-col space-y-2">
                <button
                  class="py-2 px-4 text-left {activeTab === 'profile' ? 'bg-fait-blue text-white' : 'text-fait-dark hover:bg-gray-100'} rounded-md"
                  on:click={() => activeTab = 'profile'}
                >
                  Profile
                </button>
                <button
                  class="py-2 px-4 text-left {activeTab === 'payment' ? 'bg-fait-blue text-white' : 'text-fait-dark hover:bg-gray-100'} rounded-md"
                  on:click={() => activeTab = 'payment'}
                >
                  Payment Methods
                </button>
                <button
                  class="py-2 px-4 text-left {activeTab === 'security' ? 'bg-fait-blue text-white' : 'text-fait-dark hover:bg-gray-100'} rounded-md"
                  on:click={() => activeTab = 'security'}
                >
                  Security
                </button>
                <a href="/bookings" class="py-2 px-4 text-fait-dark hover:bg-gray-100 rounded-md">My Bookings</a>
              </nav>
            </div>
          </div>
        </Card>
      </div>

      <!-- Main Content -->
      <div class="md:col-span-2">
        {#if activeTab === 'profile'}
          <div in:fade>
            <Card variant="elevated" padding="lg">
            <h2 class="text-xl font-bold mb-6">Edit Profile</h2>

            {#if success}
              <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                <p>Profile updated successfully!</p>
              </div>
            {/if}

            <form on:submit|preventDefault={handleSubmit} class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    bind:value={name}
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
                  />
                </div>

                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    bind:value={email}
                    required
                    disabled
                    class="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  />
                  <p class="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
                </div>

                <div>
                  <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    bind:value={phone}
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
                  />
                </div>

                <div>
                  <label for="address" class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    id="address"
                    bind:value={address}
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
                  />
                </div>
              </div>

              <div>
                <label for="bio" class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  id="bio"
                  bind:value={bio}
                  rows="4"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
                ></textarea>
                <p class="text-sm text-gray-500 mt-1">Tell us a bit about yourself.</p>
              </div>

              <div class="flex justify-end">
                <Button type="submit" variant="primary" disabled={$auth.isLoading}>
                  {$auth.isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
          </div>
        {:else if activeTab === 'payment'}
          <div in:fade>
            <Card variant="elevated" padding="lg">
            <h2 class="text-xl font-bold mb-6">Payment Methods</h2>

            {#if $payment.isLoading}
              <div class="flex justify-center items-center py-4">
                <div class="spinner"></div>
              </div>
            {:else if $payment.error}
              <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{$payment.error}</p>
              </div>
            {:else if $payment.paymentMethods.length === 0}
              <div class="text-center py-6 bg-gray-50 rounded-md">
                <p class="text-gray-600 mb-4">You don't have any payment methods yet.</p>
                <Button
                  variant="primary"
                  size="md"
                  on:click={() => goto('/profile/payment/add')}
                >
                  Add Payment Method
                </Button>
              </div>
            {:else}
              <div class="space-y-4 mb-6">
                {#each $payment.paymentMethods as method}
                  <div class="border rounded-md p-4 {method.isDefault ? 'border-fait-blue bg-blue-50' : 'border-gray-200'}">
                    <div class="flex justify-between">
                      <div>
                        <div class="font-medium">
                          {formatCardBrand(method.brand)} •••• {method.last4}
                        </div>
                        {#if method.expMonth && method.expYear}
                          <div class="text-sm text-gray-600">
                            Expires {method.expMonth}/{method.expYear}
                          </div>
                        {/if}
                      </div>
                      {#if method.isDefault}
                        <span class="text-xs bg-fait-blue text-white px-2 py-0.5 rounded-full">Default</span>
                      {/if}
                    </div>
                    <div class="mt-2 flex justify-end space-x-2">
                      {#if !method.isDefault}
                        <button
                          type="button"
                          class="text-sm text-gray-600 hover:text-fait-blue focus:outline-none"
                          on:click={() => setDefaultPaymentMethod(method.id)}
                        >
                          Set as default
                        </button>
                      {/if}
                      <button
                        type="button"
                        class="text-sm text-red-600 hover:text-red-800 focus:outline-none"
                        on:click={() => removePaymentMethod(method.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                {/each}
              </div>

              <Button
                variant="outline"
                size="md"
                on:click={() => goto('/profile/payment/add')}
              >
                Add New Payment Method
              </Button>
            {/if}
          </Card>
          </div>
        {:else if activeTab === 'security'}
          <div in:fade>
            <Card variant="elevated" padding="lg">
            <h2 class="text-xl font-bold mb-6">Security Settings</h2>

            {#if passwordSuccess}
              <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                <p>Password updated successfully!</p>
              </div>
            {/if}

            <div class="mb-6">
              <h3 class="text-lg font-medium mb-4">Change Password</h3>

              <form on:submit|preventDefault={changePassword} class="space-y-4">
                <div>
                  <label for="current-password" class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    id="current-password"
                    bind:value={currentPassword}
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue
                      {passwordErrors.currentPassword ? 'border-red-500' : ''}"
                  />
                  {#if passwordErrors.currentPassword}
                    <p class="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>
                  {/if}
                </div>

                <div>
                  <label for="new-password" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    id="new-password"
                    bind:value={newPassword}
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue
                      {passwordErrors.newPassword ? 'border-red-500' : ''}"
                  />
                  {#if passwordErrors.newPassword}
                    <p class="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                  {/if}
                </div>

                <div>
                  <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirm-password"
                    bind:value={confirmPassword}
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue
                      {passwordErrors.confirmPassword ? 'border-red-500' : ''}"
                  />
                  {#if passwordErrors.confirmPassword}
                    <p class="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                  {/if}
                </div>

                <div class="flex justify-end">
                  <Button type="submit" variant="primary">
                    Update Password
                  </Button>
                </div>
              </form>
            </div>

            <div class="border-t border-gray-200 pt-6">
              <h3 class="text-lg font-medium mb-4">Two-Factor Authentication</h3>
              <p class="text-gray-600 mb-4">Add an extra layer of security to your account by enabling two-factor authentication.</p>

              <Button variant="outline">
                Enable Two-Factor Authentication
              </Button>
            </div>
          </Card>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>
