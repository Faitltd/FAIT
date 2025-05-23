<script>
  // About page component
</script>

<svelte:head>
  <title>About - FAIT</title>
  <meta name="description" content="Learn about FAIT's mission, values, and the team behind the cooperative platform." />
</svelte:head>

<section class="bg-fait-light py-12">
  <div class="container-custom">
    <h1 class="text-4xl font-ivy font-bold text-fait-dark mb-6">About FAIT</h1>
    <p class="text-lg mb-8">Learn about our mission and values.</p>
  </div>
</section>

<section class="py-12">
  <div class="container-custom">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div>
        <h2 class="text-3xl font-ivy font-bold mb-6">Our Mission</h2>
        <p class="text-lg mb-4">
          FAIT is a cooperative platform that connects skilled professionals with clients who need their services. 
          Our mission is to create a fair, transparent, and community-driven marketplace that benefits both service 
          providers and clients.
        </p>
        <p class="text-lg mb-4">
          We believe in the power of cooperation and community. By working together, we can create a more equitable 
          economy that values the skills and contributions of all members.
        </p>
      </div>
      <div class="rounded-lg overflow-hidden shadow-xl">
        <img src="/images/about-mission.jpg" alt="FAIT Mission" class="w-full h-auto" />
      </div>
    </div>
  </div>
</section>

<section class="bg-fait-light py-12">
  <div class="container-custom">
    <h2 class="text-3xl font-ivy font-bold text-center mb-12">Our Values</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="text-fait-blue text-4xl mb-4">🤝</div>
        <h3 class="text-xl font-bold mb-2">Cooperation</h3>
        <p>We believe in working together to create mutual benefit for all members of our community.</p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="text-fait-blue text-4xl mb-4">⚖️</div>
        <h3 class="text-xl font-bold mb-2">Fairness</h3>
        <p>We are committed to creating fair opportunities and compensation for service providers.</p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="text-fait-blue text-4xl mb-4">🔍</div>
        <h3 class="text-xl font-bold mb-2">Transparency</h3>
        <p>We operate with complete transparency in our pricing, policies, and decision-making processes.</p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="text-fait-blue text-4xl mb-4">🌱</div>
        <h3 class="text-xl font-bold mb-2">Sustainability</h3>
        <p>We are committed to environmentally and socially sustainable practices in all our operations.</p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="text-fait-blue text-4xl mb-4">🏘️</div>
        <h3 class="text-xl font-bold mb-2">Community</h3>
        <p>We prioritize building strong, supportive communities that empower all members.</p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="text-fait-blue text-4xl mb-4">🛠️</div>
        <h3 class="text-xl font-bold mb-2">Quality</h3>
        <p>We are dedicated to providing high-quality services that meet or exceed client expectations.</p>
      </div>
    </div>
  </div>
</section>

<section class="py-12">
  <div class="container-custom">
    <h2 class="text-3xl font-ivy font-bold text-center mb-12">Our Team</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <div class="bg-white p-6 rounded-lg shadow-md text-center">
        <div class="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
          <img src="/images/team-member-1.jpg" alt="Team Member" class="w-full h-full object-cover" />
        </div>
        <h3 class="text-xl font-bold mb-1">Jane Doe</h3>
        <p class="text-fait-blue mb-2">Co-Founder & CEO</p>
        <p class="text-gray-600">Jane has over 15 years of experience in community organizing and cooperative development.</p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-md text-center">
        <div class="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
          <img src="/images/team-member-2.jpg" alt="Team Member" class="w-full h-full object-cover" />
        </div>
        <h3 class="text-xl font-bold mb-1">John Smith</h3>
        <p class="text-fait-blue mb-2">Co-Founder & CTO</p>
        <p class="text-gray-600">John is a software engineer with a passion for using technology to create social impact.</p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-md text-center">
        <div class="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
          <img src="/images/team-member-3.jpg" alt="Team Member" class="w-full h-full object-cover" />
        </div>
        <h3 class="text-xl font-bold mb-1">Sarah Johnson</h3>
        <p class="text-fait-blue mb-2">Community Manager</p>
        <p class="text-gray-600">Sarah works directly with service providers to ensure they have the support they need.</p>
      </div>
    </div>
  </div>
</section>
