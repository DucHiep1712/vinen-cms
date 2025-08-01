// Proxy-based file upload service using Supabase Edge Functions
// This bypasses CORS issues by uploading through a server-side proxy

// Get the Supabase URL for the Edge Function
function getSupabaseUrl(): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL is not configured');
  }
  return `${supabaseUrl}/functions/v1/upload-file`;
}

// Upload file using the proxy
export async function uploadFileWithProxy(file: File, stable: boolean = false): Promise<string | null> {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 10MB.');
    }

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('stable', stable.toString());

    // Upload to proxy
    const response = await fetch(getSupabaseUrl(), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || `Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    return result.url;
  } catch (error) {
    console.error('Proxy upload failed:', error);
    throw error;
  }
}

// Upload blob using the proxy
export async function uploadBlobWithProxy(blob: Blob, filename: string, stable: boolean = false): Promise<string | null> {
  try {
    // Convert blob to file
    const file = new File([blob], filename, { type: blob.type });
    return await uploadFileWithProxy(file, stable);
  } catch (error) {
    console.error('Blob upload failed:', error);
    throw error;
  }
}

// Upload from input element
export async function uploadFileFromInputWithProxy(input: HTMLInputElement, stable: boolean = false): Promise<string | null> {
  try {
    const file = input.files?.[0];
    if (!file) {
      throw new Error('No file selected');
    }
    return await uploadFileWithProxy(file, stable);
  } catch (error) {
    console.error('Input upload failed:', error);
    throw error;
  }
}

// Batch upload multiple files
export async function uploadMultipleFilesWithProxy(files: File[], stable: boolean = false): Promise<(string | null)[]> {
  try {
    const uploadPromises = files.map(file => uploadFileWithProxy(file, stable));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Batch upload failed:', error);
    throw error;
  }
}

// Download and upload from URL using proxy
export async function downloadAndUploadWithProxy(url: string, stable: boolean = false): Promise<string | null> {
  try {
    // Download the file
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const blob = await response.blob();
    const filename = url.split('/').pop() || 'downloaded-file.jpg';
    
    // Upload using proxy
    return await uploadBlobWithProxy(blob, filename, stable);
  } catch (error) {
    console.error('Download and upload failed:', error);
    throw error;
  }
} 