<script>
  export let size = 'medium';
  export let color = 'blue';
  
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };
  
  const colorClasses = {
    blue: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600'
  };
</script>

<div class="flex justify-center items-center">
  <div class="animate-spin rounded-full border-2 border-gray-300 border-t-current {sizeClasses[size]} {colorClasses[color]}"></div>
</div>