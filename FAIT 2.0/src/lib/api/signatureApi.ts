import { supabase } from '../supabase';
import { v4 as uuidv4 } from 'uuid';

interface SignatureData {
  documentId: string;
  signatureData: string;
  userId: string;
  signaturePosition?: {
    x: number;
    y: number;
    page: number;
  };
}

interface SignedDocument {
  id: string;
  documentUrl: string;
  signedAt: string;
  signedBy: string;
}

/**
 * Save a signature to the database
 */
export const saveSignature = async (signatureData: string, userId: string): Promise<string> => {
  try {
    // Generate a unique filename for the signature
    const filename = `${userId}/${uuidv4()}.png`;
    
    // Convert base64 data to blob
    const base64Data = signatureData.replace(/^data:image\/png;base64,/, '');
    const blob = Buffer.from(base64Data, 'base64');
    
    // Upload signature to storage
    const { error: uploadError } = await supabase.storage
      .from('signatures')
      .upload(filename, blob, {
        contentType: 'image/png',
      });
      
    if (uploadError) {
      throw uploadError;
    }
    
    // Get public URL for the signature
    const { data: { publicUrl } } = supabase.storage
      .from('signatures')
      .getPublicUrl(filename);
      
    return publicUrl;
  } catch (error) {
    console.error('Error saving signature:', error);
    throw new Error('Failed to save signature');
  }
};

/**
 * Apply a signature to a document
 */
export const signDocument = async (data: SignatureData): Promise<SignedDocument> => {
  try {
    // In a real implementation, this would call a server-side function to apply
    // the signature to the PDF document. For now, we'll just record the signature event.
    
    // Get the document details
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', data.documentId)
      .single();
      
    if (documentError) {
      throw documentError;
    }
    
    // Save the signature image
    const signatureUrl = await saveSignature(data.signatureData, data.userId);
    
    // Record the signature event
    const { data: signatureRecord, error: signatureError } = await supabase
      .from('document_signatures')
      .insert({
        document_id: data.documentId,
        user_id: data.userId,
        signature_url: signatureUrl,
        position_x: data.signaturePosition?.x,
        position_y: data.signaturePosition?.y,
        page: data.signaturePosition?.page,
        signed_at: new Date().toISOString(),
      })
      .select()
      .single();
      
    if (signatureError) {
      throw signatureError;
    }
    
    // Update the document status to signed
    const { data: updatedDocument, error: updateError } = await supabase
      .from('documents')
      .update({
        status: 'signed',
        signed_at: new Date().toISOString(),
        signed_by: data.userId,
      })
      .eq('id', data.documentId)
      .select()
      .single();
      
    if (updateError) {
      throw updateError;
    }
    
    return {
      id: updatedDocument.id,
      documentUrl: updatedDocument.file_path,
      signedAt: updatedDocument.signed_at,
      signedBy: updatedDocument.signed_by,
    };
  } catch (error) {
    console.error('Error signing document:', error);
    throw new Error('Failed to sign document');
  }
};

/**
 * Get all signed documents for a user
 */
export const getSignedDocuments = async (userId: string): Promise<SignedDocument[]> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        id,
        file_path,
        signed_at,
        signed_by,
        profiles:signed_by(full_name)
      `)
      .eq('status', 'signed')
      .or(`signed_by.eq.${userId},uploaded_by.eq.${userId}`)
      .order('signed_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data.map((doc: any) => ({
      id: doc.id,
      documentUrl: doc.file_path,
      signedAt: doc.signed_at,
      signedBy: doc.profiles?.full_name || 'Unknown',
    }));
  } catch (error) {
    console.error('Error getting signed documents:', error);
    throw new Error('Failed to get signed documents');
  }
};

/**
 * Verify a document signature
 */
export const verifySignature = async (documentId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('document_signatures')
      .select('*')
      .eq('document_id', documentId);
      
    if (error) {
      throw error;
    }
    
    // If there's at least one signature record, the document is signed
    return data.length > 0;
  } catch (error) {
    console.error('Error verifying signature:', error);
    throw new Error('Failed to verify signature');
  }
};
