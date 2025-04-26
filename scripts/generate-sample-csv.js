#!/usr/bin/env node

/**
 * Script to generate sample CSV files for testing the import/export functionality
 * 
 * Usage:
 *   node generate-sample-csv.js --type <service_agents|services> --count <number> --output <file>
 * 
 * Options:
 *   --type <type>      Type of data to generate (service_agents or services)
 *   --count <number>   Number of records to generate (default: 100)
 *   --output <file>    Output file path (default: ./sample_data.csv)
 */

import fs from 'fs';
import path from 'path';
import { faker } from '@faker-js/faker';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  type: 'service_agents',
  count: 100,
  output: './sample_data.csv'
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--type' && i + 1 < args.length) {
    options.type = args[++i];
  } else if (arg === '--count' && i + 1 < args.length) {
    options.count = parseInt(args[++i], 10);
  } else if (arg === '--output' && i + 1 < args.length) {
    options.output = args[++i];
  }
}

// Validate options
if (!['service_agents', 'services'].includes(options.type)) {
  console.error('Error: Type must be either "service_agents" or "services"');
  process.exit(1);
}

if (isNaN(options.count) || options.count <= 0) {
  console.error('Error: Count must be a positive number');
  process.exit(1);
}

// Generate service agent data
function generateServiceAgentData(count) {
  const header = 'id,business_name,contact_name,phone,email,address,city,state,zip_code,status,bio,website,profile_image_url,license_number,license_type,insurance_provider,insurance_policy_number,insurance_expiration_date,verified,verification_date,subscription_tier,subscription_status,subscription_start_date,subscription_end_date,average_rating,total_reviews,total_bookings,total_completed_bookings,total_cancelled_bookings,total_revenue,commission_rate,tax_id,bank_account_name,bank_account_type,bank_routing_number,bank_account_number,stripe_account_id,square_account_id,notes';
  
  const rows = [];
  
  for (let i = 0; i < count; i++) {
    const id = faker.string.uuid();
    const businessName = faker.company.name();
    const contactName = faker.person.fullName();
    const phone = faker.phone.number();
    const email = faker.internet.email();
    const address = faker.location.streetAddress();
    const city = faker.location.city();
    const state = faker.location.state({ abbreviated: true });
    const zipCode = faker.location.zipCode();
    const status = faker.helpers.arrayElement(['active', 'pending', 'inactive']);
    const bio = faker.lorem.paragraph();
    const website = faker.internet.url();
    const profileImageUrl = faker.image.avatar();
    const licenseNumber = faker.string.alphanumeric(10);
    const licenseType = faker.helpers.arrayElement(['General Contractor', 'Plumber', 'Electrician', 'HVAC']);
    const insuranceProvider = faker.company.name();
    const insurancePolicyNumber = faker.string.alphanumeric(12);
    const insuranceExpirationDate = faker.date.future().toISOString().split('T')[0];
    const verified = faker.datatype.boolean();
    const verificationDate = faker.date.past().toISOString().split('T')[0];
    const subscriptionTier = faker.helpers.arrayElement(['free', 'pro', 'business']);
    const subscriptionStatus = faker.helpers.arrayElement(['active', 'canceled', 'past_due']);
    const subscriptionStartDate = faker.date.past().toISOString().split('T')[0];
    const subscriptionEndDate = faker.date.future().toISOString().split('T')[0];
    const averageRating = faker.number.float({ min: 1, max: 5, precision: 0.1 });
    const totalReviews = faker.number.int({ min: 0, max: 100 });
    const totalBookings = faker.number.int({ min: 0, max: 200 });
    const totalCompletedBookings = faker.number.int({ min: 0, max: totalBookings });
    const totalCancelledBookings = faker.number.int({ min: 0, max: totalBookings - totalCompletedBookings });
    const totalRevenue = faker.number.float({ min: 0, max: 50000, precision: 0.01 });
    const commissionRate = faker.number.float({ min: 0.05, max: 0.2, precision: 0.01 });
    const taxId = faker.string.alphanumeric(9);
    const bankAccountName = faker.finance.accountName();
    const bankAccountType = faker.helpers.arrayElement(['checking', 'savings']);
    const bankRoutingNumber = faker.finance.routingNumber();
    const bankAccountNumber = faker.finance.accountNumber();
    const stripeAccountId = `acct_${faker.string.alphanumeric(16)}`;
    const squareAccountId = `sq_${faker.string.alphanumeric(16)}`;
    const notes = faker.lorem.sentence();
    
    rows.push(`${id},"${escapeCSV(businessName)}","${escapeCSV(contactName)}","${escapeCSV(phone)}","${escapeCSV(email)}","${escapeCSV(address)}","${escapeCSV(city)}",${state},${zipCode},${status},"${escapeCSV(bio)}",${website},${profileImageUrl},${licenseNumber},${licenseType},${insuranceProvider},${insurancePolicyNumber},${insuranceExpirationDate},${verified},${verificationDate},${subscriptionTier},${subscriptionStatus},${subscriptionStartDate},${subscriptionEndDate},${averageRating},${totalReviews},${totalBookings},${totalCompletedBookings},${totalCancelledBookings},${totalRevenue},${commissionRate},${taxId},"${escapeCSV(bankAccountName)}",${bankAccountType},${bankRoutingNumber},${bankAccountNumber},${stripeAccountId},${squareAccountId},"${escapeCSV(notes)}"`);
  }
  
  return header + '\n' + rows.join('\n');
}

// Generate service data
function generateServiceData(count) {
  const header = 'id,service_agent_id,title,description,category,subcategory,price,price_type,duration,availability,zip_code,service_radius,status,featured,tags,image_urls,average_rating,total_reviews,total_bookings';
  
  const rows = [];
  
  for (let i = 0; i < count; i++) {
    const id = faker.string.uuid();
    const serviceAgentId = faker.string.uuid();
    const title = faker.commerce.productName();
    const description = faker.lorem.paragraph();
    const category = faker.helpers.arrayElement(['Plumbing', 'Electrical', 'HVAC', 'Carpentry', 'Painting', 'Landscaping']);
    const subcategory = faker.helpers.arrayElement(['Residential', 'Commercial', 'Emergency', 'Maintenance']);
    const price = faker.number.float({ min: 50, max: 500, precision: 0.01 });
    const priceType = faker.helpers.arrayElement(['fixed', 'hourly', 'estimate']);
    const duration = faker.number.int({ min: 30, max: 480 });
    const availability = JSON.stringify({
      monday: faker.helpers.arrayElement([true, false]),
      tuesday: faker.helpers.arrayElement([true, false]),
      wednesday: faker.helpers.arrayElement([true, false]),
      thursday: faker.helpers.arrayElement([true, false]),
      friday: faker.helpers.arrayElement([true, false]),
      saturday: faker.helpers.arrayElement([true, false]),
      sunday: faker.helpers.arrayElement([true, false]),
    });
    const zipCode = faker.location.zipCode();
    const serviceRadius = faker.number.int({ min: 5, max: 50 });
    const status = faker.helpers.arrayElement(['active', 'inactive', 'pending']);
    const featured = faker.datatype.boolean();
    const tags = JSON.stringify(Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => faker.word.sample()));
    const imageUrls = JSON.stringify(Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => faker.image.url()));
    const averageRating = faker.number.float({ min: 1, max: 5, precision: 0.1 });
    const totalReviews = faker.number.int({ min: 0, max: 50 });
    const totalBookings = faker.number.int({ min: 0, max: 100 });
    
    rows.push(`${id},${serviceAgentId},"${escapeCSV(title)}","${escapeCSV(description)}",${category},${subcategory},${price},${priceType},${duration},"${escapeCSV(availability)}",${zipCode},${serviceRadius},${status},${featured},"${escapeCSV(tags)}","${escapeCSV(imageUrls)}",${averageRating},${totalReviews},${totalBookings}`);
  }
  
  return header + '\n' + rows.join('\n');
}

// Escape CSV field value
function escapeCSV(value) {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // If the value contains a double quote, replace it with two double quotes
  return stringValue.replace(/"/g, '""');
}

// Generate data based on type
let csvData;
if (options.type === 'service_agents') {
  console.log(`Generating ${options.count} service agent records...`);
  csvData = generateServiceAgentData(options.count);
} else {
  console.log(`Generating ${options.count} service records...`);
  csvData = generateServiceData(options.count);
}

// Write to file
fs.writeFileSync(options.output, csvData);
console.log(`Data written to ${options.output}`);
