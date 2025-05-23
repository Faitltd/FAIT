<script>
  // Contact page component
  let name = '';
  let email = '';
  let subject = '';
  let message = '';
  let submitted = false;

  function handleSubmit() {
    // In a real application, you would send the form data to a server
    console.log({ name, email, subject, message });
    submitted = true;
    
    // Reset form
    name = '';
    email = '';
    subject = '';
    message = '';
  }
</script>

<svelte:head>
  <title>Contact - FAIT</title>
  <meta name="description" content="Get in touch with the FAIT team. We're here to help with any questions or feedback." />
</svelte:head>

<section class="bg-fait-light py-12">
  <div class="container-custom">
    <h1 class="text-4xl font-ivy font-bold text-fait-dark mb-6">Contact Us</h1>
    <p class="text-lg mb-8">We'd love to hear from you. Get in touch with our team.</p>
  </div>
</section>

<section class="py-12">
  <div class="container-custom">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div>
        <h2 class="text-2xl font-ivy font-bold mb-6">Send Us a Message</h2>
        
        {#if submitted}
          <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <p>Thank you for your message! We'll get back to you as soon as possible.</p>
          </div>
        {/if}
        
        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
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
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
            />
          </div>
          
          <div>
            <label for="subject" class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input 
              type="text" 
              id="subject" 
              bind:value={subject} 
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
            />
          </div>
          
          <div>
            <label for="message" class="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea 
              id="message" 
              bind:value={message} 
              required
              rows="5"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
            ></textarea>
          </div>
          
          <button type="submit" class="btn btn-primary">Send Message</button>
        </form>
      </div>
      
      <div>
        <h2 class="text-2xl font-ivy font-bold mb-6">Contact Information</h2>
        
        <div class="bg-white p-6 rounded-lg shadow-md mb-6">
          <div class="flex items-start mb-4">
            <div class="text-fait-blue text-xl mr-4">📧</div>
            <div>
              <h3 class="font-bold mb-1">Email</h3>
              <p>info@itsfait.com</p>
            </div>
          </div>
          
          <div class="flex items-start mb-4">
            <div class="text-fait-blue text-xl mr-4">📱</div>
            <div>
              <h3 class="font-bold mb-1">Phone</h3>
              <p>(555) 123-4567</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="text-fait-blue text-xl mr-4">📍</div>
            <div>
              <h3 class="font-bold mb-1">Address</h3>
              <p>123 Cooperative Way<br />San Francisco, CA 94110</p>
            </div>
          </div>
        </div>
        
        <h3 class="text-xl font-bold mb-4">Follow Us</h3>
        <div class="flex space-x-4">
          <a href="#" class="text-fait-blue hover:text-blue-700 text-2xl">
            <span class="sr-only">Facebook</span>
            <span>📘</span>
          </a>
          <a href="#" class="text-fait-blue hover:text-blue-700 text-2xl">
            <span class="sr-only">Twitter</span>
            <span>🐦</span>
          </a>
          <a href="#" class="text-fait-blue hover:text-blue-700 text-2xl">
            <span class="sr-only">Instagram</span>
            <span>📷</span>
          </a>
          <a href="#" class="text-fait-blue hover:text-blue-700 text-2xl">
            <span class="sr-only">LinkedIn</span>
            <span>🔗</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
