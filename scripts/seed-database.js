#!/usr/bin/env node

/**
 * Database Seeding Script
 * 
 * This script populates the FAIT Co-op database with sample data for development and testing.
 */

import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Sample data generators
const generateProfile = (userType = 'client', customData = {}) => ({
  id: faker.string.uuid(),
  user_type: userType,
  full_name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  address: faker.location.streetAddress(),
  city: faker.location.city(),
  state: faker.location.state({ abbreviated: true }),
  zip_code: faker.location.zipCode(),
  avatar_url: faker.image.avatar(),
  bio: userType === 'service_agent' ? faker.lorem.paragraph() : null,
  ...customData
});

const generateServicePackage = (serviceAgentId) => ({
  id: faker.string.uuid(),
  service_agent_id: serviceAgentId,
  title: faker.helpers.arrayElement([
    'Basic Plumbing Repair',
    'Electrical Installation',
    'Kitchen Renovation',
    'Bathroom Remodel',
    'Painting Service',
    'Flooring Installation',
    'HVAC Maintenance',
    'Roofing Repair',
    'Landscaping Service',
    'Handyman Special'
  ]),
  description: faker.lorem.paragraphs(2),
  price: faker.number.float({ min: 100, max: 5000, fractionDigits: 2 }),
  duration: faker.helpers.arrayElement(['2 hours', '4 hours', '1 day', '2 days', '1 week']),
  scope: faker.helpers.arrayElements([
    'Material procurement',
    'Labor and installation',
    'Cleanup and disposal',
    'Quality inspection',
    'Warranty coverage',
    'Follow-up service'
  ], { min: 2, max: 4 }),
  exclusions: faker.helpers.arrayElements([
    'Permits and inspections',
    'Structural modifications',
    'Electrical permits',
    'Plumbing permits'
  ], { min: 0, max: 2 }),
  category: faker.helpers.arrayElement([
    'plumbing',
    'electrical',
    'renovation',
    'maintenance',
    'landscaping',
    'painting'
  ]),
  is_active: faker.datatype.boolean(0.9)
});

const generateBooking = (clientId, servicePackageId, servicePackage) => ({
  id: faker.string.uuid(),
  client_id: clientId,
  service_package_id: servicePackageId,
  scheduled_date: faker.date.future().toISOString(),
  status: faker.helpers.arrayElement(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']),
  total_amount: servicePackage.price,
  notes: faker.lorem.sentence(),
  address: faker.location.streetAddress(),
  city: faker.location.city(),
  state: faker.location.state({ abbreviated: true }),
  zip_code: faker.location.zipCode()
});

const generateVerification = (serviceAgentId) => ({
  id: faker.string.uuid(),
  service_agent_id: serviceAgentId,
  license_number: faker.string.alphanumeric(10).toUpperCase(),
  license_type: faker.helpers.arrayElement(['General Contractor', 'Electrical', 'Plumbing', 'HVAC']),
  license_expiry: faker.date.future().toISOString().split('T')[0],
  insurance_provider: faker.company.name(),
  insurance_expiry: faker.date.future().toISOString().split('T')[0],
  background_check_status: faker.helpers.arrayElement(['pending', 'approved', 'rejected']),
  background_check_date: faker.date.recent().toISOString(),
  is_verified: faker.datatype.boolean(0.7),
  admin_verified: faker.datatype.boolean(0.8),
  admin_verified_at: faker.date.recent().toISOString()
});

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Database connection failed:', testError);
      return;
    }

    console.log('✅ Database connection successful');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await supabase.from('warranty_claims').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_packages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_agent_verifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('points_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Create admin user
    console.log('👑 Creating admin user...');
    const adminProfile = generateProfile('admin', {
      full_name: 'FAIT Admin',
      email: 'admin@fait-coop.com'
    });

    const { error: adminError } = await supabase
      .from('profiles')
      .insert([adminProfile]);

    if (adminError) {
      console.error('❌ Error creating admin user:', adminError);
    } else {
      console.log('✅ Admin user created');
    }

    // Create clients
    console.log('👥 Creating client profiles...');
    const clients = Array.from({ length: 10 }, () => generateProfile('client'));
    
    const { error: clientsError } = await supabase
      .from('profiles')
      .insert(clients);

    if (clientsError) {
      console.error('❌ Error creating clients:', clientsError);
      return;
    }
    console.log(`✅ Created ${clients.length} client profiles`);

    // Create service agents
    console.log('🔧 Creating service agent profiles...');
    const serviceAgents = Array.from({ length: 15 }, () => generateProfile('service_agent'));
    
    const { error: agentsError } = await supabase
      .from('profiles')
      .insert(serviceAgents);

    if (agentsError) {
      console.error('❌ Error creating service agents:', agentsError);
      return;
    }
    console.log(`✅ Created ${serviceAgents.length} service agent profiles`);

    // Create verifications for service agents
    console.log('📋 Creating service agent verifications...');
    const verifications = serviceAgents.map(agent => generateVerification(agent.id));
    
    const { error: verificationsError } = await supabase
      .from('service_agent_verifications')
      .insert(verifications);

    if (verificationsError) {
      console.error('❌ Error creating verifications:', verificationsError);
    } else {
      console.log(`✅ Created ${verifications.length} verifications`);
    }

    // Create service packages
    console.log('📦 Creating service packages...');
    const servicePackages = [];
    serviceAgents.forEach(agent => {
      const packageCount = faker.number.int({ min: 1, max: 4 });
      for (let i = 0; i < packageCount; i++) {
        servicePackages.push(generateServicePackage(agent.id));
      }
    });
    
    const { error: packagesError } = await supabase
      .from('service_packages')
      .insert(servicePackages);

    if (packagesError) {
      console.error('❌ Error creating service packages:', packagesError);
      return;
    }
    console.log(`✅ Created ${servicePackages.length} service packages`);

    // Create bookings
    console.log('📅 Creating bookings...');
    const bookings = [];
    clients.forEach(client => {
      const bookingCount = faker.number.int({ min: 0, max: 3 });
      for (let i = 0; i < bookingCount; i++) {
        const randomPackage = faker.helpers.arrayElement(servicePackages);
        bookings.push(generateBooking(client.id, randomPackage.id, randomPackage));
      }
    });
    
    const { error: bookingsError } = await supabase
      .from('bookings')
      .insert(bookings);

    if (bookingsError) {
      console.error('❌ Error creating bookings:', bookingsError);
    } else {
      console.log(`✅ Created ${bookings.length} bookings`);
    }

    // Create points transactions
    console.log('🎯 Creating points transactions...');
    const pointsTransactions = [];
    [...clients, ...serviceAgents].forEach(user => {
      const transactionCount = faker.number.int({ min: 0, max: 5 });
      for (let i = 0; i < transactionCount; i++) {
        pointsTransactions.push({
          id: faker.string.uuid(),
          user_id: user.id,
          points_amount: faker.number.int({ min: 10, max: 500 }),
          transaction_type: faker.helpers.arrayElement(['earned', 'spent']),
          description: faker.helpers.arrayElement([
            'Booking completion bonus',
            'Profile completion',
            'Referral bonus',
            'Service redemption',
            'Monthly bonus'
          ]),
          booking_id: bookings.length > 0 ? faker.helpers.arrayElement(bookings).id : null
        });
      }
    });
    
    const { error: pointsError } = await supabase
      .from('points_transactions')
      .insert(pointsTransactions);

    if (pointsError) {
      console.error('❌ Error creating points transactions:', pointsError);
    } else {
      console.log(`✅ Created ${pointsTransactions.length} points transactions`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Admin users: 1`);
    console.log(`- Clients: ${clients.length}`);
    console.log(`- Service agents: ${serviceAgents.length}`);
    console.log(`- Service packages: ${servicePackages.length}`);
    console.log(`- Bookings: ${bookings.length}`);
    console.log(`- Points transactions: ${pointsTransactions.length}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

// Run the seeding script
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };
