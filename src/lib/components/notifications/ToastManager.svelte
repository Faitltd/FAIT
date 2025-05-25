<script lang="ts">
  import { toasts, removeToast, type Toast } from './toast';

  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };
</script>

<div class="fixed top-4 right-4 z-50 space-y-2">
  {#each $toasts as toast (toast.id)}
    <div class="border rounded-lg p-4 shadow-lg max-w-sm {typeClasses[toast.type]}">
      <div class="flex justify-between items-start">
        <div>
          <h4 class="font-semibold">{toast.title}</h4>
          {#if toast.message}
            <p class="text-sm mt-1">{toast.message}</p>
          {/if}
        </div>
        <button
          class="ml-4 text-gray-400 hover:text-gray-600"
          on:click={() => removeToast(toast.id)}
        >
          ×
        </button>
      </div>
    </div>
  {/each}
</div>
