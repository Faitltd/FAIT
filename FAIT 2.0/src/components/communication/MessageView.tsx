import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, X, Download, Image, FileText, File } from 'lucide-react';
import { Message, Conversation } from '../../types/communication';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

interface MessageViewProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (content: string, attachments?: File[]) => Promise<void>;
  isLoading: boolean;
}

const MessageView: React.FC<MessageViewProps> = ({
  conversation,
  messages,
  onSendMessage,
  isLoading
}) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && attachments.length === 0) || sending) return;

    setSending(true);
    try {
      await onSendMessage(newMessage, attachments.length > 0 ? attachments : undefined);
      setNewMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (
      fileType === 'application/pdf' ||
      fileType.includes('document') ||
      fileType.includes('text')
    ) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get the other participants (excluding current user)
  const otherParticipants = conversation.participant_profiles?.filter(
    p => p.id !== user?.id
  ) || [];
  
  // Determine the conversation name
  const conversationName = conversation.title || 
    otherParticipants.map(p => p.full_name).join(', ');

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-gray-200 p-4 flex items-center">
          <div className="animate-pulse flex items-center flex-1">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="ml-3">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
              <div className={`animate-pulse max-w-xs md:max-w-md rounded-lg p-3 ${
                i % 2 === 0 ? 'bg-gray-200' : 'bg-gray-100'
              }`}>
                <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-200 p-4">
          <div className="animate-pulse flex items-center">
            <div className="h-10 bg-gray-200 rounded flex-1"></div>
            <div className="ml-2 h-10 w-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 p-4 flex items-center">
        <div className="flex-shrink-0">
          {otherParticipants.length > 0 && otherParticipants[0].avatar_url ? (
            <img
              src={otherParticipants[0].avatar_url}
              alt={otherParticipants[0].full_name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {conversationName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="ml-3">
          <h2 className="text-lg font-medium text-gray-900">{conversationName}</h2>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 mb-2">No messages yet</p>
              <p className="text-sm text-gray-400">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender_id === user?.id;
            
            return (
              <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : ''}`}>
                <div className={`flex flex-col max-w-xs md:max-w-md rounded-lg p-3 ${
                  isCurrentUser ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {!isCurrentUser && (
                    <span className="text-xs font-medium text-gray-700 mb-1">
                      {message.sender?.full_name || 'Unknown'}
                    </span>
                  )}
                  
                  <div className="break-words">
                    {message.content}
                  </div>
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={attachment.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-2 bg-white rounded border border-gray-200 hover:bg-gray-50"
                        >
                          {getFileIcon(attachment.file_type)}
                          <div className="ml-2 flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {attachment.file_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(attachment.file_size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <Download className="h-4 w-4 text-gray-400" />
                        </a>
                      ))}
                    </div>
                  )}
                  
                  <span className="text-xs text-gray-500 mt-1 self-end">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-gray-200 p-4">
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center p-2 bg-gray-100 rounded"
              >
                {getFileIcon(file.type)}
                <span className="ml-2 text-sm truncate max-w-[150px]">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex items-center">
          <button
            type="button"
            onClick={handleFileSelect}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <Paperclip size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 ml-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || (!newMessage.trim() && attachments.length === 0)}
            className="ml-2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageView;
