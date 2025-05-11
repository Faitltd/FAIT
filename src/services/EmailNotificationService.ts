import { supabase } from '../lib/supabase';
import { ServiceAgentVerification, VerificationStatus } from '../types/verification.types';

/**
 * Email notification service for sending verification-related emails
 */
export class EmailNotificationService {
  /**
   * Send a verification status update email
   * @param verification The verification object
   * @param previousStatus The previous verification status
   */
  async sendVerificationStatusUpdateEmail(
    verification: ServiceAgentVerification,
    previousStatus: VerificationStatus
  ): Promise<boolean> {
    try {
      if (!verification.profiles?.email) {
        console.error('No email address found for service agent');
        return false;
      }

      const emailData = this.getEmailContentForStatus(verification, previousStatus);
      
      // Call the Supabase Edge Function to send the email
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: verification.profiles.email,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text
        }
      });

      if (error) {
        console.error('Error sending verification email:', error);
        return false;
      }

      // Log the notification
      await this.logEmailNotification(verification, emailData.subject);
      
      return true;
    } catch (err) {
      console.error('Error in sendVerificationStatusUpdateEmail:', err);
      return false;
    }
  }

  /**
   * Send a document status update email
   * @param verification The verification object
   * @param documentName The name of the document
   * @param isApproved Whether the document was approved or rejected
   * @param rejectionReason The reason for rejection (if applicable)
   */
  async sendDocumentStatusUpdateEmail(
    verification: ServiceAgentVerification,
    documentName: string,
    isApproved: boolean,
    rejectionReason?: string
  ): Promise<boolean> {
    try {
      if (!verification.profiles?.email) {
        console.error('No email address found for service agent');
        return false;
      }

      const subject = isApproved
        ? `Document Approved: ${documentName}`
        : `Document Requires Attention: ${documentName}`;

      const html = isApproved
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #333;">Document Approved</h2>
            <p>Hello ${verification.profiles.full_name || 'there'},</p>
            <p>Good news! Your document <strong>${documentName}</strong> has been approved.</p>
            <p>You can view your verification status by logging into your account.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p>Thank you for being part of FAIT Co-op!</p>
            </div>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #333;">Document Requires Attention</h2>
            <p>Hello ${verification.profiles.full_name || 'there'},</p>
            <p>Your document <strong>${documentName}</strong> requires attention.</p>
            ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
            <p>Please log into your account to upload a new document or address the issues mentioned.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p>Thank you for your cooperation.</p>
            </div>
          </div>
        `;

      const text = isApproved
        ? `Document Approved: ${documentName}\n\nHello ${verification.profiles.full_name || 'there'},\n\nGood news! Your document "${documentName}" has been approved.\n\nYou can view your verification status by logging into your account.\n\nThank you for being part of FAIT Co-op!`
        : `Document Requires Attention: ${documentName}\n\nHello ${verification.profiles.full_name || 'there'},\n\nYour document "${documentName}" requires attention.\n\n${rejectionReason ? `Reason: ${rejectionReason}\n\n` : ''}Please log into your account to upload a new document or address the issues mentioned.\n\nThank you for your cooperation.`;

      // Call the Supabase Edge Function to send the email
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: verification.profiles.email,
          subject,
          html,
          text
        }
      });

      if (error) {
        console.error('Error sending document status email:', error);
        return false;
      }

      // Log the notification
      await this.logEmailNotification(verification, subject);
      
      return true;
    } catch (err) {
      console.error('Error in sendDocumentStatusUpdateEmail:', err);
      return false;
    }
  }

  /**
   * Send a verification expiration reminder email
   * @param verification The verification object
   * @param daysRemaining The number of days remaining until expiration
   */
  async sendVerificationExpirationReminderEmail(
    verification: ServiceAgentVerification,
    daysRemaining: number
  ): Promise<boolean> {
    try {
      if (!verification.profiles?.email) {
        console.error('No email address found for service agent');
        return false;
      }

      const subject = `Your Verification Will Expire in ${daysRemaining} Days`;
      const expirationDate = verification.expiration_date 
        ? new Date(verification.expiration_date).toLocaleDateString() 
        : 'soon';

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">Verification Expiration Reminder</h2>
          <p>Hello ${verification.profiles.full_name || 'there'},</p>
          <p>This is a reminder that your verification will expire in <strong>${daysRemaining} days</strong> (on ${expirationDate}).</p>
          <p>To maintain your verified status, please log into your account and renew your verification before it expires.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p>Thank you for being part of FAIT Co-op!</p>
          </div>
        </div>
      `;

      const text = `Verification Expiration Reminder\n\nHello ${verification.profiles.full_name || 'there'},\n\nThis is a reminder that your verification will expire in ${daysRemaining} days (on ${expirationDate}).\n\nTo maintain your verified status, please log into your account and renew your verification before it expires.\n\nThank you for being part of FAIT Co-op!`;

      // Call the Supabase Edge Function to send the email
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: verification.profiles.email,
          subject,
          html,
          text
        }
      });

      if (error) {
        console.error('Error sending expiration reminder email:', error);
        return false;
      }

      // Log the notification
      await this.logEmailNotification(verification, subject);
      
      return true;
    } catch (err) {
      console.error('Error in sendVerificationExpirationReminderEmail:', err);
      return false;
    }
  }

  /**
   * Get email content based on verification status
   * @param verification The verification object
   * @param previousStatus The previous verification status
   * @returns Email content (subject, html, text)
   */
  private getEmailContentForStatus(
    verification: ServiceAgentVerification,
    previousStatus: VerificationStatus
  ): { subject: string; html: string; text: string } {
    const userName = verification.profiles?.full_name || 'there';
    
    switch (verification.verification_status) {
      case VerificationStatus.APPROVED:
        return {
          subject: 'Your Verification Has Been Approved!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
              <h2 style="color: #333;">Verification Approved</h2>
              <p>Hello ${userName},</p>
              <p>Congratulations! Your verification has been approved.</p>
              <p>You now have full access to all features of the FAIT Co-op platform.</p>
              <p>Your verification is valid until ${new Date(verification.expiration_date || '').toLocaleDateString()}.</p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p>Thank you for being part of FAIT Co-op!</p>
              </div>
            </div>
          `,
          text: `Verification Approved\n\nHello ${userName},\n\nCongratulations! Your verification has been approved.\n\nYou now have full access to all features of the FAIT Co-op platform.\n\nYour verification is valid until ${new Date(verification.expiration_date || '').toLocaleDateString()}.\n\nThank you for being part of FAIT Co-op!`
        };
      
      case VerificationStatus.REJECTED:
        return {
          subject: 'Your Verification Requires Attention',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
              <h2 style="color: #333;">Verification Requires Attention</h2>
              <p>Hello ${userName},</p>
              <p>We've reviewed your verification submission and found some issues that need to be addressed.</p>
              ${verification.rejection_reason ? `<p><strong>Reason:</strong> ${verification.rejection_reason}</p>` : ''}
              <p>Please log into your account to address these issues and resubmit your verification.</p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p>If you have any questions, please contact our support team.</p>
              </div>
            </div>
          `,
          text: `Verification Requires Attention\n\nHello ${userName},\n\nWe've reviewed your verification submission and found some issues that need to be addressed.\n\n${verification.rejection_reason ? `Reason: ${verification.rejection_reason}\n\n` : ''}Please log into your account to address these issues and resubmit your verification.\n\nIf you have any questions, please contact our support team.`
        };
      
      case VerificationStatus.IN_REVIEW:
        return {
          subject: 'Your Verification Is Being Reviewed',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
              <h2 style="color: #333;">Verification In Review</h2>
              <p>Hello ${userName},</p>
              <p>Your verification submission is now being reviewed by our team.</p>
              <p>We'll notify you once the review is complete. This typically takes 1-2 business days.</p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p>Thank you for your patience.</p>
              </div>
            </div>
          `,
          text: `Verification In Review\n\nHello ${userName},\n\nYour verification submission is now being reviewed by our team.\n\nWe'll notify you once the review is complete. This typically takes 1-2 business days.\n\nThank you for your patience.`
        };
      
      case VerificationStatus.EXPIRED:
        return {
          subject: 'Your Verification Has Expired',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
              <h2 style="color: #333;">Verification Expired</h2>
              <p>Hello ${userName},</p>
              <p>Your verification has expired. To continue using all features of the FAIT Co-op platform, please renew your verification.</p>
              <p>Log into your account and visit the verification page to start the renewal process.</p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p>We look forward to continuing our partnership.</p>
              </div>
            </div>
          `,
          text: `Verification Expired\n\nHello ${userName},\n\nYour verification has expired. To continue using all features of the FAIT Co-op platform, please renew your verification.\n\nLog into your account and visit the verification page to start the renewal process.\n\nWe look forward to continuing our partnership.`
        };
      
      default:
        return {
          subject: 'Verification Status Update',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
              <h2 style="color: #333;">Verification Status Update</h2>
              <p>Hello ${userName},</p>
              <p>There has been an update to your verification status.</p>
              <p>Please log into your account to view the details.</p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p>Thank you for being part of FAIT Co-op!</p>
              </div>
            </div>
          `,
          text: `Verification Status Update\n\nHello ${userName},\n\nThere has been an update to your verification status.\n\nPlease log into your account to view the details.\n\nThank you for being part of FAIT Co-op!`
        };
    }
  }

  /**
   * Log email notification to the database
   * @param verification The verification object
   * @param subject The email subject
   */
  private async logEmailNotification(
    verification: ServiceAgentVerification,
    subject: string
  ): Promise<void> {
    try {
      await supabase.from('notifications').insert({
        user_id: verification.service_agent_id,
        title: subject,
        message: `Your verification status has been updated. Please check your email for details.`,
        type: 'verification',
        read: false,
        data: { verification_id: verification.id }
      });
    } catch (err) {
      console.error('Error logging email notification:', err);
    }
  }
}

// Create a singleton instance
export const emailNotificationService = new EmailNotificationService();
