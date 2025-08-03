// Mock file upload API for local testing
export async function uploadFileWithMock(file: File, stable: boolean = false): Promise<string> {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a mock URL (you can replace this with a real image URL for testing)
  const mockUrl = 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Uploaded+Image';
  
  console.log('Mock upload successful:', {
    filename: file.name,
    size: file.size,
    type: file.type,
    stable,
    url: mockUrl
  });
  
  return mockUrl;
}

export async function uploadBlobWithMock(blob: Blob, filename: string, stable: boolean = false): Promise<string> {
  const file = new File([blob], filename, { type: blob.type });
  return uploadFileWithMock(file, stable);
}

export async function uploadFileFromInputWithMock(input: HTMLInputElement, stable: boolean = false): Promise<string> {
  const file = input.files?.[0];
  if (!file) {
    throw new Error('No file selected');
  }
  return uploadFileWithMock(file, stable);
} 