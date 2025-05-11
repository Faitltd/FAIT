#!/bin/bash

# Create a backup of the original file
cp src/pages/dashboard/service-agent/ServiceAgentMessages.tsx src/pages/dashboard/service-agent/ServiceAgentMessages.tsx.bak2

# Fix import statements
sed -i '' 's/import { Link " +  from/import { Link } from/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/import { supabase " +  from/import { supabase } from/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/import { useAuth " +  from/import { useAuth } from/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/import { Send, User, ArrowLeft, Calendar " +  from/import { Send, User, ArrowLeft, Calendar } from/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/import type { Database " +  from/import type { Database } from/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix type definitions
sed -i '' 's/" + ;/};/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/" + }/}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix useAuth hook
sed -i '' 's/const { user " +  = useAuth();/const { user } = useAuth();/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix useState initialization
sed -i '' 's/setMessagesByBookingId, useState<Record<string, Message\[\]>>({" + );/setMessagesByBookingId] = useState<Record<string, Message[]>>({});/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix supabase queries
sed -i '' 's/const { data: servicePackages, error: packageError " +  = await/const { data: servicePackages, error: packageError } = await/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/const { data: bookingsData, error: bookingsError " +  = await/const { data: bookingsData, error: bookingsError } = await/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/const { data: messagesData, error: messagesError " +  = await/const { data: messagesData, error: messagesError } = await/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/const { data: senderData, error: senderError " +  = await/const { data: senderData, error: senderError } = await/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/const { data: messageData, error: messageError " +  = await/const { data: messageData, error: messageError } = await/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix order by clauses
sed -i '' 's/{ ascending: false " + );/{ ascending: false });/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/{ ascending: true " + );/{ ascending: true });/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix client and service_package objects
sed -i '' 's/{ full_name: '\''Unknown Client'\'', avatar_url: null " + ,/{ full_name: '\''Unknown Client'\'', avatar_url: null },/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/{ title: '\''Unknown Service'\'' " + /{ title: '\''Unknown Service'\'' }/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix closing parentheses
sed -i '' 's/" + ));/}));/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/" + );/});/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix if statements
sed -i '' 's/" + $/}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/" + ,/},/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/" + }/}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix useEffect dependencies
sed -i '' 's/" + , \[/}, \[/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix catch blocks
sed -i '' 's/" +  catch/} catch/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/" +  finally/} finally/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix function definitions
sed -i '' 's/" + ;/};/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix real-time subscription
sed -i '' 's/`messages-" + (selectedBookingId" + `/`messages-${selectedBookingId}`/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/`booking_id=eq." + (selectedBookingId" + `/`booking_id=eq.${selectedBookingId}`/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/" + , async/}, async/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix JSX
sed -i '' 's/{/* Bookings Sidebar */" +/{/* Bookings Sidebar */}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/{/* Messages Area */" +/{/* Messages Area */}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/{/* Conversation Header */" +/{/* Conversation Header */}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/{/* Messages */" +/{/* Messages */}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/{/* Message Input */" +/{/* Message Input */}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix JSX attributes
sed -i '' 's/key={booking.id" +/key={booking.id}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/onClick={() => setSelectedBookingId(booking.id)" +/onClick={() => setSelectedBookingId(booking.id)}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/src={booking.client.avatar_url" +/src={booking.client.avatar_url}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/alt={booking.client.full_name" +/alt={booking.client.full_name}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/{booking.client?.full_name || '\''Client'\''" +/{booking.client?.full_name || '\''Client'\''}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/{booking.service_package.title" + /{booking.service_package.title}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/{new Date(booking.scheduled_date).toLocaleDateString()" +/{new Date(booking.scheduled_date).toLocaleDateString()}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)" +/{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix more JSX attributes
sed -i '' 's/src={getSelectedBooking()?.client?.avatar_url" +/src={getSelectedBooking()?.client?.avatar_url}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/alt={getSelectedBooking()?.client?.full_name" +/alt={getSelectedBooking()?.client?.full_name}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/{getSelectedBooking()?.client?.full_name || '\''Client'\''" +/{getSelectedBooking()?.client?.full_name || '\''Client'\''}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/{getSelectedBooking()?.service_package.title" + /{getSelectedBooking()?.service_package.title}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/{getSelectedBooking()?.status.charAt(0).toUpperCase() + getSelectedBooking()?.status.slice(1)" +/{getSelectedBooking()?.status.charAt(0).toUpperCase() + getSelectedBooking()?.status.slice(1)}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix message rendering
sed -i '' 's/key={message.id" +/key={message.id}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/{message.content" + /{message.content}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/" + )" +/})}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/<div ref={messagesEndRef" +  \/>/<div ref={messagesEndRef} \/>/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix form handling
sed -i '' 's/onSubmit={handleSendMessage" +/onSubmit={handleSendMessage}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/value={newMessage" +/value={newMessage}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/onChange={(e) => setNewMessage(e.target.value)" +/onChange={(e) => setNewMessage(e.target.value)}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/disabled={!newMessage.trim() || sendingMessage" +/disabled={!newMessage.trim() || sendingMessage}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix conditional rendering
sed -i '' 's/" + ")" +/")}>/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/" + ")" +/")}>/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/" + ")" +/")}>/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

# Fix template literals in className attributes
sed -i '' 's/className={"w-full text-left p-4 hover:bg-gray-50 focus:outline-none " + (/className={`w-full text-left p-4 hover:bg-gray-50 focus:outline-none ${/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/" + " +/}`}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

sed -i '' 's/className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-medium " + (/className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/" + ")" +/}`}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

sed -i '' 's/className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium " + (/className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/" + ")" +/}`}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

sed -i '' 's/className={"flex " + (message.is_from_me ? '\''justify-end'\'' : '\''justify-start'\''" + ")" +/className={`flex ${message.is_from_me ? '\''justify-end'\'' : '\''justify-start'\''}`}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

sed -i '' 's/className={"max-w-\[75%\] rounded-lg px-4 py-2 " + (/className={`max-w-[75%] rounded-lg px-4 py-2 ${/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/" + ")" +/}`}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

sed -i '' 's/className={"text-xs mt-1 " + (/className={`text-xs mt-1 ${/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx
sed -i '' 's/" + ")" +/}`}/g' src/pages/dashboard/service-agent/ServiceAgentMessages.tsx

echo "Fixed ServiceAgentMessages.tsx"
