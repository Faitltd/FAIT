<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let color: string = 'blue';
  export let text: string = '';

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white',
    green: 'text-green-600',
    red: 'text-red-600'
  };
</script>

<div class="flex flex-col items-center justify-center space-y-2">
  <div class="animate-spin {sizeClasses[size]} {colorClasses[color] || colorClasses.blue}">
    <svg class="w-full h-full" fill="none" viewBox="0 0 24 24">
      <circle 
        class="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        stroke-width="4"
      ></circle>
      <path 
        class="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  </div>
  {#if text}
    <p class="text-sm text-gray-600">{text}</p>
  {/if}
</div>
