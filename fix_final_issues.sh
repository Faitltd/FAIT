#!/bin/bash

# Create a backup of the current file
cp src/pages/dashboard/service-agent/ServiceAgentMessages.tsx src/pages/dashboard/service-agent/ServiceAgentMessages.tsx.bak4

# Fix JSX comments
sed -i '' 's/{\/\* Messages Area \*\}" +/{\/\* Messages Area \*\/}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/{\/\* Conversation Header \*\}" +/{\/\* Conversation Header \*\/}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/{\/\* Messages \*\}" +/{\/\* Messages \*\/}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/{\/\* Message Input \*\}" +/{\/\* Message Input \*\/}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix template literals with broken syntax
sed -i '' 's/"}`}/`}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix extra closing brackets
sed -i '' 's/>`}>/`}>/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/>`}>/`}>/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/>`}>/`}>/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix missing closing brackets
sed -i '' 's/\([0-9]\))/\1)}>/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

echo "Fixed final issues in ServiceAgentMessages.tsx"
