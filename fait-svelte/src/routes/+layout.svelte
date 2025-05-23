<script>
  import '../app.css';
  import Header from '$lib/components/layout/SimpleHeader.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import NotificationContainer from '$lib/components/notifications/NotificationContainer.svelte';
  import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { addSkipLink } from '$lib/utils/accessibility';
  import { loading } from '$lib/stores/loading';

  // Track current and previous paths for transitions
  let currentPath = '';
  let previousPath = '';

  // Update paths when the page changes
  $: {
    if (currentPath !== $page.url.pathname) {
      previousPath = currentPath;
      currentPath = $page.url.pathname;
    }
  }

  // Initialize on mount
  onMount(() => {
    currentPath = $page.url.pathname;

    // Add skip link for keyboard navigation
    addSkipLink('main-content', 'Skip to main content');
  });
</script>

<style>
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    padding: 8px 16px;
    background: #000;
    color: #fff;
    z-index: 9999;
    transition: top 0.2s;
  }

  .skip-link:focus {
    top: 0;
  }

  .page-content {
    width: 100%;
    height: 100%;
  }

  .layout-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    flex-grow: 1;
  }
</style>
<div class="layout-container">
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- Notification Container -->
  <NotificationContainer position="top-right" />

  <!-- Global Loading Indicator -->
  {#if $loading.isLoading}
    <LoadingIndicator fullScreen={true} text={$loading.message} />
  {/if}

  <Header />

  <main id="main-content" class="main-content" tabindex="-1">
    {#key currentPath}
      <div
        in:fade={{ duration: 300, delay: 300 }}
        out:fade={{ duration: 300 }}
        class="page-content"
      >
        <slot />
      </div>
    {/key}
  </main>

  <Footer />
</div>
