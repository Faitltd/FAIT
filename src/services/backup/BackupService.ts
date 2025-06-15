import { Logger } from '../logging/Logger';
import { ApiClient } from '../api/ApiClient';
import { environment } from '../../config/environment';

interface BackupConfig {
  frequency: number; // milliseconds
  maxBackups: number;
  path: string;
}

export class BackupService {
  private static instance: BackupService;
  private logger: Logger;
  private backupInterval: NodeJS.Timeout | null = null;
  private apiClient: ApiClient;

  private constructor(private config: BackupConfig) {
    this.logger = new Logger('BackupService');
    this.apiClient = ApiClient.getInstance();
    this.startBackupSchedule();
  }

  public static getInstance(config?: BackupConfig): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService(config || {
        frequency: 24 * 60 * 60 * 1000, // Daily
        maxBackups: 7,
        path: '/backups'
      });
    }
    return BackupService.instance;
  }

  private async startBackupSchedule(): Promise<void> {
    this.backupInterval = setInterval(
      () => this.createBackup(),
      this.config.frequency
    );
  }

  private async createBackup(): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const backupData = await this.gatherBackupData();
      
      await this.saveBackup(backupData, timestamp);
      await this.cleanOldBackups();
      
      this.logger.info('Backup created successfully', { timestamp });
    } catch (error) {
      this.logger.error('Failed to create backup:', error);
    }
  }

  private async gatherBackupData(): Promise<any> {
    try {
      // Gather critical data for backup
      const [usersResponse, settingsResponse, transactionsResponse] = await Promise.all([
        this.apiClient.get('/users'),
        this.apiClient.get('/settings'),
        this.apiClient.get('/transactions')
      ]);

      const users = usersResponse.data || [];
      const settings = settingsResponse.data || {};
      const transactions = transactionsResponse.data || [];

      return {
        timestamp: new Date().toISOString(),
        users,
        settings,
        transactions
      };
    } catch (error) {
      this.logger.error('Failed to gather backup data:', error);
      return {
        timestamp: new Date().toISOString(),
        error: 'Failed to gather backup data'
      };
    }
  }

  private async saveBackup(data: any, timestamp: string): Promise<void> {
    try {
      const response = await fetch(`${environment.apiUrl}/backups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp,
          data
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save backup: ${response.statusText}`);
      }
    } catch (error) {
      this.logger.error('Failed to save backup:', error);
      throw error;
    }
  }

  private async cleanOldBackups(): Promise<void> {
    try {
      const response = await fetch(`${environment.apiUrl}/backups`);
      const backups = await response.json();

      if (backups.length > this.config.maxBackups) {
        const oldestBackups = backups
          .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(this.config.maxBackups);

        await Promise.all(
          oldestBackups.map((backup: any) =>
            fetch(`${environment.apiUrl}/backups/${backup.id}`, {
              method: 'DELETE',
            })
          )
        );
      }
    } catch (error) {
      this.logger.error('Failed to clean old backups:', error);
    }
  }

  public stopBackupSchedule(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
  }
}
