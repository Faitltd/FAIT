import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import MainLayout from '../../components/MainLayout';
import ConversationList from '../../components/messaging/ConversationList';
import ConversationView from '../../components/messaging/ConversationView';
import { getUnreadMessageCount } from '../../api/messagingApi';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const MessagingPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [selectedConversationId, setSelectedConversationId] = useState(conversationId);
  const [mobileView, setMobileView] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        fetchUnreadCount(user.id);
        
        // Subscribe to new messages
        const messagesSubscription = supabase
          .channel('public:messages')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          }, () => {
            // Refresh unread count when new message is received
            fetchUnreadCount(user.id);
          })
          .subscribe();
        
        return () => {
          supabase.removeChannel(messagesSubscription);
        };
      }
    };
    
    fetchUser();
  }, []);

  useEffect(() => {
    // Update selected conversation when URL param changes
    if (conversationId) {
      setSelectedConversationId(conversationId);
      setMobileView(true);
    }
  }, [conversationId]);

  useEffect(() => {
    // Handle responsive layout
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const fetchUnreadCount = async (userId) => {
    try {
      const count = await getUnreadMessageCount(userId);
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const handleSelectConversation = (id) => {
    setSelectedConversationId(id);
    navigate(`/messages/${id}`);
  };

  const handleBack = () => {
    setSelectedConversationId(null);
    navigate('/messages');
  };

  return (
    <MainLayout currentPage="messages">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            {unreadCount > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                You have {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}
              </p>
            )}
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="border-4 border-gray-200 rounded-lg h-96 md:h-[calc(100vh-250px)] overflow-hidden">
                <div className="flex h-full">
                  {/* Conversation List */}
                  {(!mobileView || !selectedConversationId) && (
                    <div className={`${mobileView ? 'w-full' : 'w-1/3 border-r border-gray-200'}`}>
                      <ConversationList
                        onSelectConversation={handleSelectConversation}
                        selectedConversationId={selectedConversationId}
                      />
                    </div>
                  )}
                  
                  {/* Conversation View */}
                  {(!mobileView || selectedConversationId) && (
                    <div className={`${mobileView ? 'w-full' : 'w-2/3'}`}>
                      {selectedConversationId ? (
                        <ConversationView
                          conversationId={selectedConversationId}
                          onBack={handleBack}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Select a conversation from the list to view messages.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

export default MessagingPage;
