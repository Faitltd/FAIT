<script>
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { supabase } from '$lib/supabase.js';
  import { onMount } from 'svelte';
  
  let user = null;
  
  onMount(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      user = session?.user ?? null;
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      user = session?.user ?? null;
    });
    
    return () => subscription.unsubscribe();
  });
</script>

<div class="min-h-screen flex flex-col">
  <Header {user} />
  <main class="flex-1">
    <slot />
  </main>
  <Footer />
</div>