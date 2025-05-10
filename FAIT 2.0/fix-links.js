// This script will fix the links in the Hero component
// Run this script in the browser console to fix the links

(function() {
  // Check if we're on the home page
  if (window.location.pathname === '/') {
    console.log('Fixing links on the home page...');
    
    // Find all links in the Hero component
    const links = document.querySelectorAll('a');
    
    // Log all links for debugging
    console.log('Found links:', links);
    
    // Find the "Get Started" and "Browse Services" buttons
    let getStartedLink = null;
    let browseServicesLink = null;
    
    links.forEach(link => {
      const text = link.textContent.trim();
      console.log('Link text:', text);
      
      if (text === 'Get Started') {
        getStartedLink = link;
      } else if (text === 'Browse Services') {
        browseServicesLink = link;
      }
    });
    
    // Fix the "Get Started" link
    if (getStartedLink) {
      console.log('Found "Get Started" link:', getStartedLink);
      getStartedLink.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Navigating to /register');
        window.location.href = '/register';
      });
    } else {
      console.log('Could not find "Get Started" link');
    }
    
    // Fix the "Browse Services" link
    if (browseServicesLink) {
      console.log('Found "Browse Services" link:', browseServicesLink);
      browseServicesLink.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Navigating to /services');
        window.location.href = '/services';
      });
    } else {
      console.log('Could not find "Browse Services" link');
    }
  }
})();
