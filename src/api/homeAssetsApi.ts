import { supabase } from '../lib/supabaseClient';
import {
  assetInputSchema,
  homeInputSchema,
  serviceEventInputSchema,
  warrantyCoverageInputSchema
} from '../schemas/homeAsset.schema';
import {
  computeAssetRisk,
  computeNextServiceDueDate
} from '../modules/homeAssets/utils/assetComputations';
import type {
  Asset,
  AssetDetail,
  AssetDocument,
  AssetWithComputed,
  CreateAssetDocumentInput,
  CreateAssetInput,
  CreateHomeInput,
  CreateServiceEventInput,
  CreateWarrantyCoverageInput,
  HomeAssetHome,
  HomeAssetSummary,
  HomeWithSummary,
  ServiceEvent,
  WarrantyCoverage
} from '../modules/homeAssets/types';

const ensureValid = <T>(schema: { parse: (value: unknown) => T }, value: unknown): T => {
  return schema.parse(value);
};

const mapHomeInputToDb = (input: CreateHomeInput) => ({
  name: input.name,
  address: input.address_line1,
  city: input.city,
  state: input.state,
  zip_code: input.postal_code,
  year_built: input.year_built ?? null,
  square_footage: input.square_feet ?? null
});

const mapPartialHomeInputToDb = (input: Partial<CreateHomeInput>) => {
  const updates: Record<string, string | number | null> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.address_line1 !== undefined) updates.address = input.address_line1;
  if (input.city !== undefined) updates.city = input.city;
  if (input.state !== undefined) updates.state = input.state;
  if (input.postal_code !== undefined) updates.zip_code = input.postal_code;
  if (input.year_built !== undefined) updates.year_built = input.year_built ?? null;
  if (input.square_feet !== undefined) updates.square_footage = input.square_feet ?? null;
  return updates;
};

const addComputedFields = (asset: Asset): AssetWithComputed => {
  const computed = computeAssetRisk(asset);
  return {
    ...asset,
    next_service_due_date: computeNextServiceDueDate(asset),
    ...computed
  };
};

export async function listHomes(userId: string): Promise<HomeAssetHome[]> {
  const { data, error } = await supabase
    .from('homes')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createHome(userId: string, input: CreateHomeInput): Promise<HomeAssetHome> {
  const payload = ensureValid(homeInputSchema, input);
  const { data, error } = await supabase
    .from('homes')
    .insert({
      owner_id: userId,
      ...mapHomeInputToDb(payload)
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateHome(
  userId: string,
  homeId: string,
  input: Partial<CreateHomeInput>
): Promise<HomeAssetHome> {
  const payload = ensureValid(homeInputSchema.partial(), input);
  const { data, error } = await supabase
    .from('homes')
    .update(mapPartialHomeInputToDb(payload))
    .eq('id', homeId)
    .eq('owner_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getHomeSummary(userId: string, homeId: string): Promise<HomeWithSummary | null> {
  const { data: home, error: homeError } = await supabase
    .from('homes')
    .select('*')
    .eq('id', homeId)
    .eq('owner_id', userId)
    .single();

  if (homeError) {
    if (homeError.code === 'PGRST116') return null;
    throw homeError;
  }

  const assets = await listAssets(userId, homeId);
  const summary = assets.reduce<HomeAssetSummary>(
    (acc, asset) => {
      acc.total += 1;
      if (asset.isDueSoon) acc.dueSoon += 1;
      if (asset.overdueDays) acc.overdue += 1;
      if (asset.warranty_end_date && new Date(asset.warranty_end_date) > new Date()) acc.underWarranty += 1;
      if (asset.riskLevel === 'high') acc.highRisk += 1;
      return acc;
    },
    { total: 0, dueSoon: 0, overdue: 0, underWarranty: 0, highRisk: 0 }
  );

  return { home, summary };
}

export async function listAssets(userId: string, homeId: string): Promise<AssetWithComputed[]> {
  const { data, error } = await supabase
    .from('assets')
    .select('*, homes!inner(owner_id)')
    .eq('home_id', homeId)
    .eq('homes.owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => {
    const { homes, ...assetRow } = row as Asset & { homes?: { owner_id: string } };
    return addComputedFields(assetRow as Asset);
  });
}

export async function createAsset(homeId: string, input: CreateAssetInput): Promise<AssetWithComputed> {
  const payload = ensureValid(assetInputSchema, input);
  const { data, error } = await supabase
    .from('assets')
    .insert({
      home_id: homeId,
      status: payload.status || 'active',
      ...payload
    })
    .select()
    .single();

  if (error) throw error;
  return addComputedFields(data as Asset);
}

export async function updateAsset(assetId: string, input: Partial<CreateAssetInput>): Promise<AssetWithComputed> {
  const payload = ensureValid(assetInputSchema.partial(), input);
  const { data, error } = await supabase
    .from('assets')
    .update(payload)
    .eq('id', assetId)
    .select()
    .single();

  if (error) throw error;
  return addComputedFields(data as Asset);
}

export async function deleteAsset(assetId: string): Promise<void> {
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', assetId);

  if (error) throw error;
}

export async function getAssetDetail(userId: string, assetId: string): Promise<AssetDetail | null> {
  const { data: asset, error: assetError } = await supabase
    .from('assets')
    .select('*, homes!inner(owner_id)')
    .eq('id', assetId)
    .eq('homes.owner_id', userId)
    .single();

  if (assetError) {
    if (assetError.code === 'PGRST116') return null;
    throw assetError;
  }

  const { data: warranties } = await supabase
    .from('warranty_coverages')
    .select('*')
    .eq('asset_id', assetId)
    .order('created_at', { ascending: false });

  const { data: events } = await supabase
    .from('service_events')
    .select('*')
    .eq('asset_id', assetId)
    .order('event_date', { ascending: false });

  const { data: documents } = await supabase
    .from('asset_documents')
    .select('*, assets!inner(home_id, homes!inner(owner_id))')
    .eq('asset_id', assetId)
    .eq('assets.homes.owner_id', userId)
    .order('created_at', { ascending: false });

  const { homes, ...assetRow } = asset as Asset & { homes?: { owner_id: string } };

  return {
    ...(addComputedFields(assetRow as Asset) as AssetDetail),
    warranty_coverages: warranties || [],
    service_events: events || [],
    documents: (documents || []).map(({ assets, ...doc }) => doc as AssetDocument)
  };
}

export async function createWarrantyCoverage(
  assetId: string,
  input: CreateWarrantyCoverageInput
): Promise<WarrantyCoverage> {
  const payload = ensureValid(warrantyCoverageInputSchema, input);
  const { data, error } = await supabase
    .from('warranty_coverages')
    .insert({
      asset_id: assetId,
      ...payload
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWarrantyCoverage(
  warrantyId: string,
  input: Partial<CreateWarrantyCoverageInput>
): Promise<WarrantyCoverage> {
  const payload = ensureValid(warrantyCoverageInputSchema.partial(), input);
  const { data, error } = await supabase
    .from('warranty_coverages')
    .update(payload)
    .eq('id', warrantyId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWarrantyCoverage(warrantyId: string): Promise<void> {
  const { error } = await supabase
    .from('warranty_coverages')
    .delete()
    .eq('id', warrantyId);

  if (error) throw error;
}

export async function listServiceEvents(
  userId: string,
  homeId: string,
  assetId?: string | null
): Promise<ServiceEvent[]> {
  let query = supabase
    .from('service_events')
    .select('*, homes!inner(owner_id)')
    .eq('home_id', homeId)
    .eq('homes.owner_id', userId)
    .order('event_date', { ascending: false });

  if (assetId) {
    query = query.eq('asset_id', assetId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(({ homes, ...event }) => event as ServiceEvent);
}

export async function createServiceEvent(
  homeId: string,
  input: CreateServiceEventInput
): Promise<ServiceEvent> {
  const payload = ensureValid(serviceEventInputSchema, input);
  const { data, error } = await supabase
    .from('service_events')
    .insert({
      home_id: homeId,
      warranty_related: payload.warranty_related ?? false,
      ...payload
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateServiceEvent(
  eventId: string,
  input: Partial<CreateServiceEventInput>
): Promise<ServiceEvent> {
  const payload = ensureValid(serviceEventInputSchema.partial(), input);
  const { data, error } = await supabase
    .from('service_events')
    .update(payload)
    .eq('id', eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteServiceEvent(eventId: string): Promise<void> {
  const { error } = await supabase
    .from('service_events')
    .delete()
    .eq('id', eventId);

  if (error) throw error;
}

export async function uploadAssetDocument(
  userId: string,
  assetId: string,
  input: CreateAssetDocumentInput
): Promise<AssetDocument> {
  const file = input.file;
  const { data: asset, error: assetError } = await supabase
    .from('assets')
    .select('id, home_id, homes!inner(owner_id)')
    .eq('id', assetId)
    .eq('homes.owner_id', userId)
    .single();

  if (assetError) throw assetError;

  const sanitizedName = file.name.replace(/\s+/g, '-');
  const fileName = `${userId}/${asset.home_id}/${assetId}/${crypto.randomUUID()}-${sanitizedName}`;

  const { error: uploadError } = await supabase.storage
    .from('asset_documents')
    .upload(fileName, file, { contentType: file.type });

  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('asset_documents')
    .insert({
      asset_id: assetId,
      doc_type: input.doc_type,
      file_name: file.name,
      storage_path: fileName,
      bucket: 'asset_documents',
      content_type: file.type || null,
      size_bytes: file.size || null
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listAssetDocuments(userId: string, assetId: string): Promise<AssetDocument[]> {
  const { data, error } = await supabase
    .from('asset_documents')
    .select('*, assets!inner(home_id, homes!inner(owner_id))')
    .eq('asset_id', assetId)
    .eq('assets.homes.owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deleteAssetDocument(userId: string, documentId: string): Promise<void> {
  const { data, error } = await supabase
    .from('asset_documents')
    .select('*, assets!inner(home_id, homes!inner(owner_id))')
    .eq('id', documentId)
    .eq('assets.homes.owner_id', userId)
    .single();

  if (error) throw error;

  if (data?.storage_path) {
    const { error: storageError } = await supabase.storage
      .from('asset_documents')
      .remove([data.storage_path]);

    if (storageError) throw storageError;
  }

  const { error: deleteError } = await supabase
    .from('asset_documents')
    .delete()
    .eq('id', documentId);

  if (deleteError) throw deleteError;
}

export async function getAssetDocumentDownloadUrl(
  userId: string,
  documentId: string
): Promise<string> {
  const { data, error } = await supabase
    .from('asset_documents')
    .select('storage_path, bucket, assets!inner(home_id, homes!inner(owner_id))')
    .eq('id', documentId)
    .eq('assets.homes.owner_id', userId)
    .single();

  if (error) throw error;

  const bucket = data?.bucket || 'asset_documents';
  const path = data?.storage_path;
  if (!path) throw new Error('Document path missing');

  const { data: signedUrl, error: signedError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60);

  if (signedError || !signedUrl?.signedUrl) {
    throw signedError || new Error('Failed to generate download URL');
  }

  return signedUrl.signedUrl;
}
