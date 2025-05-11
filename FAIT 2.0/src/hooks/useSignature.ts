import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signDocument, getSignedDocuments, verifySignature } from '../lib/api/signatureApi';

interface SignaturePosition {
  x: number;
  y: number;
  page: number;
}

interface UseSignatureReturn {
  signPdf: (documentId: string, signatureData: string, position?: SignaturePosition) => Promise<string>;
  verifyDocumentSignature: (documentId: string) => Promise<boolean>;
  getSignedDocumentsList: () => Promise<any[]>;
  loading: boolean;
  error: string | null;
}

export const useSignature = (): UseSignatureReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  /**
   * Sign a PDF document
   */
  const signPdf = async (
    documentId: string,
    signatureData: string,
    position?: SignaturePosition
  ): Promise<string> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signDocument({
        documentId,
        signatureData,
        userId: user.id,
        signaturePosition: position,
      });

      return result.documentUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign document';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify a document signature
   */
  const verifyDocumentSignature = async (documentId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      return await verifySignature(documentId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify signature';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get list of signed documents
   */
  const getSignedDocumentsList = async (): Promise<any[]> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      return await getSignedDocuments(user.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get signed documents';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    signPdf,
    verifyDocumentSignature,
    getSignedDocumentsList,
    loading,
    error,
  };
};
