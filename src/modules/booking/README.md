# Booking Module

The Booking module handles service booking and scheduling functionality for the FAIT Co-op platform.

## Features

- Booking wizard
- Calendar integration
- Availability management
- Booking confirmation
- Booking history
- Booking details
- Booking management for service agents
- Booking notifications

## Directory Structure

```
/booking
  /components
    /wizard        # Booking wizard components
    /calendar      # Calendar components
    /availability  # Availability management components
    /confirmation  # Booking confirmation components
    /history       # Booking history components
    /details       # Booking details components
    /management    # Booking management components
  /hooks           # Booking-related hooks
  /services        # Booking API services
  /types           # Booking type definitions
  /utils           # Booking utility functions
  /contexts        # Booking context providers
  index.ts         # Public API exports
```

## Usage

Import components and utilities from the Booking module:

```typescript
import { BookingWizard } from '@/modules/booking/components/wizard';
import { BookingCalendar } from '@/modules/booking/components/calendar';
import { AvailabilityManager } from '@/modules/booking/components/availability';
import { BookingConfirmation } from '@/modules/booking/components/confirmation';
```

## Booking Wizard

The Booking module provides a step-by-step wizard for booking services:

```typescript
import { BookingWizard } from '@/modules/booking/components/wizard';

function BookServicePage({ serviceId }) {
  return <BookingWizard serviceId={serviceId} />;
}
```

## Calendar Integration

Display and manage bookings with calendar integration:

```typescript
import { BookingCalendar } from '@/modules/booking/components/calendar';

function CalendarPage() {
  return <BookingCalendar />;
}
```

## Availability Management

Service agents can manage their availability:

```typescript
import { AvailabilityManager } from '@/modules/booking/components/availability';

function AvailabilityPage() {
  return <AvailabilityManager />;
}
```

## Booking Confirmation

Confirm bookings and display booking details:

```typescript
import { BookingConfirmation } from '@/modules/booking/components/confirmation';

function BookingConfirmationPage({ bookingId }) {
  return <BookingConfirmation bookingId={bookingId} />;
}
```

## Booking History

View booking history:

```typescript
import { BookingHistory } from '@/modules/booking/components/history';

function BookingHistoryPage() {
  return <BookingHistory />;
}
```
