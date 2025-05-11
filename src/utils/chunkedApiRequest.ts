/**
 * Utility for making API requests with large payloads by chunking
 */

interface ChunkedApiRequestOptions {
  /** Maximum chunk size in bytes */
  maxChunkSize?: number;
  /** Headers to include in the request */
  headers?: Record<string, string>;
  /** Request method */
  method?: 'POST' | 'PUT' | 'PATCH';
  /** Whether to include credentials */
  credentials?: RequestCredentials;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Progress callback */
  onProgress?: (sent: number, total: number) => void;
  /** Whether to retry failed requests */
  retry?: boolean;
  /** Maximum number of retries */
  maxRetries?: number;
  /** Delay between retries in milliseconds */
  retryDelay?: number;
}

/**
 * Make an API request with a large payload by chunking
 */
export async function chunkedApiRequest<T>(
  url: string,
  payload: any,
  options: ChunkedApiRequestOptions = {}
): Promise<T> {
  const {
    maxChunkSize = 1024 * 1024, // 1MB
    headers = {},
    method = 'POST',
    credentials = 'same-origin',
    timeout = 30000,
    onProgress,
    retry = true,
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  // Convert payload to string if it's not already
  const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const totalSize = payloadString.length;

  // If payload is small enough, make a single request
  if (totalSize <= maxChunkSize) {
    return makeRequest(url, payloadString, {
      headers,
      method,
      credentials,
      timeout,
      retry,
      maxRetries,
      retryDelay,
    });
  }

  // Split payload into chunks
  const chunks: string[] = [];
  for (let i = 0; i < totalSize; i += maxChunkSize) {
    chunks.push(payloadString.substring(i, i + maxChunkSize));
  }

  // Generate a unique ID for this chunked request
  const requestId = generateRequestId();

  // Send chunks
  let sentSize = 0;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkHeaders = {
      ...headers,
      'X-Chunked-Request-ID': requestId,
      'X-Chunk-Index': String(i),
      'X-Chunk-Count': String(chunks.length),
    };

    await makeRequest(`${url}/chunk`, chunk, {
      headers: chunkHeaders,
      method,
      credentials,
      timeout,
      retry,
      maxRetries,
      retryDelay,
    });

    sentSize += chunk.length;
    if (onProgress) {
      onProgress(sentSize, totalSize);
    }
  }

  // Complete the chunked request
  return makeRequest(`${url}/complete`, JSON.stringify({ requestId }), {
    headers,
    method,
    credentials,
    timeout,
    retry,
    maxRetries,
    retryDelay,
  });
}

/**
 * Make a single API request with retry logic
 */
async function makeRequest<T>(
  url: string,
  payload: string,
  options: {
    headers?: Record<string, string>;
    method?: string;
    credentials?: RequestCredentials;
    timeout?: number;
    retry?: boolean;
    maxRetries?: number;
    retryDelay?: number;
  }
): Promise<T> {
  const {
    headers = {},
    method = 'POST',
    credentials = 'same-origin',
    timeout = 30000,
    retry = true,
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  let attempts = 0;

  while (attempts < maxRetries) {
    attempts++;

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: payload,
        credentials,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (!retry || attempts >= maxRetries) {
        throw error;
      }

      // Exponential backoff
      const delay = retryDelay * Math.pow(2, attempts - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Maximum retry attempts exceeded');
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Upload a large file in chunks
 */
export async function chunkedFileUpload(
  url: string,
  file: File,
  options: ChunkedApiRequestOptions & {
    fieldName?: string;
    metadata?: Record<string, any>;
  } = {}
): Promise<any> {
  const {
    maxChunkSize = 1024 * 1024 * 5, // 5MB
    headers = {},
    credentials = 'same-origin',
    timeout = 60000,
    onProgress,
    retry = true,
    maxRetries = 3,
    retryDelay = 1000,
    fieldName = 'file',
    metadata = {},
  } = options;

  // Generate a unique ID for this upload
  const uploadId = generateRequestId();
  const totalSize = file.size;
  const totalChunks = Math.ceil(totalSize / maxChunkSize);

  // Initialize upload
  const initResponse = await makeRequest(`${url}/init`, JSON.stringify({
    uploadId,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    totalChunks,
    metadata,
  }), {
    headers,
    method: 'POST',
    credentials,
    timeout,
    retry,
    maxRetries,
    retryDelay,
  });

  // Upload chunks
  let uploadedSize = 0;
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * maxChunkSize;
    const end = Math.min(start + maxChunkSize, totalSize);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append('uploadId', uploadId);
    formData.append('chunkIndex', String(chunkIndex));
    formData.append(fieldName, chunk, file.name);

    // Upload chunk
    await fetch(`${url}/chunk`, {
      method: 'POST',
      body: formData,
      headers: {
        ...headers,
        'X-Upload-ID': uploadId,
        'X-Chunk-Index': String(chunkIndex),
        'X-Total-Chunks': String(totalChunks),
      },
      credentials,
    });

    uploadedSize += chunk.size;
    if (onProgress) {
      onProgress(uploadedSize, totalSize);
    }
  }

  // Complete upload
  return makeRequest(`${url}/complete`, JSON.stringify({
    uploadId,
    fileName: file.name,
    fileType: file.type,
    metadata,
  }), {
    headers,
    method: 'POST',
    credentials,
    timeout,
    retry,
    maxRetries,
    retryDelay,
  });
}
