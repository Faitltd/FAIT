import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { smsService } from '../../services/SMSService';
import { formatRelative } from 'date-fns';
import { Send, Image, Paperclip, Phone, X } from 'lucide-react';

interface SMSConversationProps {
  phoneNumber: string;
}

const SMSConversation: React.FC<SMSConversationProps> = ({ phoneNumber }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || !phoneNumber) return;
    
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await smsService.getSMSMessages(user.id, phoneNumber);
        setMessages(data.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ));
        setError(null);
      } catch (err) {
        console.error('Error fetching SMS messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchTemplates = async () => {
      try {
        const data = await smsService.getSMSTemplates(user.id);
        setTemplates(data);
      } catch (err) {
        console.error('Error fetching SMS templates:', err);
      }
    };
    
    fetchMessages();
    fetchTemplates();
    
    // Set up polling for new messages
    const intervalId = setInterval(fetchMessages, 10000); // Every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [user, phoneNumber]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!user || !messageText.trim() && mediaFiles.length === 0) return;
    
    try {
      setSending(true);
      
      // TODO: Upload media files to storage and get URLs
      // For now, we'll just use the mediaUrls state
      
      const sentMessage = await smsService.sendSMS({
        userId: user.id,
        to: phoneNumber,
        text: messageText.trim(),
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined
      });
      
      // Add the new message to the list
      setMessages(prev => [...prev, sentMessage]);
      
      // Clear the input
      setMessageText('');
      setMediaFiles([]);
      setMediaUrls([]);
      
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // Add selected files to state
    const newFiles = Array.from(files);
    setMediaFiles(prev => [...prev, ...newFiles]);
    
    // Create object URLs for preview
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setMediaUrls(prev => [...prev, ...newUrls]);
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const applyTemplate = (templateText: string) => {
    // Replace placeholders with actual values
    let text = templateText
      .replace('{{service_agent_name}}', 'Your Service Agent')
      .replace('{{booking_date}}', new Date().toLocaleDateString())
      .replace('{{booking_time}}', new Date().toLocaleTimeString())
      .replace('{{review_link}}', 'https://faitcoop.com/review');
    
    setMessageText(text);
    setShowTemplates(false);
  };

  if (!phoneNumber) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-4">
        <Phone className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500 text-center">Select a conversation or start a new one</p>
      </div>
    );
  }

  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="animate-pulse text-gray-400">Loading messages...</div>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-red-500">
        <div className="mb-2">Error loading messages</div>
        <button 
          className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <Phone className="h-5 w-5 text-gray-500" />
        </div>
        <div className="ml-3">
          <h2 className="text-lg font-semibold">{phoneNumber}</h2>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No messages yet</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs sm:max-w-md rounded-lg px-4 py-2 ${
                  message.direction === 'outbound' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <div className="text-sm">{message.messageText}</div>
                {message.mediaUrls && (
                  <div className="mt-2 space-y-2">
                    {Array.isArray(message.mediaUrls) && message.mediaUrls.map((url: string, index: number) => (
                      <img 
                        key={index}
                        src={url}
                        alt="Media attachment"
                        className="max-w-full rounded"
                      />
                    ))}
                  </div>
                )}
                <div className="text-xs mt-1 opacity-70">
                  {formatRelative(new Date(message.createdAt), new Date())}
                  {message.status && message.direction === 'outbound' && (
                    <span className="ml-2">• {message.status}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Templates dropdown */}
      {showTemplates && (
        <div className="border-t border-gray-200 max-h-40 overflow-y-auto">
          <div className="p-2 bg-gray-50 flex justify-between items-center">
            <h3 className="text-sm font-medium">Message Templates</h3>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setShowTemplates(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <ul className="divide-y divide-gray-200">
            {templates.map((template) => (
              <li 
                key={template.id}
                className="p-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => applyTemplate(template.templateText)}
              >
                <div className="font-medium text-sm">{template.name}</div>
                <div className="text-xs text-gray-500 truncate">{template.templateText}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Media preview */}
      {mediaUrls.length > 0 && (
        <div className="border-t border-gray-200 p-2 flex flex-wrap gap-2">
          {mediaUrls.map((url, index) => (
            <div key={index} className="relative">
              <img 
                src={url} 
                alt="Media preview" 
                className="h-16 w-16 object-cover rounded"
              />
              <button
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                onClick={() => removeMedia(index)}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Type a message..."
              rows={2}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />
          </div>
          <div className="flex space-x-2">
            <button
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              onClick={() => setShowTemplates(!showTemplates)}
              title="Message templates"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              onClick={() => fileInputRef.current?.click()}
              title="Attach media"
            >
              <Image className="h-5 w-5" />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
              />
            </button>
            <button
              className={`p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full ${
                sending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleSendMessage}
              disabled={sending || (!messageText.trim() && mediaFiles.length === 0)}
              title="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMSConversation;
