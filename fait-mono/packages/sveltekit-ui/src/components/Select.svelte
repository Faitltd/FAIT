<script lang="ts">
  export let value = '';
  export let options: { value: string; label: string }[] = [];
  export let placeholder = '';
  export let label: string | undefined = undefined;
  export let error: string | undefined = undefined;
  export let id = '';
  export let name = '';
  export let required = false;
  export let disabled = false;
  
  $: selectClasses = `
    w-full px-3 py-2 border rounded-md appearance-none bg-white
    ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'}
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
    focus:outline-none focus:ring-2
  `;
</script>

<div class="w-full">
  {#if label}
    <label for={id} class="block text-sm font-medium text-gray-700 mb-1">
      {label}{#if required}<span class="text-red-500">*</span>{/if}
    </label>
  {/if}
  
  <div class="relative">
    <select
      {id}
      {name}
      bind:value
      {required}
      {disabled}
      class={selectClasses}
      on:change
      on:focus
      on:blur
      {...$$restProps}
    >
      {#if placeholder}
        <option value="" disabled selected>{placeholder}</option>
      {/if}
      
      {#each options as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
    
    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
      <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
      </svg>
    </div>
  </div>
  
  {#if error}
    <p class="mt-1 text-sm text-red-600">{error}</p>
  {/if}
</div>
