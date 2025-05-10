import React, { useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { FileUploader } from '../../components/FileUploader';
import { Button } from '../../components/Button';

const VerificationPage: React.FC = () => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [documents, setDocuments] = useState<Record<string, File | null>>({
    license: null,
    insurance: null,
    portfolio: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleFileChange = (type: string, file: File | null) => {
    setDocuments(prev => ({ ...prev, [type]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Upload each document to storage
      for (const [type, file] of Object.entries(documents)) {
        if (!file) continue;
        
        const { data, error } = await supabase.storage
          .from('verification-documents')
          .upload(`${user.id}/${type}`, file);
          
        if (error) throw error;
        
        // Create record in verification_documents table
        const { error: dbError } = await supabase
          .from('verification_documents')
          .insert({
            user_id: user.id,
            document_type: type,
            document_url: data.path,
          });
          
        if (dbError) throw dbError;
      }
      
      // Update user profile verification status
      await supabase
        .from('profiles')
        .update({ verification_status: 'pending' })
        .eq('id', user.id);
        
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting verification documents:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Verification Documents</h1>
      
      {submitSuccess ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Your documents have been submitted for review. We'll notify you once they're approved.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Professional License</h2>
            <FileUploader
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(file) => handleFileChange('license', file)}
              label="Upload your professional license"
            />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Insurance Documentation</h2>
            <FileUploader
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(file) => handleFileChange('insurance', file)}
              label="Upload proof of insurance"
            />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Portfolio/Work Samples</h2>
            <FileUploader
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(file) => handleFileChange('portfolio', file)}
              label="Upload examples of your work"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting || !documents.license || !documents.insurance}
            isLoading={isSubmitting}
          >
            Submit for Verification
          </Button>
        </form>
      )}
    </div>
  );
};

export default VerificationPage;