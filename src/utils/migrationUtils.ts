import { getSimulatedBookings, clearSimulatedBookings } from './simulatedBookings';

/**
 * Migrate simulated bookings to real bookings in the database
 * @param supabase Supabase client
 * @param userId User ID
 * @returns Object with migration results
 */
export const migrateToRealBookings = async (supabase: any, userId: string) => {
  try {
    // Get all simulated bookings
    const simulatedBookings = getSimulatedBookings(userId);

    if (simulatedBookings.length === 0) {
      console.log('No simulated bookings to migrate');
      return { migrated: 0, total: 0 };
    }

    console.log(`Found ${simulatedBookings.length} simulated bookings to migrate`);

    // Count of successfully migrated bookings
    let migratedCount = 0;
    const errors: any[] = [];

    // Try to create each booking in the real database
    for (const booking of simulatedBookings) {
      try {
        console.log(`Migrating booking: ${booking.id}`);

        // Create the booking using the RPC function
        const { data, error } = await supabase.rpc('create_booking', {
          client_id: userId,
          service_package_id: booking.service_package_id,
          scheduled_date: booking.scheduled_date,
          total_amount: booking.total_amount,
          notes: booking.notes || null,
          status: 'pending'
        });

        if (error) {
          console.error('Error migrating booking:', error);
          errors.push({ bookingId: booking.id, error });
          continue;
        }

        // Create points transaction for the booking if it was successful
        if (data && data.id) {
          const pointsAmount = Math.floor(booking.total_amount);
          const { data: pointsData, error: pointsError } = await supabase.rpc('create_points_transaction', {
            p_user_id: userId,
            p_points_amount: pointsAmount,
            p_transaction_type: 'earned',
            p_description: `Points earned for booking service: ${booking.service_package.title || 'Service'}`,
            p_booking_id: data.id
          });

          if (pointsError) {
            console.warn('Error creating points transaction:', pointsError);
            // Continue anyway, points are not critical
          } else {
            console.log('Points transaction created:', pointsData);
          }
        }

        migratedCount++;
      } catch (err) {
        console.error('Error in migration:', err);
        errors.push({ bookingId: booking.id, error: err });
      }
    }

    // Only clear simulated bookings if all were migrated successfully
    if (migratedCount === simulatedBookings.length) {
      clearSimulatedBookings();
    }

    return {
      migrated: migratedCount,
      total: simulatedBookings.length,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error('Migration error:', error);
    return { migrated: 0, total: 0, error };
  }
};

/**
 * Check if the database is properly set up for real bookings
 * @param supabase Supabase client
 * @returns Boolean indicating if the database is ready
 */
export const checkDatabaseSetup = async (supabase: any) => {
  try {
    // Try to call the create_booking function with invalid parameters
    // This should fail with a specific error if the function exists
    const { error } = await supabase.rpc('create_booking', {
      client_id: '00000000-0000-0000-0000-000000000000',
      service_package_id: '00000000-0000-0000-0000-000000000000',
      scheduled_date: new Date().toISOString(),
      total_amount: 0
    });

    // If we get a specific error about the client_id not matching auth.uid(),
    // then the function exists and is working correctly
    if (error && (
      error.message.includes('You can only create bookings for yourself') ||
      error.message.includes('Service package not found')
    )) {
      return { ready: true };
    }

    // If we get a different error, the function might not exist
    if (error && (
      error.message.includes('function') &&
      error.message.includes('does not exist')
    )) {
      return {
        ready: false,
        reason: 'The create_booking function does not exist in the database.'
      };
    }

    // For any other error, return the details
    if (error) {
      return {
        ready: false,
        reason: `Database error: ${error.message}`,
        error
      };
    }

    // If no error, something unexpected happened
    return {
      ready: false,
      reason: 'Unexpected response from database check.'
    };
  } catch (error: any) {
    return {
      ready: false,
      reason: `Error checking database: ${error.message}`,
      error
    };
  }
};
