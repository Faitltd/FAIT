import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Conversation, Message } from '../../types/communication';
import { communicationService } from '../../services/CommunicationService';
import ConversationList from '../../components/communication/ConversationList';
import MessageView from '../../components/communication/MessageView';
import NewConversationModal from '../../components/communication/NewConversationModal';
import { useAuth } from '../../contexts/AuthContext';

const MessagingPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversationId) {
      selectConversationById(conversationId);
    }
  }, [conversationId, conversations]);

  const fetchConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const data = await communicationService.getConversations();
      setConversations(data);
      
      // If there's a conversationId in the URL, select that conversation
      if (conversationId) {
        selectConversationById(conversationId);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const selectConversationById = (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setSelectedConversation(conversation);
      fetchMessages(conversation.id);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    navigate(`/messages/${conversation.id}`);
    fetchMessages(conversation.id);
  };

  const fetchMessages = async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      const data = await communicationService.getMessages(conversationId);
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!selectedConversation || !user) return;
    
    try {
      const message = await communicationService.sendMessage(
        selectedConversation.id,
        content,
        attachments
      );
      
      if (message) {
        // Refresh messages
        fetchMessages(selectedConversation.id);
        
        // Update conversations list to show latest message
        fetchConversations();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleCreateConversation = async (participants: string[], title?: string) => {
    try {
      const conversation = await communicationService.createConversation(participants, title);
      
      if (conversation) {
        // Refresh conversations
        await fetchConversations();
        
        // Select the new conversation
        setSelectedConversation(conversation);
        navigate(`/messages/${conversation.id}`);
        fetchMessages(conversation.id);
      }
    } catch (err) {
      console.error('Error creating conversation:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex h-[calc(100vh-12rem)]">
          <div className="w-1/3 border-r border-gray-200">
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversation?.id || null}
              onSelectConversation={handleSelectConversation}
              onNewConversation={() => setIsNewConversationModalOpen(true)}
              isLoading={isLoadingConversations}
            />
          </div>
          
          <div className="w-2/3">
            {selectedConversation ? (
              <MessageView
                conversation={selectedConversation}
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoadingMessages}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-700">Select a conversation</h3>
                  <p className="text-gray-500 mt-1">Choose a conversation from the list or start a new one</p>
                  <button
                    onClick={() => setIsNewConversationModalOpen(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Start a new conversation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <NewConversationModal
        isOpen={isNewConversationModalOpen}
        onClose={() => setIsNewConversationModalOpen(false)}
        onCreateConversation={handleCreateConversation}
      />
    </div>
  );
};

export default MessagingPage;
