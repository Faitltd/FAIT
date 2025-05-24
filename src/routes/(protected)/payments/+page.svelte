<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { payments } from '$lib/stores/payments';
  import type { PaymentMethod, Transaction } from '$lib/stores/payments';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { showSuccess, showError } from '$lib/components/notifications/toast';

  // State
  let isLoading = true;
  let error = null;
  let showAddCardForm = false;
  let showAddBankForm = false;

  // Form state
  let cardForm = {
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    isDefault: false
  };

  let bankForm = {
    accountNumber: '',
    routingNumber: '',
    accountHolderName: '',
    bankName: '',
    isDefault: false
  };

  // Load payment methods and transactions
  onMount(async () => {
    if ($auth.user) {
      isLoading = true;
      error = null;

      // Load payment methods
      const methodsResult = await payments.loadUserPaymentMethods($auth.user.id);

      // Load transactions
      const transactionsResult = await payments.loadUserTransactions($auth.user.id);

      isLoading = false;

      if (!methodsResult.success) {
        error = methodsResult.error || 'Failed to load payment methods';
      } else if (!transactionsResult.success) {
        error = transactionsResult.error || 'Failed to load transactions';
      }
    }
  });

  // Add credit card
  async function addCreditCard() {
    if (!$auth.user) return;

    // Validate form
    if (!cardForm.cardNumber || !cardForm.cardholderName || !cardForm.expiryMonth || !cardForm.expiryYear || !cardForm.cvc) {
      error = 'Please fill in all card details';
      return;
    }

    // Add payment method
    const result = await payments.addPaymentMethod({
      userId: $auth.user.id,
      type: 'card',
      isDefault: cardForm.isDefault,
      cardBrand: getCardBrand(cardForm.cardNumber),
      last4: cardForm.cardNumber.slice(-4),
      expiryMonth: cardForm.expiryMonth,
      expiryYear: cardForm.expiryYear
    });

    if (result.success) {
      // Reset form
      cardForm = {
        cardNumber: '',
        cardholderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: '',
        isDefault: false
      };

      // Hide form
      showAddCardForm = false;

      // Show success message
      showSuccess('Card Added', 'Your credit card has been added successfully.');
    } else {
      error = result.error || 'Failed to add credit card';
    }
  }

  // Add bank account
  async function addBankAccount() {
    if (!$auth.user) return;

    // Validate form
    if (!bankForm.accountNumber || !bankForm.routingNumber || !bankForm.accountHolderName || !bankForm.bankName) {
      error = 'Please fill in all bank account details';
      return;
    }

    // Add payment method
    const result = await payments.addPaymentMethod({
      userId: $auth.user.id,
      type: 'bank',
      isDefault: bankForm.isDefault,
      bankName: bankForm.bankName,
      accountLast4: bankForm.accountNumber.slice(-4)
    });

    if (result.success) {
      // Reset form
      bankForm = {
        accountNumber: '',
        routingNumber: '',
        accountHolderName: '',
        bankName: '',
        isDefault: false
      };

      // Hide form
      showAddBankForm = false;

      // Show success message
      showSuccess('Bank Account Added', 'Your bank account has been added successfully.');
    } else {
      error = result.error || 'Failed to add bank account';
    }
  }

  // Remove payment method
  async function removePaymentMethod(id: string) {
    const result = await payments.removePaymentMethod(id);

    if (result.success) {
      showSuccess('Payment Method Removed', 'Your payment method has been removed successfully.');
    } else {
      showError('Error', result.error || 'Failed to remove payment method');
    }
  }

  // Set default payment method
  async function setDefaultPaymentMethod(id: string) {
    const result = await payments.setDefaultPaymentMethod(id);

    if (result.success) {
      showSuccess('Default Updated', 'Your default payment method has been updated.');
    } else {
      showError('Error', result.error || 'Failed to update default payment method');
    }
  }

  // Get card brand from card number
  function getCardBrand(cardNumber: string): string {
    if (cardNumber.startsWith('4')) {
      return 'Visa';
    } else if (cardNumber.startsWith('5')) {
      return 'Mastercard';
    } else if (cardNumber.startsWith('3')) {
      return 'American Express';
    } else if (cardNumber.startsWith('6')) {
      return 'Discover';
    } else {
      return 'Unknown';
    }
  }

  // Format currency
  function formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  }

  // Format date
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<svelte:head>
  <title>Payment Methods - FAIT</title>
  <meta name="description" content="Manage your payment methods and view transaction history on the FAIT platform." />
</svelte:head>

<section class="bg-fait-light py-8">
  <div class="container-custom">
    <h1 class="text-3xl font-ivy font-bold text-fait-dark mb-6">Payment Methods</h1>

    {#if isLoading}
      <div class="bg-white rounded-lg shadow-md p-8 text-center">
        <p class="text-gray-600">Loading payment information...</p>
      </div>
    {:else if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        <p>{error}</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Payment Methods -->
        <div class="lg:col-span-2">
          <Card variant="elevated" padding="lg">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold">Your Payment Methods</h2>
              <div class="flex space-x-2">
                <Button
                  variant={showAddCardForm ? 'primary' : 'outline'}
                  size="sm"
                  on:click={() => {
                    showAddCardForm = !showAddCardForm;
                    showAddBankForm = false;
                  }}
                >
                  {showAddCardForm ? 'Cancel' : 'Add Card'}
                </Button>
                <Button
                  variant={showAddBankForm ? 'primary' : 'outline'}
                  size="sm"
                  on:click={() => {
                    showAddBankForm = !showAddBankForm;
                    showAddCardForm = false;
                  }}
                >
                  {showAddBankForm ? 'Cancel' : 'Add Bank Account'}
                </Button>
              </div>
            </div>

            {#if showAddCardForm}
              <div class="bg-gray-50 p-4 rounded-md mb-6">
                <h3 class="font-bold mb-4">Add Credit Card</h3>
                <form on:submit|preventDefault={addCreditCard} class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label for="cardNumber" class="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        id="cardNumber"
                        bind:value={cardForm.cardNumber}
                        required
                        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div>
                      <label for="cardholderName" class="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        id="cardholderName"
                        bind:value={cardForm.cardholderName}
                        required
                        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label for="expiry" class="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <div class="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          id="expiryMonth"
                          bind:value={cardForm.expiryMonth}
                          required
                          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
                          placeholder="MM"
                          maxlength="2"
                        />
                        <input
                          type="text"
                          id="expiryYear"
                          bind:value={cardForm.expiryYear}
                          required
                          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
                          placeholder="YY"
                          maxlength="2"
                        />
                      </div>
                    </div>
                    <div>
                      <label for="cvc" class="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                      <input
                        type="text"
                        id="cvc"
                        bind:value={cardForm.cvc}
                        required
                        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
                        placeholder="123"
                        maxlength="4"
                      />
                    </div>
                  </div>

                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      id="defaultCard"
                      bind:checked={cardForm.isDefault}
                      class="h-4 w-4 text-fait-blue focus:ring-fait-blue border-gray-300 rounded"
                    />
                    <label for="defaultCard" class="ml-2 block text-sm text-gray-700">Set as default payment method</label>
                  </div>

                  <div class="flex justify-end">
                    <Button type="submit" variant="primary" disabled={$payments.isLoading}>
                      {$payments.isLoading ? 'Adding...' : 'Add Card'}
                    </Button>
                  </div>
                </form>
              </div>
            {/if}

            {#if showAddBankForm}
              <div class="bg-gray-50 p-4 rounded-md mb-6">
                <h3 class="font-bold mb-4">Add Bank Account</h3>
                <form on:submit|preventDefault={addBankAccount} class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label for="accountNumber" class="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                      <input
                        type="text"
                        id="accountNumber"
                        bind:value={bankForm.accountNumber}
                        required
                        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
                        placeholder="123456789"
                      />
                    </div>
                    <div>
                      <label for="routingNumber" class="block text-sm font-medium text-gray-700 mb-1">Routing Number</label>
                      <input
                        type="text"
                        id="routingNumber"
                        bind:value={bankForm.routingNumber}
                        required
                        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
                        placeholder="123456789"
                      />
                    </div>
                    <div>
                      <label for="accountHolderName" class="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        id="accountHolderName"
                        bind:value={bankForm.accountHolderName}
                        required
                        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label for="bankName" class="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        id="bankName"
                        bind:value={bankForm.bankName}
                        required
                        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
                        placeholder="Bank of America"
                      />
                    </div>
                  </div>

                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      id="defaultBank"
                      bind:checked={bankForm.isDefault}
                      class="h-4 w-4 text-fait-blue focus:ring-fait-blue border-gray-300 rounded"
                    />
                    <label for="defaultBank" class="ml-2 block text-sm text-gray-700">Set as default payment method</label>
                  </div>

                  <div class="flex justify-end">
                    <Button type="submit" variant="primary" disabled={$payments.isLoading}>
                      {$payments.isLoading ? 'Adding...' : 'Add Bank Account'}
                    </Button>
                  </div>
                </form>
              </div>
            {/if}

            {#if $payments.paymentMethods.length === 0}
              <div class="text-center py-8">
                <p class="text-gray-500">No payment methods added yet</p>
                <p class="text-sm text-gray-500 mt-1">Add a credit card or bank account to get started</p>
              </div>
            {:else}
              <div class="space-y-4">
                {#each $payments.paymentMethods as method}
                  <div class="border border-gray-200 rounded-md p-4">
                    <div class="flex justify-between items-start">
                      <div>
                        {#if method.type === 'card'}
                          <div class="flex items-center">
                            <div class="w-10 h-6 bg-gray-100 rounded flex items-center justify-center mr-3">
                              <span class="text-sm font-medium">{method.cardBrand}</span>
                            </div>
                            <div>
                              <p class="font-medium">•••• {method.last4}</p>
                              <p class="text-sm text-gray-500">Expires {method.expiryMonth}/{method.expiryYear}</p>
                            </div>
                          </div>
                        {:else}
                          <div class="flex items-center">
                            <div class="w-10 h-6 bg-gray-100 rounded flex items-center justify-center mr-3">
                              <span class="text-sm font-medium">Bank</span>
                            </div>
                            <div>
                              <p class="font-medium">{method.bankName}</p>
                              <p class="text-sm text-gray-500">•••• {method.accountLast4}</p>
                            </div>
                          </div>
                        {/if}
                      </div>

                      <div class="flex items-center space-x-2">
                        {#if method.isDefault}
                          <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Default</span>
                        {:else}
                          <button
                            class="text-sm text-fait-blue hover:underline"
                            on:click={() => setDefaultPaymentMethod(method.id)}
                            disabled={$payments.isLoading}
                          >
                            Set as default
                          </button>
                        {/if}

                        {#if !method.isDefault}
                          <button
                            class="text-sm text-red-600 hover:underline"
                            on:click={() => removePaymentMethod(method.id)}
                            disabled={$payments.isLoading}
                          >
                            Remove
                          </button>
                        {/if}
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </Card>
        </div>

        <!-- Transaction History -->
        <div class="lg:col-span-1">
          <Card variant="elevated" padding="lg">
            <h2 class="text-xl font-bold mb-6">Transaction History</h2>

            {#if $payments.transactions.length === 0}
              <div class="text-center py-8">
                <p class="text-gray-500">No transactions yet</p>
              </div>
            {:else}
              <div class="space-y-4">
                {#each $payments.transactions as transaction}
                  <div class="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                    <div class="flex justify-between items-start">
                      <div>
                        <p class="font-medium">{transaction.description}</p>
                        <p class="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                      </div>
                      <div class="text-right">
                        <p class="font-medium {transaction.type === 'payment' ? 'text-red-600' : 'text-green-600'}">
                          {transaction.type === 'payment' ? '-' : '+'}{formatCurrency(transaction.amount, transaction.currency)}
                        </p>
                        <p class="text-xs {
                          transaction.status === 'completed' ? 'text-green-600' :
                          transaction.status === 'pending' ? 'text-yellow-600' :
                          'text-red-600'
                        }">
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </Card>
        </div>
      </div>
    {/if}
  </div>
</section>
