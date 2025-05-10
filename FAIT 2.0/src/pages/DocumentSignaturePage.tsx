import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PDFSigner from '../components/DigitalSignature/PDFSigner';
import { supabase } from '../lib/supabase';

interface DocumentParams {
  id: string;
}

const DocumentSignaturePage: React.FC = () => {
  const { id } = useParams<keyof DocumentParams>() as DocumentParams;
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signSuccess, setSignSuccess] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          throw error;
        }
        
        setDocument(data);
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load document. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocument();
  }, [id, user]);

  const handleSignComplete = (signedDocumentUrl: string) => {
    setSignSuccess(true);
    
    // In a real implementation, we would update the document status in the database
    // and redirect to a confirmation page
    setTimeout(() => {
      navigate('/dashboard/documents');
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-md text-red-700">
        <p>{error}</p>
        <button
          onClick={() => navigate('/dashboard/documents')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Documents
        </button>
      </div>
    );
  }

  if (signSuccess) {
    return (
      <div className="bg-green-100 p-6 rounded-md text-green-700 text-center">
        <h2 className="text-xl font-semibold mb-4">Document Signed Successfully!</h2>
        <p>You will be redirected to the documents page shortly...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Sign Document</h1>
      
      {document ? (
        <PDFSigner
          documentUrl={document.file_path}
          documentName={document.title}
          onSignComplete={handleSignComplete}
        />
      ) : (
        <div className="bg-yellow-100 p-4 rounded-md text-yellow-700">
          Document not found or you don't have permission to view it.
        </div>
      )}
    </div>
  );
};

export default DocumentSignaturePage;
