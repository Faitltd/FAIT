import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Download, Calendar, Clock } from 'lucide-react';
import type { Database } from '../lib/database.types';

type ProjectDocument = Database['public']['Tables']['project_documents']['Row'];

interface DocumentsListProps {
  bookingId?: string;
  documents: ProjectDocument[];
}

const DocumentsList: React.FC<DocumentsListProps> = ({ bookingId, documents: initialDocuments }) => {