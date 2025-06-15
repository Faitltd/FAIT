<script>
  export let service;
  export let onClick = () => {};
</script>

<div 
  class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6"
  on:click={onClick}
  on:keydown={(e) => e.key === 'Enter' && onClick()}
  role="button"
  tabindex="0"
>
  <div class="text-4xl mb-4">{service.icon}</div>
  <h3 class="text-xl font-semibold mb-2">{service.title}</h3>
  <p class="text-gray-600 mb-4">{service.description}</p>
  <div class="flex justify-between items-center">
    <span class="text-blue-600 font-semibold">{service.price}</span>
    <span class="text-sm text-gray-500">{service.duration}</span>
  </div>
</div>