import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import { Mail, Copy, Check, Share2 } from 'lucide-react';

const ServiceAgentInvite = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const referralLink = `${window.location.origin}/signup?referral=${user?.id}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, you would send an email with the referral link
      // For now, we'll just simulate success
      
      // Record the invitation in the database
      const { error: dbError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: user?.id,
          email: email.trim(),
          message: message.trim() || null,
          status: 'sent'
        });
      
      if (dbError) throw dbError;
      
      setSuccess(true);
      setEmail('');
      setMessage('');
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Error sending invitation:', err);
      setError('Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        setError('Failed to copy link. Please try again.');
      }
    );
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join FAIT Co-Op',
        text: 'Join me on FAIT Co-Op, a platform for home service professionals.',
        url: referralLink,
      })
      .catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Invite Other Service Agents</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Invite by email */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Invite by Email
          </h2>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
                Invitation sent successfully!
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Personal Message (Optional)
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Hey! I think you'd be a great fit for this platform..."
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-5 w-5" />
                  Send Invitation
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* Share referral link */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Share Your Referral Link
          </h2>
          
          <p className="text-sm text-gray-500 mb-4">
            Share this link with other service agents. When they sign up using your link,
            you'll both receive benefits.
          </p>
          
          <div className="mb-6">
            <label htmlFor="referral-link" className="block text-sm font-medium text-gray-700">
              Your Referral Link
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="referral-link"
                value={referralLink}
                readOnly
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={copyToClipboard}
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100"
              >
                {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              type="button"
              onClick={copyToClipboard}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Copy className="mr-2 h-5 w-5" />
              Copy Link
            </button>
            
            <button
              type="button"
              onClick={shareLink}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Share2 className="mr-2 h-5 w-5" />
              Share Link
            </button>
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Benefits of Referring</h3>
            <ul className="text-sm text-gray-500 space-y-1 list-disc pl-5">
              <li>Earn points for each successful referral</li>
              <li>Build your professional network</li>
              <li>Help grow the FAIT Co-Op community</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceAgentInvite;
