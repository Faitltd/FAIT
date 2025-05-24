import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { supabase, isUsingLocalAuth } from '../../lib/supabase';
import { simulatedConversations } from '../../utils/simulatedData';

// Card component showing recent messages

const RecentMessagesCard = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentConversations = async () => {
      try {
        // Use simulated data if in local auth mode
        if (isUsingLocalAuth()) {
          console.log('Using simulated conversations data');
          setConversations(simulatedConversations);
          setLoading(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch recent conversations
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            id,
            last_message,
            last_message_time,
            client_id,
            service_agent_id,
            service:service_id(name),
            service_agent:service_agent_id(first_name, last_name, avatar_url)
          `)
          .eq('client_id', user.id)
          .order('last_message_time', { ascending: false })
          .limit(3);

        if (error) throw error;

        setConversations(data || []);
      } catch (err) {
        console.error('Error fetching recent conversations:', err);
        setError('Failed to load recent messages');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentConversations();
  }, []);

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Messages
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Your recent conversations with service agents
          </p>
        </div>
        <Link
          to="/messages"
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          View All
        </Link>
      </div>
      <div className="border-t border-gray-200">
        {loading ? (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any recent messages.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <Link to={'/messages/' + conversation.id} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {conversation.service_agent.avatar_url ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={conversation.service_agent.avatar_url}
                            alt={conversation.service_agent.first_name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {conversation.service_agent.first_name.charAt(0)}
                              {conversation.service_agent.last_name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {conversation.service_agent.first_name} {conversation.service_agent.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(conversation.last_message_time), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.service?.name && (
                              <span className="font-medium">{conversation.service.name}: </span>
                            )}
                            {truncateMessage(conversation.last_message)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RecentMessagesCard;