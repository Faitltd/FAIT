import { supabase } from '../lib/supabaseClient';
import { processLargeInput, mergeResults } from '../utils/chunkProcessor';
import { apiCache } from '../lib/cacheUtils';
import { performanceMonitor } from '../lib/performanceUtils';

/**
 * Service for importing and exporting large datasets
 */
export class DataImportExportService {
  /**
   * Export service agent data to CSV format
   */
  // @performanceMonitor.createMethodDecorator({ logToConsole: true })()
  async exportServiceAgentsToCSV(options: {
    includeServices?: boolean;
    includeBookings?: boolean;
    includeReviews?: boolean;
    filterByStatus?: string;
    filterByZipCode?: string;
  } = {}): Promise<string> {
    const {
      includeServices = true,
      includeBookings = false,
      includeReviews = false,
      filterByStatus,
      filterByZipCode
    } = options;

    try {
      // Start performance monitoring
      const id = performanceMonitor.start('exportServiceAgentsToCSV', {
        options
      });

      // Fetch service agents
      let query = supabase
        .from('service_agents')
        .select(`
          id,
          created_at,
          user_id,
          business_name,
          contact_name,
          phone,
          email,
          address,
          city,
          state,
          zip_code,
          status,
          bio,
          website,
          profile_image_url,
          license_number,
          license_type,
          insurance_provider,
          insurance_policy_number,
          insurance_expiration_date,
          verified,
          verification_date,
          subscription_tier,
          subscription_status,
          subscription_start_date,
          subscription_end_date,
          average_rating,
          total_reviews,
          total_bookings,
          total_completed_bookings,
          total_cancelled_bookings,
          total_revenue,
          commission_rate,
          tax_id,
          bank_account_name,
          bank_account_type,
          bank_routing_number,
          bank_account_number,
          stripe_account_id,
          square_account_id,
          notes
        `);

      // Apply filters
      if (filterByStatus) {
        query = query.eq('status', filterByStatus);
      }

      if (filterByZipCode) {
        query = query.eq('zip_code', filterByZipCode);
      }

      // Execute query
      const { data: serviceAgents, error } = await query;

      if (error) {
        throw new Error(`Error fetching service agents: ${error.message}`);
      }

      if (!serviceAgents || serviceAgents.length === 0) {
        return 'No service agents found';
      }

      // Process in chunks to avoid memory issues
      const csvData = await processLargeInput(
        serviceAgents,
        async (chunk, index) => {
          // Generate CSV header (only for first chunk)
          let csv = index === 0 ? this.generateCSVHeader(includeServices, includeBookings, includeReviews) : '';

          // Process each service agent in the chunk
          for (const agent of chunk) {
            // Add basic service agent data
            csv += this.serviceAgentToCSVRow(agent);

            // Add related data if requested
            if (includeServices) {
              const services = await this.getServicesForAgent(agent.id);
              for (const service of services) {
                csv += this.serviceToCSVRow(agent.id, service);
              }
            }

            if (includeBookings) {
              const bookings = await this.getBookingsForAgent(agent.id);
              for (const booking of bookings) {
                csv += this.bookingToCSVRow(agent.id, booking);
              }
            }

            if (includeReviews) {
              const reviews = await this.getReviewsForAgent(agent.id);
              for (const review of reviews) {
                csv += this.reviewToCSVRow(agent.id, review);
              }
            }
          }

          return csv;
        },
        {
          maxChunkSize: 50, // Process 50 service agents at a time
          parallel: false, // Process sequentially to avoid too many DB connections
          onProgress: (processed, total) => {
            console.log(`Exporting service agents: ${processed}/${total} (${Math.round((processed / total) * 100)}%)`);
          }
        }
      );

      // Combine all chunks
      const finalCSV = mergeResults(csvData) as string;

      // End performance monitoring
      performanceMonitor.end(id, {
        serviceAgentCount: serviceAgents.length,
        csvSize: finalCSV.length
      });

      return finalCSV;
    } catch (error) {
      console.error('Error exporting service agents to CSV:', error);
      throw error;
    }
  }

  /**
   * Import service agents from CSV data
   */
  // @performanceMonitor.createMethodDecorator({ logToConsole: true })()
  async importServiceAgentsFromCSV(csvData: string): Promise<{
    imported: number;
    updated: number;
    failed: number;
    errors: string[];
  }> {
    try {
      // Start performance monitoring
      const id = performanceMonitor.start('importServiceAgentsFromCSV', {
        dataSize: csvData.length
      });

      // Parse CSV data
      const rows = csvData.split('\n');
      const header = rows[0].split(',');
      const dataRows = rows.slice(1);

      // Process in chunks to avoid memory issues
      const results = await processLargeInput(
        dataRows,
        async (chunk, index) => {
          const chunkResults = {
            imported: 0,
            updated: 0,
            failed: 0,
            errors: [] as string[]
          };

          // Process each row in the chunk
          for (const row of chunk) {
            if (!row.trim()) continue; // Skip empty rows

            try {
              const rowData = this.parseCSVRow(row, header);

              // Check if service agent already exists
              const { data: existingAgent } = await supabase
                .from('service_agents')
                .select('id')
                .eq('email', rowData.email)
                .maybeSingle();

              if (existingAgent) {
                // Update existing service agent
                const { error: updateError } = await supabase
                  .from('service_agents')
                  .update(this.sanitizeServiceAgentData(rowData))
                  .eq('id', existingAgent.id);

                if (updateError) {
                  chunkResults.failed++;
                  chunkResults.errors.push(`Error updating service agent ${rowData.email}: ${updateError.message}`);
                } else {
                  chunkResults.updated++;
                }
              } else {
                // Create new service agent
                const { error: insertError } = await supabase
                  .from('service_agents')
                  .insert(this.sanitizeServiceAgentData(rowData));

                if (insertError) {
                  chunkResults.failed++;
                  chunkResults.errors.push(`Error creating service agent ${rowData.email}: ${insertError.message}`);
                } else {
                  chunkResults.imported++;
                }
              }
            } catch (error) {
              chunkResults.failed++;
              chunkResults.errors.push(`Error processing row: ${error instanceof Error ? error.message : String(error)}`);
            }
          }

          return chunkResults;
        },
        {
          maxChunkSize: 100, // Process 100 rows at a time
          parallel: false, // Process sequentially to avoid race conditions
          onProgress: (processed, total) => {
            console.log(`Importing service agents: ${processed}/${total} (${Math.round((processed / total) * 100)}%)`);
          }
        }
      );

      // Combine all chunk results
      const finalResult = results.reduce(
        (acc, result) => {
          acc.imported += result.imported;
          acc.updated += result.updated;
          acc.failed += result.failed;
          acc.errors = [...acc.errors, ...result.errors];
          return acc;
        },
        { imported: 0, updated: 0, failed: 0, errors: [] as string[] }
      );

      // Invalidate cache
      apiCache.invalidateByPrefix('service_agents');

      // End performance monitoring
      performanceMonitor.end(id, {
        imported: finalResult.imported,
        updated: finalResult.updated,
        failed: finalResult.failed
      });

      return finalResult;
    } catch (error) {
      console.error('Error importing service agents from CSV:', error);
      throw error;
    }
  }

  /**
   * Export services data to CSV format
   */
  // @performanceMonitor.createMethodDecorator({ logToConsole: true })()
  async exportServicesToCSV(options: {
    filterByCategory?: string;
    filterByStatus?: string;
    filterByZipCode?: string;
  } = {}): Promise<string> {
    const {
      filterByCategory,
      filterByStatus,
      filterByZipCode
    } = options;

    try {
      // Start performance monitoring
      const id = performanceMonitor.start('exportServicesToCSV', {
        options
      });

      // Fetch services
      let query = supabase
        .from('services')
        .select(`
          id,
          created_at,
          service_agent_id,
          title,
          description,
          category,
          subcategory,
          price,
          price_type,
          duration,
          availability,
          zip_code,
          service_radius,
          status,
          featured,
          tags,
          image_urls,
          average_rating,
          total_reviews,
          total_bookings
        `);

      // Apply filters
      if (filterByCategory) {
        query = query.eq('category', filterByCategory);
      }

      if (filterByStatus) {
        query = query.eq('status', filterByStatus);
      }

      if (filterByZipCode) {
        query = query.eq('zip_code', filterByZipCode);
      }

      // Execute query
      const { data: services, error } = await query;

      if (error) {
        throw new Error(`Error fetching services: ${error.message}`);
      }

      if (!services || services.length === 0) {
        return 'No services found';
      }

      // Process in chunks to avoid memory issues
      const csvData = await processLargeInput(
        services,
        async (chunk, index) => {
          // Generate CSV header (only for first chunk)
          let csv = index === 0 ? this.generateServicesCSVHeader() : '';

          // Process each service in the chunk
          for (const service of chunk) {
            csv += this.serviceToCSVRow('', service);
          }

          return csv;
        },
        {
          maxChunkSize: 100, // Process 100 services at a time
          parallel: false, // Process sequentially to avoid too many DB connections
          onProgress: (processed, total) => {
            console.log(`Exporting services: ${processed}/${total} (${Math.round((processed / total) * 100)}%)`);
          }
        }
      );

      // Combine all chunks
      const finalCSV = mergeResults(csvData) as string;

      // End performance monitoring
      performanceMonitor.end(id, {
        serviceCount: services.length,
        csvSize: finalCSV.length
      });

      return finalCSV;
    } catch (error) {
      console.error('Error exporting services to CSV:', error);
      throw error;
    }
  }

  /**
   * Import services from CSV data
   */
  // @performanceMonitor.createMethodDecorator({ logToConsole: true })()
  async importServicesFromCSV(csvData: string): Promise<{
    imported: number;
    updated: number;
    failed: number;
    errors: string[];
  }> {
    try {
      // Start performance monitoring
      const id = performanceMonitor.start('importServicesFromCSV', {
        dataSize: csvData.length
      });

      // Parse CSV data
      const rows = csvData.split('\n');
      const header = rows[0].split(',');
      const dataRows = rows.slice(1);

      // Process in chunks to avoid memory issues
      const results = await processLargeInput(
        dataRows,
        async (chunk, index) => {
          const chunkResults = {
            imported: 0,
            updated: 0,
            failed: 0,
            errors: [] as string[]
          };

          // Process each row in the chunk
          for (const row of chunk) {
            if (!row.trim()) continue; // Skip empty rows

            try {
              const rowData = this.parseCSVRow(row, header);

              // Check if service already exists
              const { data: existingService } = await supabase
                .from('services')
                .select('id')
                .eq('id', rowData.id)
                .maybeSingle();

              if (existingService) {
                // Update existing service
                const { error: updateError } = await supabase
                  .from('services')
                  .update(this.sanitizeServiceData(rowData))
                  .eq('id', existingService.id);

                if (updateError) {
                  chunkResults.failed++;
                  chunkResults.errors.push(`Error updating service ${rowData.id}: ${updateError.message}`);
                } else {
                  chunkResults.updated++;
                }
              } else {
                // Create new service
                const { error: insertError } = await supabase
                  .from('services')
                  .insert(this.sanitizeServiceData(rowData));

                if (insertError) {
                  chunkResults.failed++;
                  chunkResults.errors.push(`Error creating service: ${insertError.message}`);
                } else {
                  chunkResults.imported++;
                }
              }
            } catch (error) {
              chunkResults.failed++;
              chunkResults.errors.push(`Error processing row: ${error instanceof Error ? error.message : String(error)}`);
            }
          }

          return chunkResults;
        },
        {
          maxChunkSize: 100, // Process 100 rows at a time
          parallel: false, // Process sequentially to avoid race conditions
          onProgress: (processed, total) => {
            console.log(`Importing services: ${processed}/${total} (${Math.round((processed / total) * 100)}%)`);
          }
        }
      );

      // Combine all chunk results
      const finalResult = results.reduce(
        (acc, result) => {
          acc.imported += result.imported;
          acc.updated += result.updated;
          acc.failed += result.failed;
          acc.errors = [...acc.errors, ...result.errors];
          return acc;
        },
        { imported: 0, updated: 0, failed: 0, errors: [] as string[] }
      );

      // Invalidate cache
      apiCache.invalidateByPrefix('services');

      // End performance monitoring
      performanceMonitor.end(id, {
        imported: finalResult.imported,
        updated: finalResult.updated,
        failed: finalResult.failed
      });

      return finalResult;
    } catch (error) {
      console.error('Error importing services from CSV:', error);
      throw error;
    }
  }

  /**
   * Generate CSV header for service agents export
   */
  private generateCSVHeader(includeServices: boolean, includeBookings: boolean, includeReviews: boolean): string {
    let header = 'record_type,id,business_name,contact_name,phone,email,address,city,state,zip_code,status,bio,website,profile_image_url,license_number,license_type,insurance_provider,insurance_policy_number,insurance_expiration_date,verified,verification_date,subscription_tier,subscription_status,subscription_start_date,subscription_end_date,average_rating,total_reviews,total_bookings,total_completed_bookings,total_cancelled_bookings,total_revenue,commission_rate,tax_id,bank_account_name,bank_account_type,bank_routing_number,bank_account_number,stripe_account_id,square_account_id,notes';

    if (includeServices) {
      header += ',service_id,service_title,service_description,service_category,service_subcategory,service_price,service_price_type,service_duration,service_availability,service_zip_code,service_radius,service_status,service_featured,service_tags,service_image_urls,service_average_rating,service_total_reviews,service_total_bookings';
    }

    if (includeBookings) {
      header += ',booking_id,booking_client_id,booking_service_id,booking_date,booking_start_time,booking_end_time,booking_status,booking_total_price,booking_payment_status,booking_notes';
    }

    if (includeReviews) {
      header += ',review_id,review_client_id,review_service_id,review_rating,review_comment,review_date';
    }

    return header + '\n';
  }

  /**
   * Generate CSV header for services export
   */
  private generateServicesCSVHeader(): string {
    return 'id,service_agent_id,title,description,category,subcategory,price,price_type,duration,availability,zip_code,service_radius,status,featured,tags,image_urls,average_rating,total_reviews,total_bookings\n';
  }

  /**
   * Convert service agent data to CSV row
   */
  private serviceAgentToCSVRow(agent: any): string {
    return `service_agent,${agent.id},${this.escapeCSV(agent.business_name)},${this.escapeCSV(agent.contact_name)},${this.escapeCSV(agent.phone)},${this.escapeCSV(agent.email)},${this.escapeCSV(agent.address)},${this.escapeCSV(agent.city)},${this.escapeCSV(agent.state)},${this.escapeCSV(agent.zip_code)},${this.escapeCSV(agent.status)},${this.escapeCSV(agent.bio)},${this.escapeCSV(agent.website)},${this.escapeCSV(agent.profile_image_url)},${this.escapeCSV(agent.license_number)},${this.escapeCSV(agent.license_type)},${this.escapeCSV(agent.insurance_provider)},${this.escapeCSV(agent.insurance_policy_number)},${this.escapeCSV(agent.insurance_expiration_date)},${agent.verified},${this.escapeCSV(agent.verification_date)},${this.escapeCSV(agent.subscription_tier)},${this.escapeCSV(agent.subscription_status)},${this.escapeCSV(agent.subscription_start_date)},${this.escapeCSV(agent.subscription_end_date)},${agent.average_rating},${agent.total_reviews},${agent.total_bookings},${agent.total_completed_bookings},${agent.total_cancelled_bookings},${agent.total_revenue},${agent.commission_rate},${this.escapeCSV(agent.tax_id)},${this.escapeCSV(agent.bank_account_name)},${this.escapeCSV(agent.bank_account_type)},${this.escapeCSV(agent.bank_routing_number)},${this.escapeCSV(agent.bank_account_number)},${this.escapeCSV(agent.stripe_account_id)},${this.escapeCSV(agent.square_account_id)},${this.escapeCSV(agent.notes)}`;
  }

  /**
   * Convert service data to CSV row
   */
  private serviceToCSVRow(agentId: string, service: any): string {
    if (agentId) {
      // For service agent export (includes record_type and empty fields for service agent data)
      return `service,${agentId},,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,${service.id},${this.escapeCSV(service.title)},${this.escapeCSV(service.description)},${this.escapeCSV(service.category)},${this.escapeCSV(service.subcategory)},${service.price},${this.escapeCSV(service.price_type)},${service.duration},${this.escapeCSV(JSON.stringify(service.availability))},${this.escapeCSV(service.zip_code)},${service.service_radius},${this.escapeCSV(service.status)},${service.featured},${this.escapeCSV(JSON.stringify(service.tags))},${this.escapeCSV(JSON.stringify(service.image_urls))},${service.average_rating},${service.total_reviews},${service.total_bookings}\n`;
    } else {
      // For services export
      return `${service.id},${service.service_agent_id},${this.escapeCSV(service.title)},${this.escapeCSV(service.description)},${this.escapeCSV(service.category)},${this.escapeCSV(service.subcategory)},${service.price},${this.escapeCSV(service.price_type)},${service.duration},${this.escapeCSV(JSON.stringify(service.availability))},${this.escapeCSV(service.zip_code)},${service.service_radius},${this.escapeCSV(service.status)},${service.featured},${this.escapeCSV(JSON.stringify(service.tags))},${this.escapeCSV(JSON.stringify(service.image_urls))},${service.average_rating},${service.total_reviews},${service.total_bookings}\n`;
    }
  }

  /**
   * Convert booking data to CSV row
   */
  private bookingToCSVRow(agentId: string, booking: any): string {
    return `booking,${agentId},,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,${booking.id},${booking.client_id},${booking.service_id},${this.escapeCSV(booking.booking_date)},${this.escapeCSV(booking.start_time)},${this.escapeCSV(booking.end_time)},${this.escapeCSV(booking.status)},${booking.total_price},${this.escapeCSV(booking.payment_status)},${this.escapeCSV(booking.notes)}\n`;
  }

  /**
   * Convert review data to CSV row
   */
  private reviewToCSVRow(agentId: string, review: any): string {
    return `review,${agentId},,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,${review.id},${review.client_id},${review.service_id},${review.rating},${this.escapeCSV(review.comment)},${this.escapeCSV(review.created_at)}\n`;
  }

  /**
   * Escape CSV field value
   */
  private escapeCSV(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    const stringValue = String(value);

    // If the value contains a comma, double quote, or newline, wrap it in double quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      // Replace double quotes with two double quotes
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  /**
   * Parse CSV row into object
   */
  private parseCSVRow(row: string, header: string[]): Record<string, any> {
    const result: Record<string, any> = {};
    let inQuotes = false;
    let currentValue = '';
    let columnIndex = 0;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];

      if (char === '"') {
        if (inQuotes && i + 1 < row.length && row[i + 1] === '"') {
          // Escaped quote
          currentValue += '"';
          i++; // Skip the next quote
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        if (columnIndex < header.length) {
          result[header[columnIndex]] = currentValue;
        }
        currentValue = '';
        columnIndex++;
      } else {
        // Add character to current value
        currentValue += char;
      }
    }

    // Add the last field
    if (columnIndex < header.length) {
      result[header[columnIndex]] = currentValue;
    }

    return result;
  }

  /**
   * Sanitize service agent data for database
   */
  private sanitizeServiceAgentData(data: Record<string, any>): Record<string, any> {
    // Remove fields that shouldn't be directly set
    const sanitized = { ...data };

    // Remove calculated fields
    delete sanitized.average_rating;
    delete sanitized.total_reviews;
    delete sanitized.total_bookings;
    delete sanitized.total_completed_bookings;
    delete sanitized.total_cancelled_bookings;
    delete sanitized.total_revenue;

    // Convert string values to appropriate types
    if (sanitized.verified !== undefined) {
      sanitized.verified = sanitized.verified === 'true' || sanitized.verified === true;
    }

    if (sanitized.commission_rate !== undefined) {
      sanitized.commission_rate = parseFloat(sanitized.commission_rate);
    }

    return sanitized;
  }

  /**
   * Sanitize service data for database
   */
  private sanitizeServiceData(data: Record<string, any>): Record<string, any> {
    // Remove fields that shouldn't be directly set
    const sanitized = { ...data };

    // Remove calculated fields
    delete sanitized.average_rating;
    delete sanitized.total_reviews;
    delete sanitized.total_bookings;

    // Convert string values to appropriate types
    if (sanitized.price !== undefined) {
      sanitized.price = parseFloat(sanitized.price);
    }

    if (sanitized.duration !== undefined) {
      sanitized.duration = parseInt(sanitized.duration, 10);
    }

    if (sanitized.service_radius !== undefined) {
      sanitized.service_radius = parseInt(sanitized.service_radius, 10);
    }

    if (sanitized.featured !== undefined) {
      sanitized.featured = sanitized.featured === 'true' || sanitized.featured === true;
    }

    // Parse JSON fields
    if (typeof sanitized.availability === 'string') {
      try {
        sanitized.availability = JSON.parse(sanitized.availability);
      } catch (e) {
        sanitized.availability = {};
      }
    }

    if (typeof sanitized.tags === 'string') {
      try {
        sanitized.tags = JSON.parse(sanitized.tags);
      } catch (e) {
        sanitized.tags = [];
      }
    }

    if (typeof sanitized.image_urls === 'string') {
      try {
        sanitized.image_urls = JSON.parse(sanitized.image_urls);
      } catch (e) {
        sanitized.image_urls = [];
      }
    }

    return sanitized;
  }

  /**
   * Get services for a service agent
   */
  private async getServicesForAgent(agentId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('service_agent_id', agentId);

    if (error) {
      console.error(`Error fetching services for agent ${agentId}:`, error);
      return [];
    }

    return data || [];
  }

  /**
   * Get bookings for a service agent
   */
  private async getBookingsForAgent(agentId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('service_agent_id', agentId);

    if (error) {
      console.error(`Error fetching bookings for agent ${agentId}:`, error);
      return [];
    }

    return data || [];
  }

  /**
   * Get reviews for a service agent
   */
  private async getReviewsForAgent(agentId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('service_agent_id', agentId);

    if (error) {
      console.error(`Error fetching reviews for agent ${agentId}:`, error);
      return [];
    }

    return data || [];
  }
}

// Create singleton instance
export const dataImportExportService = new DataImportExportService();
