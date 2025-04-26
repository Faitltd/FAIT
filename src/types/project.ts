export interface Project {
  id: string;
  name: string;
  description?: string;
  client_id?: string;
  service_agent_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
  address?: string;
  budget?: number;
  start_date?: string;
  end_date?: string;
}
