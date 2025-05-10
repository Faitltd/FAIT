-- Add document signatures functionality

-- Start transaction
BEGIN;

-- Add status and signature fields to documents table
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft' 
  CHECK (status IN ('draft', 'sent', 'signed', 'expired', 'rejected')),
ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS signed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create document signatures table
CREATE TABLE IF NOT EXISTS public.document_signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  signature_url TEXT NOT NULL,
  position_x INTEGER,
  position_y INTEGER,
  page INTEGER,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add RLS policies for document signatures
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;

-- Policy for selecting document signatures
CREATE POLICY "Users can view document signatures they created or for documents they own"
ON public.document_signatures FOR SELECT
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_id AND documents.uploaded_by = auth.uid()
  )
);

-- Policy for inserting document signatures
CREATE POLICY "Users can create their own signatures"
ON public.document_signatures FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Create function to update document status when signed
CREATE OR REPLACE FUNCTION update_document_status_on_signature()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.documents
  SET 
    status = 'signed',
    signed_at = NEW.signed_at,
    signed_by = NEW.user_id
  WHERE id = NEW.document_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update document status when signed
CREATE TRIGGER update_document_status_trigger
AFTER INSERT ON public.document_signatures
FOR EACH ROW
EXECUTE FUNCTION update_document_status_on_signature();

-- Commit transaction
COMMIT;
