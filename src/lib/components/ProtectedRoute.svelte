<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { auth, authActions } from '../stores/auth';
  import { hasPermission, hasAnyRole, canAccessRoute, type UserRole } from '../utils/roleBasedAccess';
  import LoadingSpinner from './LoadingSpinner.svelte';

  export let requiredRoles: UserRole[] = [];
  export let requiredPermission: { resource: string; action: string } | null = null;
  export let redirectTo = '/login';
  export let fallbackComponent: any = null;

  let isLoading = true;
  let hasAccess = false;
  let user: any = null;

  $: currentPath = $page.url.pathname;

  onMount(async () => {
    // Check authentication status
    await authActions.checkAuth();
    
    // Subscribe to auth changes
    const unsubscribe = auth.subscribe(authState => {
      user = authState.user;
      isLoading = authState.isLoading;
      
      if (!isLoading) {
        checkAccess();
      }
    });

    return unsubscribe;
  });

  function checkAccess() {
    if (!user) {
      hasAccess = false;
      goto(redirectTo);
      return;
    }

    // Check role-based access
    if (requiredRoles.length > 0) {
      if (!hasAnyRole(user, requiredRoles)) {
        hasAccess = false;
        goto('/unauthorized');
        return;
      }
    }

    // Check permission-based access
    if (requiredPermission) {
      if (!hasPermission(user, requiredPermission.resource, requiredPermission.action)) {
        hasAccess = false;
        goto('/unauthorized');
        return;
      }
    }

    // Check route-based access
    if (!canAccessRoute(user, currentPath)) {
      hasAccess = false;
      goto('/unauthorized');
      return;
    }

    hasAccess = true;
  }
</script>

{#if isLoading}
  <div class="flex items-center justify-center min-h-screen">
    <LoadingSpinner />
  </div>
{:else if hasAccess}
  <slot />
{:else if fallbackComponent}
  <svelte:component this={fallbackComponent} />
{:else}
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
      <p class="text-gray-600 mb-6">You don't have permission to access this page.</p>
      <button 
        on:click={() => goto('/')}
        class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Go Home
      </button>
    </div>
  </div>
{/if}
