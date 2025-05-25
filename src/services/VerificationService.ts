import { supabase } from '../lib/supabase';
import {
  ServiceAgentVerification,
  VerificationDocument,
  VerificationHistoryEntry,
  VerificationLevel,
  VerificationStatus,
  DocumentType,
  DocumentStatus,
  VERIFICATION_REQUIREMENTS,
  VerificationRequest,
  VerificationStats
} from '../types/verification.types';
import { emailNotificationService } from './EmailNotificationService';

/**
 * Service for handling service agent verification
 */
export class VerificationService {
  /**
   * Get verification for a service agent
   * @param serviceAgentId Service agent ID
   * @returns Verification data
   */
  async getVerification(serviceAgentId: string): Promise<ServiceAgentVerification | null> {
    try {
      const { data, error } = await supabase
        .from('service_agent_verification')
        .select(`
          *,
          verification_documents(*)
        `)
        .eq('service_agent_id', serviceAgentId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error getting verification:', error);
      return null;
    }
  }

  /**
   * Create or update verification for a service agent
   * @param serviceAgentId Service agent ID
   * @param level Verification level
   * @returns Created or updated verification
   */
  async createOrUpdateVerification(
    serviceAgentId: string,
    level: VerificationLevel = VerificationLevel.STANDARD
  ): Promise<ServiceAgentVerification | null> {
    try {
      // Check if verification already exists
      const { data: existingVerification } = await supabase
        .from('service_agent_verification')
        .select('*')
        .eq('service_agent_id', serviceAgentId)
        .single();

      if (existingVerification) {
        // Update existing verification
        const { data, error } = await supabase
          .from('service_agent_verification')
          .update({
            verification_level: level,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingVerification.id)
          .select()
          .single();

        if (error) throw error;

        return data;
      } else {
        // Create new verification
        const { data, error } = await supabase
          .from('service_agent_verification')
          .insert({
            service_agent_id: serviceAgentId,
            verification_level: level,
            verification_status: VerificationStatus.PENDING,
            is_verified: false
          })
          .select()
          .single();

        if (error) throw error;

        return data;
      }
    } catch (error) {
      console.error('Error creating/updating verification:', error);
      return null;
    }
  }

  /**
   * Submit verification for review
   * @param verificationId Verification ID
   * @returns Success status
   */
  async submitVerification(verificationId: string): Promise<boolean> {
    try {
      // Check if all required documents are uploaded
      const { data: verification, error: verificationError } = await supabase
        .from('service_agent_verification')
        .select(`
          *,
          verification_documents(*),
          profiles:service_agent_id(id, full_name, email, phone, business_name)
        `)
        .eq('id', verificationId)
        .single();

      if (verificationError) throw verificationError;

      // Get required documents for this verification level
      const requiredDocumentTypes = VERIFICATION_REQUIREMENTS[verification.verification_level];

      // Check if all required documents are uploaded
      const uploadedDocumentTypes = verification.verification_documents.map(
        (doc: VerificationDocument) => doc.document_type
      );

      const missingDocumentTypes = requiredDocumentTypes.filter(
        type => !uploadedDocumentTypes.includes(type)
      );

      if (missingDocumentTypes.length > 0) {
        throw new Error(`Missing required documents: ${missingDocumentTypes.join(', ')}`);
      }

      const previousStatus = verification.verification_status;

      // Update verification status to in_review
      const { error: updateError } = await supabase
        .from('service_agent_verification')
        .update({
          verification_status: VerificationStatus.IN_REVIEW,
          updated_at: new Date().toISOString()
        })
        .eq('id', verificationId);

      if (updateError) throw updateError;

      // Add to verification history
      await supabase
        .from('verification_history')
        .insert({
          verification_id: verificationId,
          action: 'submitted',
          previous_status: previousStatus,
          new_status: VerificationStatus.IN_REVIEW,
          notes: 'Verification submitted for review'
        });

      // Get the updated verification
      const { data: updatedVerification, error: fetchError } = await supabase
        .from('service_agent_verification')
        .select(`
          *,
          profiles:service_agent_id(id, full_name, email, phone, business_name)
        `)
        .eq('id', verificationId)
        .single();

      if (!fetchError && updatedVerification) {
        // Send email notification
        await emailNotificationService.sendVerificationStatusUpdateEmail(
          updatedVerification,
          previousStatus
        );
      }

      return true;
    } catch (error) {
      console.error('Error submitting verification:', error);
      return false;
    }
  }

  /**
   * Get verification history
   * @param verificationId Verification ID
   * @returns Verification history entries
   */
  async getVerificationHistory(verificationId: string): Promise<VerificationHistoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('verification_history')
        .select(`
          *,
          admin:performed_by(id, full_name)
        `)
        .eq('verification_id', verificationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting verification history:', error);
      return [];
    }
  }

  /**
   * Check verification status
   * @param serviceAgentId Service agent ID
   * @returns Verification status
   */
  async checkVerificationStatus(serviceAgentId: string): Promise<{
    isVerified: boolean;
    status: VerificationStatus;
    expirationDate: string | null;
    rejectionReason: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('service_agent_verification')
        .select('is_verified, verification_status, expiration_date, rejection_reason')
        .eq('service_agent_id', serviceAgentId)
        .single();

      if (error) {
        return {
          isVerified: false,
          status: VerificationStatus.PENDING,
          expirationDate: null,
          rejectionReason: null
        };
      }

      return {
        isVerified: data.is_verified,
        status: data.verification_status,
        expirationDate: data.expiration_date,
        rejectionReason: data.rejection_reason
      };
    } catch (error) {
      console.error('Error checking verification status:', error);
      return {
        isVerified: false,
        status: VerificationStatus.PENDING,
        expirationDate: null,
        rejectionReason: null
      };
    }
  }

  /**
   * Get missing documents for verification
   * @param verificationId Verification ID
   * @returns List of missing document types
   */
  async getMissingDocuments(verificationId: string): Promise<DocumentType[]> {
    try {
      const { data: verification, error: verificationError } = await supabase
        .from('service_agent_verification')
        .select(`
          verification_level,
          verification_documents(document_type)
        `)
        .eq('id', verificationId)
        .single();

      if (verificationError) throw verificationError;

      // Get required documents for this verification level
      const requiredDocumentTypes = VERIFICATION_REQUIREMENTS[verification.verification_level];

      // Get uploaded document types
      const uploadedDocumentTypes = verification.verification_documents.map(
        (doc: { document_type: DocumentType }) => doc.document_type
      );

      // Find missing document types
      const missingDocumentTypes = requiredDocumentTypes.filter(
        type => !uploadedDocumentTypes.includes(type)
      );

      return missingDocumentTypes;
    } catch (error) {
      console.error('Error getting missing documents:', error);
      return [];
    }
  }
  /**
   * Get verification requirements
   * @returns List of verification requirements
   */
  async getRequirements(): Promise<VerificationRequirement[]> {
    // In a real implementation, this might come from the database
    // For now, we'll return a static list
    return [
      {
        document_type: 'license',
        name: 'Professional License',
        description: 'Valid professional license for your trade',
        is_required: true
      },
      {
        document_type: 'insurance',
        name: 'Insurance Documentation',
        description: 'Proof of liability insurance',
        is_required: true
      },
      {
        document_type: 'certification',
        name: 'Professional Certification',
        description: 'Relevant certifications for your trade',
        is_required: false
      },
      {
        document_type: 'identity',
        name: 'Identity Verification',
        description: 'Government-issued ID',
        is_required: true
      },
      {
        document_type: 'business',
        name: 'Business Registration',
        description: 'Business registration or incorporation documents',
        is_required: false
      }
    ];
  }

  /**
   * Get verification request by ID
   * @param requestId Verification request ID
   * @returns Verification request with documents
   */
  async getRequestById(requestId: string): Promise<VerificationRequest | null> {
    try {
      // Get the verification request
      const { data: request, error: requestError } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) {
        console.error('Error fetching verification request:', requestError);
        return null;
      }

      // Get the documents for this request
      const { data: documents, error: documentsError } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('verification_request_id', requestId);

      if (documentsError) {
        console.error('Error fetching verification documents:', documentsError);
        return null;
      }

      return {
        ...request,
        documents: documents
      } as VerificationRequest;
    } catch (error) {
      console.error('Error in getRequestById:', error);
      return null;
    }
  }

  /**
   * Get verification requests for a user
   * @param userId User ID
   * @returns List of verification requests
   */
  async getRequestsByUser(userId: string): Promise<VerificationRequest[]> {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching verification requests:', error);
        return [];
      }

      return data as VerificationRequest[];
    } catch (error) {
      console.error('Error in getRequestsByUser:', error);
      return [];
    }
  }

  /**
   * Get the latest verification request for a user
   * @param userId User ID
   * @returns Latest verification request or null if none exists
   */
  async getLatestRequest(userId: string): Promise<VerificationRequest | null> {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error fetching latest verification request:', error);
        return null;
      }

      return data as VerificationRequest;
    } catch (error) {
      console.error('Error in getLatestRequest:', error);
      return null;
    }
  }

  /**
   * Create a new verification request
   * @param userId User ID
   * @returns Created verification request
   */
  async createRequest(userId: string): Promise<VerificationRequest | null> {
    try {
      // Check if there's already a pending request
      const existingRequest = await this.getLatestRequest(userId);
      if (existingRequest && ['pending', 'in_review'].includes(existingRequest.status)) {
        throw new Error('You already have a pending verification request');
      }

      // Create a new verification request
      const { data, error } = await supabase
        .from('verification_requests')
        .insert([
          {
            user_id: userId,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating verification request:', error);
        return null;
      }

      // Update the user's verification status
      await supabase
        .from('profiles')
        .update({ verification_status: 'pending' })
        .eq('id', userId);

      return data as VerificationRequest;
    } catch (error) {
      console.error('Error in createRequest:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create verification request');
    }
  }

  /**
   * Upload a verification document
   * @param verificationId Verification ID
   * @param file File to upload
   * @param documentType Document type
   * @param documentName Document name
   * @param metadata Additional document metadata
   * @returns Uploaded document
   */
  async uploadDocument(
    verificationId: string,
    file: File,
    documentType: DocumentType,
    documentName: string = file.name,
    metadata: {
      documentNumber?: string;
      issuingAuthority?: string;
      expirationDate?: string;
    } = {}
  ): Promise<VerificationDocument | null> {
    try {
      // Get service agent ID from verification
      const { data: verification, error: verificationError } = await supabase
        .from('service_agent_verification')
        .select('service_agent_id')
        .eq('id', verificationId)
        .single();

      if (verificationError) throw verificationError;

      const serviceAgentId = verification.service_agent_id;

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${documentType}.${fileExt}`;
      const filePath = `${serviceAgentId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('verification_documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { data: document, error: documentError } = await supabase
        .from('verification_documents')
        .insert({
          verification_id: verificationId,
          document_type: documentType,
          document_status: DocumentStatus.PENDING,
          document_url: filePath,
          document_name: documentName,
          document_number: metadata.documentNumber || null,
          issuing_authority: metadata.issuingAuthority || null,
          expiration_date: metadata.expirationDate || null
        })
        .select()
        .single();

      if (documentError) throw documentError;

      // Update verification status if it's still 'pending'
      await supabase
        .from('service_agent_verification')
        .update({
          verification_status: VerificationStatus.PENDING,
          updated_at: new Date().toISOString()
        })
        .eq('id', verificationId)
        .eq('verification_status', VerificationStatus.PENDING);

      return document;
    } catch (error) {
      console.error('Error uploading document:', error);
      return null;
    }
  }

  /**
   * Get document URL
   * @param documentPath Document path
   * @returns Signed URL for the document
   */
  async getDocumentUrl(documentPath: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from('verification_documents')
        .createSignedUrl(documentPath, 60); // 60 seconds expiry

      if (error) throw error;

      return data.signedUrl;
    } catch (error) {
      console.error('Error getting document URL:', error);
      return null;
    }
  }

  /**
   * Delete a verification document
   * @param documentId Document ID
   * @returns Success status
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      // Get document details
      const { data: document, error: documentError } = await supabase
        .from('verification_documents')
        .select('document_url')
        .eq('id', documentId)
        .single();

      if (documentError) throw documentError;

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('verification_documents')
        .remove([document.document_url]);

      if (storageError) throw storageError;

      // Delete document record
      const { error: deleteError } = await supabase
        .from('verification_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) throw deleteError;

      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  /**
   * Approve a verification document
   * @param documentId Document ID
   * @param adminId Admin user ID
   * @returns Success status
   */
  async approveDocument(documentId: string, adminId: string): Promise<boolean> {
    try {
      // Get document details with verification info
      const { data: document, error: documentError } = await supabase
        .from('verification_documents')
        .select(`
          *,
          verification:verification_id(
            *,
            profiles:service_agent_id(id, full_name, email, phone, business_name)
          )
        `)
        .eq('id', documentId)
        .single();

      if (documentError) throw documentError;

      // Update document status
      const { error: updateError } = await supabase
        .from('verification_documents')
        .update({
          document_status: DocumentStatus.APPROVED,
          verified_by: adminId,
          verified_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (updateError) throw updateError;

      // Send email notification
      if (document.verification && document.verification.profiles) {
        await emailNotificationService.sendDocumentStatusUpdateEmail(
          document.verification,
          document.document_name,
          true
        );
      }

      return true;
    } catch (error) {
      console.error('Error approving document:', error);
      return false;
    }
  }

  /**
   * Reject a verification document
   * @param documentId Document ID
   * @param adminId Admin user ID
   * @param rejectionReason Reason for rejection
   * @returns Success status
   */
  async rejectDocument(
    documentId: string,
    adminId: string,
    rejectionReason: string
  ): Promise<boolean> {
    try {
      // Get document details with verification info
      const { data: document, error: documentError } = await supabase
        .from('verification_documents')
        .select(`
          *,
          verification:verification_id(
            *,
            profiles:service_agent_id(id, full_name, email, phone, business_name)
          )
        `)
        .eq('id', documentId)
        .single();

      if (documentError) throw documentError;

      // Update document status
      const { error: updateError } = await supabase
        .from('verification_documents')
        .update({
          document_status: DocumentStatus.REJECTED,
          rejection_reason: rejectionReason,
          verified_by: adminId,
          verified_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (updateError) throw updateError;

      // Send email notification
      if (document.verification && document.verification.profiles) {
        await emailNotificationService.sendDocumentStatusUpdateEmail(
          document.verification,
          document.document_name,
          false,
          rejectionReason
        );
      }

      return true;
    } catch (error) {
      console.error('Error rejecting document:', error);
      return false;
    }
  }

  /**
   * Submit a verification request for review
   * @param requestId Verification request ID
   * @returns Updated verification request
   */
  async submitRequest(requestId: string): Promise<VerificationRequest | null> {
    try {
      // Check if the request has the required documents
      const request = await this.getRequestById(requestId);
      if (!request) {
        throw new Error('Verification request not found');
      }

      const requirements = await this.getRequirements();
      const requiredTypes = requirements
        .filter(req => req.is_required)
        .map(req => req.document_type);

      const documentTypes = request.documents?.map(doc => doc.document_type) || [];

      const missingTypes = requiredTypes.filter(type => !documentTypes.includes(type));

      if (missingTypes.length > 0) {
        const missingNames = requirements
          .filter(req => missingTypes.includes(req.document_type))
          .map(req => req.name);

        throw new Error(`Missing required documents: ${missingNames.join(', ')}`);
      }

      // Update the request status
      const { data, error } = await supabase
        .from('verification_requests')
        .update({ status: 'in_review' })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        console.error('Error updating verification request:', error);
        return null;
      }

      return data as VerificationRequest;
    } catch (error) {
      console.error('Error in submitRequest:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to submit verification request');
    }
  }

  /**
   * Get verification requests for admin review
   * @param status Filter by status
   * @param limit Number of requests to return
   * @param offset Offset for pagination
   * @returns List of verification requests
   */
  async getRequestsForReview(
    status: VerificationStatus = 'in_review',
    limit: number = 10,
    offset: number = 0
  ): Promise<VerificationRequest[]> {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('status', status)
        .order('request_date', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching verification requests for review:', error);
        return [];
      }

      return data as unknown as VerificationRequest[];
    } catch (error) {
      console.error('Error in getRequestsForReview:', error);
      return [];
    }
  }

  /**
   * Approve a verification request
   * @param requestId Verification request ID
   * @param adminId Admin user ID
   * @returns Updated verification request
   */
  async approveRequest(
    requestId: string,
    adminId: string
  ): Promise<VerificationRequest | null> {
    try {
      // Get the verification request with user info before updating
      const { data: request, error: requestError } = await supabase
        .from('verification_requests')
        .select(`
          *,
          profiles:user_id(*)
        `)
        .eq('id', requestId)
        .single();

      if (requestError) {
        console.error('Error fetching verification request:', requestError);
        return null;
      }

      const previousStatus = request.status;

      // Start a transaction
      const { data, error } = await supabase.rpc('approve_verification_request', {
        p_request_id: requestId,
        p_admin_id: adminId
      });

      if (error) {
        console.error('Error approving verification request:', error);
        return null;
      }

      // Get the updated request
      const updatedRequest = await this.getRequestById(requestId);

      if (updatedRequest && request.profiles) {
        // Create a ServiceAgentVerification object from the request for email notification
        const verification: ServiceAgentVerification = {
          id: requestId,
          service_agent_id: request.user_id,
          verification_level: VerificationLevel.STANDARD, // Default level
          verification_status: VerificationStatus.APPROVED,
          is_verified: true,
          verification_date: new Date().toISOString(),
          expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          rejection_reason: null,
          background_check_status: null,
          background_check_id: null,
          verified_by: adminId,
          created_at: request.created_at,
          updated_at: new Date().toISOString(),
          profiles: {
            id: request.user_id,
            full_name: request.profiles.full_name || request.profiles.first_name + ' ' + request.profiles.last_name,
            email: request.profiles.email,
            phone: request.profiles.phone,
            business_name: request.profiles.business_name
          }
        };

        // Send email notification
        await emailNotificationService.sendVerificationStatusUpdateEmail(
          verification,
          previousStatus as unknown as VerificationStatus
        );
      }

      return updatedRequest;
    } catch (error) {
      console.error('Error in approveRequest:', error);
      return null;
    }
  }

  /**
   * Reject a verification request
   * @param requestId Verification request ID
   * @param adminId Admin user ID
   * @param reason Rejection reason
   * @returns Updated verification request
   */
  async rejectRequest(
    requestId: string,
    adminId: string,
    reason: string
  ): Promise<VerificationRequest | null> {
    try {
      // Get the verification request with user info before updating
      const { data: request, error: requestError } = await supabase
        .from('verification_requests')
        .select(`
          *,
          profiles:user_id(*)
        `)
        .eq('id', requestId)
        .single();

      if (requestError) {
        console.error('Error fetching verification request:', requestError);
        return null;
      }

      const previousStatus = request.status;

      // Start a transaction
      const { data, error } = await supabase.rpc('reject_verification_request', {
        p_request_id: requestId,
        p_admin_id: adminId,
        p_reason: reason
      });

      if (error) {
        console.error('Error rejecting verification request:', error);
        return null;
      }

      // Get the updated request
      const updatedRequest = await this.getRequestById(requestId);

      if (updatedRequest && request.profiles) {
        // Create a ServiceAgentVerification object from the request for email notification
        const verification: ServiceAgentVerification = {
          id: requestId,
          service_agent_id: request.user_id,
          verification_level: VerificationLevel.STANDARD, // Default level
          verification_status: VerificationStatus.REJECTED,
          is_verified: false,
          verification_date: null,
          expiration_date: null,
          rejection_reason: reason,
          background_check_status: null,
          background_check_id: null,
          verified_by: adminId,
          created_at: request.created_at,
          updated_at: new Date().toISOString(),
          profiles: {
            id: request.user_id,
            full_name: request.profiles.full_name || request.profiles.first_name + ' ' + request.profiles.last_name,
            email: request.profiles.email,
            phone: request.profiles.phone,
            business_name: request.profiles.business_name
          }
        };

        // Send email notification
        await emailNotificationService.sendVerificationStatusUpdateEmail(
          verification,
          previousStatus as unknown as VerificationStatus
        );
      }

      return updatedRequest;
    } catch (error) {
      console.error('Error in rejectRequest:', error);
      return null;
    }
  }

  /**
   * Get verification statistics
   * @returns Verification statistics
   */
  async getStats(): Promise<VerificationStats> {
    try {
      const { data, error } = await supabase.rpc('get_verification_stats');

      if (error) {
        console.error('Error fetching verification stats:', error);
        return {
          total_requests: 0,
          approved_requests: 0,
          pending_requests: 0,
          rejected_requests: 0,
          average_approval_time: 0
        };
      }

      return data as VerificationStats;
    } catch (error) {
      console.error('Error in getStats:', error);
      return {
        total_requests: 0,
        approved_requests: 0,
        pending_requests: 0,
        rejected_requests: 0,
        average_approval_time: 0
      };
    }
  }

  /**
   * Renew a verification
   * @param verificationId Verification ID
   * @returns Success status
   */
  async renewVerification(verificationId: string): Promise<boolean> {
    try {
      // Get the verification with service agent info
      const { data: verification, error: verificationError } = await supabase
        .from('service_agent_verification')
        .select(`
          *,
          profiles:service_agent_id(id, full_name, email, phone, business_name)
        `)
        .eq('id', verificationId)
        .single();

      if (verificationError) {
        console.error('Error fetching verification:', verificationError);
        return false;
      }

      // Check if verification is expired or about to expire
      const now = new Date();
      const expirationDate = verification.expiration_date ? new Date(verification.expiration_date) : null;

      if (!expirationDate || expirationDate > new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) {
        // Not expired or not within 30 days of expiration
        console.error('Verification is not eligible for renewal yet');
        return false;
      }

      const previousStatus = verification.verification_status;

      // Reset verification status to pending
      const { error: updateError } = await supabase
        .from('service_agent_verification')
        .update({
          verification_status: VerificationStatus.PENDING,
          is_verified: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', verificationId);

      if (updateError) {
        console.error('Error updating verification status:', updateError);
        return false;
      }

      // Add to verification history
      await supabase
        .from('verification_history')
        .insert({
          verification_id: verificationId,
          action: 'renewal_initiated',
          previous_status: previousStatus,
          new_status: VerificationStatus.PENDING,
          notes: 'Verification renewal initiated'
        });

      // Get the updated verification
      const { data: updatedVerification, error: fetchError } = await supabase
        .from('service_agent_verification')
        .select(`
          *,
          profiles:service_agent_id(id, full_name, email, phone, business_name)
        `)
        .eq('id', verificationId)
        .single();

      if (!fetchError && updatedVerification) {
        // Send email notification
        await emailNotificationService.sendVerificationStatusUpdateEmail(
          updatedVerification,
          previousStatus
        );
      }

      return true;
    } catch (error) {
      console.error('Error in renewVerification:', error);
      return false;
    }
  }

  /**
   * Check for verifications nearing expiration and send reminders
   * @param daysThreshold Number of days before expiration to send reminder
   * @returns Number of reminders sent
   */
  async sendExpirationReminders(daysThreshold: number = 30): Promise<number> {
    try {
      const now = new Date();
      const thresholdDate = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

      // Find verifications that are about to expire
      const { data, error } = await supabase
        .from('service_agent_verification')
        .select(`
          *,
          profiles:service_agent_id(id, full_name, email, phone, business_name)
        `)
        .eq('verification_status', VerificationStatus.APPROVED)
        .eq('is_verified', true)
        .lt('expiration_date', thresholdDate.toISOString())
        .gt('expiration_date', now.toISOString());

      if (error) {
        console.error('Error fetching expiring verifications:', error);
        return 0;
      }

      if (!data || data.length === 0) {
        return 0;
      }

      let remindersSent = 0;

      // Send reminders for each verification
      for (const verification of data) {
        const expirationDate = new Date(verification.expiration_date);
        const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

        const success = await emailNotificationService.sendVerificationExpirationReminderEmail(
          verification,
          daysRemaining
        );

        if (success) {
          remindersSent++;

          // Log the reminder in verification history
          await supabase
            .from('verification_history')
            .insert({
              verification_id: verification.id,
              action: 'expiration_reminder',
              previous_status: verification.verification_status,
              new_status: verification.verification_status,
              notes: `Expiration reminder sent (${daysRemaining} days remaining)`
            });
        }
      }

      return remindersSent;
    } catch (error) {
      console.error('Error in sendExpirationReminders:', error);
      return 0;
    }
  }
}

// Create a singleton instance
export const verificationService = new VerificationService();
