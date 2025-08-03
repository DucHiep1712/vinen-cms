// Upload file using Cloudinary API
export async function uploadFileWithCloudinary(file: File, stable: boolean = false): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('stable', stable.toString());

  const response = await fetch('/api/upload-cloudinary', {
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

// Upload blob using Cloudinary API
export async function uploadBlobWithCloudinary(blob: Blob, filename: string, stable: boolean = false): Promise<string> {
  const file = new File([blob], filename, { type: blob.type });
  return uploadFileWithCloudinary(file, stable);
}

// Upload file from input element using Cloudinary API
export async function uploadFileFromInputWithCloudinary(input: HTMLInputElement, stable: boolean = false): Promise<string> {
  const file = input.files?.[0];
  if (!file) {
    throw new Error('No file selected');
  }
  return uploadFileWithCloudinary(file, stable);
} 