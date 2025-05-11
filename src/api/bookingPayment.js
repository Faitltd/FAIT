import supabase from '../utils/supabaseClient';;
import Stripe from 'stripe';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const stripeSecretKey = import.meta.env.VITE_STRIPE_SECRET_KEY;

// Using singleton Supabase client;
const stripe = new Stripe(stripeSecretKey);

export async function createBookingPaymentIntent(bookingId) {
  try {
    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        client_id,
        service_agent_id,
        service_id,
        price,
        status,
        services(name)
      `)
      .eq('id', bookingId)
      .single();
    
    if (bookingError) throw bookingError;
    
    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('profiles')
      .select('email, stripe_customer_id')
      .eq('id', booking.client_id)
      .single();
    
    if (clientError) throw clientError;
    
    // Create or retrieve Stripe customer
    let customerId = client.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: client.email,
        metadata: { userId: booking.client_id }
      });
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', booking.client_id);
    }
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.price * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      metadata: {
        booking_id: booking.id,
        service_name: booking.services.name,
        service_agent_id: booking.service_agent_id
      },
      description: `Payment for ${booking.services.name}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    // Update booking with payment intent ID
    await supabase
      .from('bookings')
      .update({
        payment_intent_id: paymentIntent.id,
        payment_status: 'pending'
      })
      .eq('id', booking.id);
    
    return {
      clientSecret: paymentIntent.client_secret,
      bookingId: booking.id,
      amount: booking.price
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

export async function handlePaymentWebhook(event) {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata.booking_id;
        
        if (bookingId) {
          // Update booking status
          await supabase
            .from('bookings')
            .update({
              status: 'confirmed',
              payment_status: 'paid',
              paid_at: new Date().toISOString()
            })
            .eq('id', bookingId);
          
          // Create transaction record
          await supabase
            .from('transactions')
            .insert({
              booking_id: bookingId,
              client_id: paymentIntent.metadata.client_id,
              service_agent_id: paymentIntent.metadata.service_agent_id,
              amount: paymentIntent.amount / 100, // Convert from cents
              payment_method: 'stripe',
              payment_intent_id: paymentIntent.id,
              status: 'completed'
            });
          
          // Notify service agent about confirmed booking
          // This would typically be done through a notification system
        }
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        const failedBookingId = failedPayment.metadata.booking_id;
        
        if (failedBookingId) {
          // Update booking payment status
          await supabase
            .from('bookings')
            .update({
              payment_status: 'failed'
            })
            .eq('id', failedBookingId);
        }
        break;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error handling payment webhook:', error);
    throw error;
  }
}

export async function processPayPalPayment(bookingId, paypalOrderId, paypalPayerId) {
  try {
    // In a real implementation, you would verify the PayPal payment with the PayPal API
    // For this example, we'll assume the payment was successful
    
    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        client_id,
        service_agent_id,
        service_id,
        price
      `)
      .eq('id', bookingId)
      .single();
    
    if (bookingError) throw bookingError;
    
    // Update booking status
    await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        payment_method: 'paypal',
        paypal_order_id: paypalOrderId,
        paypal_payer_id: paypalPayerId
      })
      .eq('id', booking.id);
    
    // Create transaction record
    await supabase
      .from('transactions')
      .insert({
        booking_id: booking.id,
        client_id: booking.client_id,
        service_agent_id: booking.service_agent_id,
        amount: booking.price,
        payment_method: 'paypal',
        paypal_order_id: paypalOrderId,
        status: 'completed'
      });
    
    return { success: true };
  } catch (error) {
    console.error('Error processing PayPal payment:', error);
    throw error;
  }
}
