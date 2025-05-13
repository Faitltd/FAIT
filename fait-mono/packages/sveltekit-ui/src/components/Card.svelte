<script lang="ts">
  export let title: string | undefined = undefined;
  export let subtitle: string | undefined = undefined;
  export let padding = true;
  export let shadow = true;
  export let border = true;
  export let rounded = true;
  
  $: classes = `
    bg-white
    ${padding ? 'p-6' : ''}
    ${shadow ? 'shadow-md' : ''}
    ${border ? 'border border-gray-200' : ''}
    ${rounded ? 'rounded-lg' : ''}
  `;
</script>

<div class={classes} {...$$restProps}>
  {#if title}
    <div class="mb-4">
      <h3 class="text-lg font-medium text-gray-900">{title}</h3>
      {#if subtitle}
        <p class="mt-1 text-sm text-gray-500">{subtitle}</p>
      {/if}
    </div>
  {/if}
  <slot />
</div>
