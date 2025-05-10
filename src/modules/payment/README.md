# Payment Module

The Payment module handles payment processing and financial management for the FAIT Co-op platform.

## Features

- Stripe integration
- Invoice management
- Payment history
- Subscription management
- Commission tracking
- Payment methods
- Refund processing
- Payment notifications
- Financial reporting
- Tax calculation

## Directory Structure

```
/payment
  /components
    /checkout       # Checkout components
    /invoices       # Invoice components
    /subscriptions  # Subscription components
    /methods        # Payment method components
    /history        # Payment history components
    /reports        # Financial reporting components
  /hooks            # Payment-related hooks
  /services         # Payment API services
  /types            # Payment type definitions
  /utils            # Payment utility functions
  /contexts         # Payment context providers
  index.ts          # Public API exports
```

## Usage

Import components and utilities from the Payment module:

```typescript
import { CheckoutForm } from '@/modules/payment/components/checkout';
import { InvoiceList } from '@/modules/payment/components/invoices';
import { SubscriptionManager } from '@/modules/payment/components/subscriptions';
import { PaymentMethodForm } from '@/modules/payment/components/methods';
```

## Checkout

The Payment module provides components for processing payments:

```typescript
import { CheckoutForm } from '@/modules/payment/components/checkout';

function CheckoutPage({ amount, description }) {
  return <CheckoutForm amount={amount} description={description} />;
}
```

## Invoices

Manage and display invoices:

```typescript
import { InvoiceList, InvoiceDetails } from '@/modules/payment/components/invoices';

function InvoicesPage() {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  return (
    <div className="flex">
      <InvoiceList onSelectInvoice={setSelectedInvoice} />
      {selectedInvoice && (
        <InvoiceDetails invoiceId={selectedInvoice.id} />
      )}
    </div>
  );
}
```

## Subscriptions

Manage subscription plans and user subscriptions:

```typescript
import { SubscriptionManager } from '@/modules/payment/components/subscriptions';

function SubscriptionPage() {
  return <SubscriptionManager />;
}
```

## Payment Methods

Add and manage payment methods:

```typescript
import { PaymentMethodForm, PaymentMethodList } from '@/modules/payment/components/methods';

function PaymentMethodsPage() {
  return (
    <div>
      <PaymentMethodList />
      <PaymentMethodForm />
    </div>
  );
}
```

## Payment History

View payment history:

```typescript
import { PaymentHistory } from '@/modules/payment/components/history';

function PaymentHistoryPage() {
  return <PaymentHistory />;
}
```
