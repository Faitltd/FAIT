import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Image,
  Code,
  Quote,
  Heading,
  AlertCircle
} from 'lucide-react';

interface PostEditorProps {
  initialContent?: string;
  placeholder?: string;
  onSubmit: (content: string) => Promise<void>;
  submitLabel?: string;
  isReply?: boolean;
  replyingTo?: string;
  onCancelReply?: () => void;
  minHeight?: number;
}

const PostEditor: React.FC<PostEditorProps> = ({
  initialContent = '',
  placeholder = 'Write your post here...',
  onSubmit,
  submitLabel = 'Post',
  isReply = false,
  replyingTo = '',
  onCancelReply,
  minHeight = 150
}) => {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(content);
      setContent('');
      setIsPreview(false);
    } catch (err) {
      setError('Failed to submit post. Please try again.');
      console.error('Error submitting post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    const newContent = beforeText + prefix + selectedText + suffix + afterText;
    setContent(newContent);

    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length + selectedText.length + suffix.length,
        start + prefix.length + selectedText.length + suffix.length
      );
    }, 0);
  };

  // Simple markdown to HTML conversion for preview
  const renderMarkdown = (text: string) => {
    if (!text) return '';

    // Convert markdown to HTML (basic implementation)
    let html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`(.*?)`/gim, '<code>$1</code>')
      // Lists
      .replace(/^\s*- (.*$)/gim, '<ul><li>$1</li></ul>')
      .replace(/^\s*\d+\. (.*$)/gim, '<ol><li>$1</li></ol>')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Images
      .replace(/!\[([^\]]+)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" class="max-w-full h-auto" />')
      // Line breaks
      .replace(/\n/gim, '<br />');

    // Fix nested lists
    html = html
      .replace(/<\/ul><ul>/gim, '')
      .replace(/<\/ol><ol>/gim, '');

    return html;
  };

  return (
    <motion.div
      className="bg-white rounded-md shadow-sm border border-gray-200"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {isReply && replyingTo && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 text-sm text-blue-700">
          Replying to <span className="font-medium">{replyingTo}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="p-4">
          <div className="flex justify-between mb-2">
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={() => insertFormatting('**', '**')}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="Bold"
              >
                <Bold size={18} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', '*')}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="Italic"
              >
                <Italic size={18} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('# ')}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="Heading"
              >
                <Heading size={18} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('- ')}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="List"
              >
                <List size={18} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('> ')}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="Quote"
              >
                <Quote size={18} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('`', '`')}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="Inline Code"
              >
                <Code size={18} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('[Link text](', ')')}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="Link"
              >
                <LinkIcon size={18} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('![alt text](', ')')}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="Image"
              >
                <Image size={18} />
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className={`px-2 py-1 text-xs font-medium rounded ${
                  isPreview
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isPreview ? 'Edit' : 'Preview'}
              </button>
            </div>
          </div>

          {isPreview ? (
            <div
              className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[150px] prose prose-sm max-w-none"
              style={{ minHeight: `${minHeight}px` }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          ) : (
            <textarea
              ref={textareaRef}
              id="post-editor"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              rows={6}
              style={{ minHeight: `${minHeight}px` }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            ></textarea>
          )}

          {error && (
            <div className="mt-2 flex items-center text-sm text-red-600">
              <AlertCircle size={16} className="mr-1" />
              {error}
            </div>
          )}

          <div className="mt-4 flex justify-end">
            {onCancelReply && (
              <button
                type="button"
                onClick={onCancelReply}
                className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isSubmitting || !content.trim()}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : submitLabel}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default PostEditor;
