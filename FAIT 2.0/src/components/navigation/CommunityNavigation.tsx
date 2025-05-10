import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Users, Bell } from 'lucide-react';
import { communicationService } from '../../services/CommunicationService';
import { useAuth } from '../../contexts/AuthContext';
import NotificationCenter from '../communication/NotificationCenter';

const CommunityNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadMessageCount();
    }
  }, [user]);

  const fetchUnreadMessageCount = async () => {
    try {
      const conversations = await communicationService.getConversations();
      
      // Calculate total unread messages
      const totalUnread = conversations.reduce((total, conversation) => {
        return total + (conversation.unread_count || 0);
      }, 0);
      
      setUnreadMessageCount(totalUnread);
    } catch (error) {
      console.error('Error fetching unread message count:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex space-x-4">
            <Link
              to="/forum"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/forum')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="h-5 w-5 mr-2" />
              Community Forum
            </Link>
            
            <Link
              to="/dashboard/messages"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/dashboard/messages')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="relative">
                <MessageSquare className="h-5 w-5 mr-2" />
                {unreadMessageCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                  </span>
                )}
              </div>
              Messages
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            <NotificationCenter />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityNavigation;
