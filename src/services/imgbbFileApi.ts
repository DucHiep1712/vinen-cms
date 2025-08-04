// Upload file using ImgBB API
export async function uploadFileWithImgBB(file: File, stable: boolean = false): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('stable', stable.toString());

  const response = await fetch('/api/upload-imgbb', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Upload failed');
  }

  const result = await response.json();
  return result.url;
}

// Upload blob using ImgBB API
export async function uploadBlobWithImgBB(blob: Blob, filename: string, stable: boolean = false): Promise<string> {
  const file = new File([blob], filename, { type: blob.type });
  return uploadFileWithImgBB(file, stable);
}

// Upload file from input element using ImgBB API
export async function uploadFileFromInputWithImgBB(input: HTMLInputElement, stable: boolean = false): Promise<string> {
  const file = input.files?.[0];
  if (!file) {
    throw new Error('No file selected');
  }
  return uploadFileWithImgBB(file, stable);
} 