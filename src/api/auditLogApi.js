import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getAuditLogs(filters = {}) {
  try {
    let query = supabase
      .from('admin_audit_logs')
      .select(`
        id,
        action_type,
        table_name,
        record_id,
        previous_data,
        new_data,
        ip_address,
        user_agent,
        created_at,
        admin:admin_id(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (filters.adminId) {
      query = query.eq('admin_id', filters.adminId);
    }
    
    if (filters.actionType) {
      query = query.eq('action_type', filters.actionType);
    }
    
    if (filters.tableName) {
      query = query.eq('table_name', filters.tableName);
    }
    
    if (filters.recordId) {
      query = query.eq('record_id', filters.recordId);
    }
    
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    
    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return { data, count };
  } catch (error) {
    console.error('Error getting audit logs:', error);
    throw error;
  }
}

export async function getAuditLog(logId) {
  try {
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select(`
        id,
        action_type,
        table_name,
        record_id,
        previous_data,
        new_data,
        ip_address,
        user_agent,
        created_at,
        admin:admin_id(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', logId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error getting audit log:', error);
    throw error;
  }
}

export async function getRecordAuditLogs(tableName, recordId) {
  try {
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select(`
        id,
        action_type,
        table_name,
        record_id,
        previous_data,
        new_data,
        ip_address,
        user_agent,
        created_at,
        admin:admin_id(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('table_name', tableName)
      .eq('record_id', recordId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error getting record audit logs:', error);
    throw error;
  }
}

export async function createManualAuditLog(actionType, tableName, recordId, previousData = null, newData = null) {
  try {
    const { data, error } = await supabase.rpc('create_admin_audit_log', {
      p_action_type: actionType,
      p_table_name: tableName,
      p_record_id: recordId,
      p_previous_data: previousData,
      p_new_data: newData
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating manual audit log:', error);
    throw error;
  }
}
