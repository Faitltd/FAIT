#!/bin/bash

# Create a backup of the current file
cp src/pages/dashboard/service-agent/ServiceAgentMessages.tsx src/pages/dashboard/service-agent/ServiceAgentMessages.tsx.bak3

# Fix remaining issues
sed -i '' 's/" + $/}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/" + )/.subscribe()/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/service_package: booking.service_package || { title: '\''Unknown Service'\'' " +/service_package: booking.service_package || { title: '\''Unknown Service'\'' }/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix JSX comments
sed -i '' 's/{\/\* Bookings Sidebar \*\}" +/{\/\* Bookings Sidebar \*\/}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/{\/\* Messages Area \*\}" +/{\/\* Messages Area \*\/}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/{\/\* Conversation Header \*\}" +/{\/\* Conversation Header \*\/}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/{\/\* Messages \*\}" +/{\/\* Messages \*\/}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/{\/\* Message Input \*\}" +/{\/\* Message Input \*\/}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix JSX closing tags
sed -i '' 's/)" +/)/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix template literals with broken syntax
sed -i '' 's/")}> >/"}`}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/className={"flex " + (message.is_from_me ? '\''justify-end'\'' : '\''justify-start'\''")}>/className={`flex ${message.is_from_me ? '\''justify-end'\'' : '\''justify-start'\''}`}>/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/")}>/"}`}>/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

echo "Fixed remaining issues in ServiceAgentMessages.tsx"
