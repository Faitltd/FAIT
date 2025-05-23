import { browser } from '$app/environment';
import { auth } from '$lib/stores/auth';

// This runs when the app starts
export function load() {
  // Only run in the browser
  if (browser) {
    // Check if user is already logged in
    auth.checkAuth();
  }
  
  return {};
}
