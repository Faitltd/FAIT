import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/UnifiedAuthContext';
import { MessageSquare, Phone, Settings, ArrowLeft, Send, PlusCircle, Image } from 'lucide-react';

const SimpleSMSMessagingPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('messages');
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    console.log('SimpleSMSMessagingPage mounted');
    console.log('User:', user);
  }, [user]);

  // Mock data for conversations
  const mockConversations = [
    { id: '1', phoneNumber: '+1 (555) 123-4567', lastMessage: 'When will you arrive?', timestamp: '10:30 AM', unread: 2 },
    { id: '2', phoneNumber: '+1 (555) 987-6543', lastMessage: 'The job looks great, thank you!', timestamp: 'Yesterday', unread: 0 },
    { id: '3', phoneNumber: '+1 (555) 456-7890', lastMessage: 'Can you provide an estimate?', timestamp: 'Monday', unread: 0 },
  ];

  // Mock data for messages
  const mockMessages = [
    { id: '1', text: 'Hello, I need some help with my kitchen renovation.', isSent: false, timestamp: '10:15 AM' },
    { id: '2', text: 'I\'d be happy to help! What specifically are you looking to renovate?', isSent: true, timestamp: '10:20 AM' },
    { id: '3', text: 'I want to replace the countertops and cabinets.', isSent: false, timestamp: '10:25 AM' },
    { id: '4', text: 'When will you arrive?', isSent: false, timestamp: '10:30 AM' },
  ];

  // Mock data for templates
  const mockTemplates = [
    { id: '1', name: 'Appointment Confirmation', text: 'Your appointment is confirmed for {{booking_date}} at {{booking_time}}. Looking forward to meeting you!' },
    { id: '2', name: 'Follow-up', text: 'Thank you for choosing our services! We hope you\'re satisfied with the work. Please let us know if you have any questions.' },
    { id: '3', name: 'Estimate', text: 'Based on our discussion, the estimated cost for your project is $X. This includes materials and labor. Let me know if you\'d like to proceed.' },
  ];

  // For demo purposes, we'll show the messaging UI even if the user is not authenticated
  // In a real app, you would redirect to the login page or show a message
  /*
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">Please sign in to access messaging</p>
        </div>
      </div>
    );
  }
  */

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/dashboard/service-agent" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">SMS Messaging</h1>
        <p className="text-gray-600">Send and receive SMS messages with clients and team members</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'messages'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Messages
              </div>
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'templates'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Templates
              </div>
            </button>
          </nav>
        </div>

        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-300px)]">
            {/* Conversation List */}
            <div className="md:col-span-1 border-r border-gray-200 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {mockConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.phoneNumber}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-xs text-gray-500">{conversation.timestamp}</p>
                        {conversation.unread > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full mt-1">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversation */}
            <div className="md:col-span-2 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900">+1 (555) 123-4567</span>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {mockMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isSent ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                          message.isSent
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${message.isSent ? 'text-blue-200' : 'text-gray-500'}`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-gray-200">
                <div className="flex items-end">
                  <button
                    type="button"
                    className="inline-flex items-center p-2 border border-transparent rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusCircle className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center p-2 border border-transparent rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Image className="h-5 w-5" />
                  </button>
                  <div className="flex-1 mx-2">
                    <textarea
                      rows={1}
                      placeholder="Type a message..."
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm resize-none"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center p-2 border border-transparent rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Message Templates</h2>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Template
              </button>
            </div>

            <div className="space-y-4">
              {mockTemplates.map((template) => (
                <div key={template.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-md font-medium text-gray-900">{template.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Use
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{template.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleSMSMessagingPage;
