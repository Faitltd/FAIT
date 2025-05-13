<script lang="ts">
  export let type = 'text';
  export let value = '';
  export let placeholder = '';
  export let label: string | undefined = undefined;
  export let error: string | undefined = undefined;
  export let id = '';
  export let name = '';
  export let required = false;
  export let disabled = false;
  export let readonly = false;
  
  $: inputClasses = `
    w-full px-3 py-2 border rounded-md
    ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'}
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    focus:outline-none focus:ring-2
  `;
</script>

<div class="w-full">
  {#if label}
    <label for={id} class="block text-sm font-medium text-gray-700 mb-1">
      {label}{#if required}<span class="text-red-500">*</span>{/if}
    </label>
  {/if}
  
  <input
    {type}
    {id}
    {name}
    bind:value
    {placeholder}
    {required}
    {disabled}
    {readonly}
    class={inputClasses}
    on:input
    on:change
    on:focus
    on:blur
    {...$$restProps}
  />
  
  {#if error}
    <p class="mt-1 text-sm text-red-600">{error}</p>
  {/if}
</div>
