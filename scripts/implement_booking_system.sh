#!/bin/bash

# Create directories if they don't exist
mkdir -p src/components/booking
mkdir -p src/pages/booking
mkdir -p src/api

# Copy the booking components
echo "Creating booking components..."
cp -f src/components/booking/BookingForm.jsx src/components/booking/BookingForm.jsx

# Copy the booking pages
echo "Creating booking pages..."
cp -f src/pages/booking/BookingPage.jsx src/pages/booking/BookingPage.jsx
cp -f src/pages/booking/BookingConfirmationPage.jsx src/pages/booking/BookingConfirmationPage.jsx
cp -f src/pages/booking/BookingDetailsPage.jsx src/pages/booking/BookingDetailsPage.jsx
cp -f src/pages/booking/BookingsListPage.jsx src/pages/booking/BookingsListPage.jsx

# Copy the API files
echo "Creating API files..."
cp -f src/api/bookingApi.js src/api/bookingApi.js

echo "Booking system implementation complete!"
