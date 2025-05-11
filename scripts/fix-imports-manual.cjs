/**
 * Fix Supabase Imports Script - Manual Approach
 * 
 * This script manually fixes imports in specific files.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');

// List of files to fix with their relative paths from src
const filesToFix = [
  'pages/dashboard/DashboardRouter.jsx',
  'pages/dashboard/ServiceAgentDashboard.jsx',
  'pages/messaging/MessagingPage.jsx',
  'pages/services/ServiceSearchPage.jsx',
  'pages/booking/BookingPage.jsx',
  'api/availabilityApi.js',
  'pages/booking/BookingConfirmationPage.jsx',
  'pages/booking/BookingDetailsPage.jsx',
  'components/service-agent/RecentClientsCard.jsx',
  'components/service-agent/BookingRequestsCard.jsx',
  'components/messaging/ConversationView.jsx',
  'components/messaging/ConversationList.jsx',
  'pages/booking/BookingsListPage.jsx',
  'pages/warranty/WarrantyPage.jsx',
  'pages/SubscriptionPlansStripe.tsx',
  'components/booking/BookingForm.jsx',
  'pages/availability/AvailabilityPage.jsx',
  'pages/notifications/NotificationsPage.jsx',
  'components/subscription/CheckoutForm.jsx',
  'components/availability/AvailabilityCalendar.jsx',
  'components/warranty/WarrantyClaimForm.jsx',
  'components/admin/AuditLogViewer.jsx'
];

// Fix each file
let fixedCount = 0;

filesToFix.forEach(relativeFilePath => {
  const filePath = path.join(SRC_DIR, relativeFilePath);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  console.log(`Fixing ${relativeFilePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Calculate relative path to utils directory
  const fileDir = path.dirname(filePath);
  const relPath = path.relative(path.join(SRC_DIR, fileDir), path.join(SRC_DIR, 'utils')).replace(/\\/g, '/');
  const relativePath = relPath.endsWith('/') ? relPath : `${relPath}/`;
  const importPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
  
  // Replace bad imports
  const originalContent = content;
  
  // Fix double utils path
  content = content.replace(
    /import\s+supabase\s+from\s+['"](.+?)utils\/utils\/supabase(Client|ClientSimple)['"];/g,
    `import supabase from '${importPath}supabaseClient';`
  );
  
  // If no change was made, try a different pattern
  if (content === originalContent) {
    content = content.replace(
      /import\s+supabase\s+from\s+['"](.+?)supabase(Client|ClientSimple)['"];/g,
      `import supabase from '${importPath}supabaseClient';`
    );
  }
  
  // Write the fixed content back to the file
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    fixedCount++;
  } else {
    console.log(`  No changes needed for ${relativeFilePath}`);
  }
});

console.log(`Fixed ${fixedCount} files successfully!`);
