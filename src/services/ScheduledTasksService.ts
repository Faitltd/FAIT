import { verificationService } from './VerificationService';

/**
 * Service for handling scheduled tasks
 */
export class ScheduledTasksService {
  /**
   * Run all scheduled tasks
   */
  async runAllTasks(): Promise<void> {
    try {
      console.log('Running scheduled tasks...');
      
      // Send verification expiration reminders
      const remindersSent = await this.sendVerificationExpirationReminders();
      console.log(`Sent ${remindersSent} verification expiration reminders`);
      
      // Add more scheduled tasks here as needed
      
      console.log('Scheduled tasks completed');
    } catch (error) {
      console.error('Error running scheduled tasks:', error);
    }
  }
  
  /**
   * Send verification expiration reminders
   * @returns Number of reminders sent
   */
  async sendVerificationExpirationReminders(): Promise<number> {
    try {
      // Send reminders for verifications expiring in 30 days
      const remindersSent30Days = await verificationService.sendExpirationReminders(30);
      
      // Send reminders for verifications expiring in 7 days
      const remindersSent7Days = await verificationService.sendExpirationReminders(7);
      
      // Send reminders for verifications expiring in 1 day
      const remindersSent1Day = await verificationService.sendExpirationReminders(1);
      
      return remindersSent30Days + remindersSent7Days + remindersSent1Day;
    } catch (error) {
      console.error('Error sending verification expiration reminders:', error);
      return 0;
    }
  }
}

// Create a singleton instance
export const scheduledTasksService = new ScheduledTasksService();
