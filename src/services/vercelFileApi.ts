// Upload file using Vercel API
export async function uploadFileWithVercel(file: File, stable: boolean = false): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('stable', stable.toString());

  const response = await fetch('/api/upload-file', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Upload failed with status ${response.status}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Upload failed');
  }

  return data.url;
}

// Upload blob using Vercel API
export async function uploadBlobWithVercel(blob: Blob, filename: string, stable: boolean = false): Promise<string> {
  const file = new File([blob], filename, { type: blob.type });
  return uploadFileWithVercel(file, stable);
}

// Upload file from input element using Vercel API
export async function uploadFileFromInputWithVercel(input: HTMLInputElement, stable: boolean = false): Promise<string> {
  const file = input.files?.[0];
  if (!file) {
    throw new Error('No file selected');
  }
  return uploadFileWithVercel(file, stable);
} 