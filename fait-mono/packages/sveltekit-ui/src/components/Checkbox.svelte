<script lang="ts">
  export let checked = false;
  export let label: string | undefined = undefined;
  export let id = '';
  export let name = '';
  export let required = false;
  export let disabled = false;
  export let error: string | undefined = undefined;
</script>

<div class="flex items-start">
  <div class="flex items-center h-5">
    <input
      type="checkbox"
      {id}
      {name}
      bind:checked
      {required}
      {disabled}
      class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-offset-0"
      on:change
      {...$$restProps}
    />
  </div>
  
  {#if label}
    <div class="ml-3 text-sm">
      <label for={id} class="font-medium text-gray-700" class:text-gray-400={disabled}>
        {label}
        {#if required}<span class="text-red-500">*</span>{/if}
      </label>
      
      {#if error}
        <p class="mt-1 text-sm text-red-600">{error}</p>
      {/if}
      
      <slot />
    </div>
  {/if}
</div>
