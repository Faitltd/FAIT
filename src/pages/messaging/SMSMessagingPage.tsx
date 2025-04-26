import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SMSConversationList, SMSConversation, SMSTemplateManager } from '../../components/sms';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { MessageSquare, Settings } from 'lucide-react';

const SMSMessagingPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('messages');

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">Please sign in to access messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">SMS Messaging</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your SMS conversations and templates
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex space-x-4 border-b border-gray-200 mb-6">
          <TabsTrigger 
            value="messages" 
            className={`pb-4 px-1 font-medium text-sm flex items-center ${
              activeTab === 'messages' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Messages
          </TabsTrigger>
          <TabsTrigger 
            value="templates" 
            className={`pb-4 px-1 font-medium text-sm flex items-center ${
              activeTab === 'templates' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="h-5 w-5 mr-2" />
            Templates
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages" className="focus:outline-none">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-250px)]">
              <div className="md:col-span-1 border-r border-gray-200">
                <SMSConversationList 
                  onSelectConversation={(phoneNumber) => setSelectedPhoneNumber(phoneNumber)}
                  selectedPhoneNumber={selectedPhoneNumber || undefined}
                />
              </div>
              <div className="md:col-span-2">
                {selectedPhoneNumber ? (
                  <SMSConversation phoneNumber={selectedPhoneNumber} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-4">
                    <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-center">Select a conversation or start a new one</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="templates" className="focus:outline-none">
          <SMSTemplateManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SMSMessagingPage;
