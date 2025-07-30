# File APIs Documentation

This document explains the JavaScript/TypeScript file APIs that have been converted from the Python implementation for AWS S3 storage operations.

## Overview

The file APIs provide functionality to:
- Upload files directly to AWS S3 (DigitalOcean Spaces)
- Download files from URLs and upload them to cloud storage
- Process multiple files concurrently
- Validate image dimensions
- Handle special cases for specific domains

## Setup

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```env
VITE_AWS_S3_KEY_ID=your_access_key_id
VITE_AWS_S3_KEY_SECRET=your_secret_access_key
VITE_AWS_S3_REGION=your_region
VITE_AWS_S3_BUCKET=your_bucket_name
```

### 2. Dependencies

The following dependencies are required:

```bash
npm install @aws-sdk/client-s3
```

## API Functions

### `saveToCloud(filename: string, content: ArrayBuffer, stable: boolean = false)`

Uploads a file directly to AWS S3.

**Parameters:**
- `filename`: Name of the file
- `content`: File content as ArrayBuffer
- `stable`: If true, uses "stable" folder instead of date-based folder

**Returns:** Promise<string | null> - CDN URL or null if failed

**Example:**
```typescript
import { saveToCloud } from '../services/fileApi';

const file = new File(['content'], 'test.txt');
const arrayBuffer = await file.arrayBuffer();
const url = await saveToCloud('test.txt', arrayBuffer);
```

### `downloadToCloud(url: string, stable: boolean = false)`

Downloads a file from a URL and uploads it to cloud storage.

**Parameters:**
- `url`: Source URL to download from
- `stable`: If true, uses "stable" folder instead of date-based folder

**Returns:** Promise<string | null> - CDN URL or null if failed

**Example:**
```typescript
import { downloadToCloud } from '../services/fileApi';

const cdnUrl = await downloadToCloud('https://example.com/image.jpg');
```

### `concurrentDownloadToCloud(urls: string[])`

Downloads multiple files concurrently.

**Parameters:**
- `urls`: Array of URLs to download

**Returns:** Promise<(string | null)[]> - Array of CDN URLs

**Example:**
```typescript
import { concurrentDownloadToCloud } from '../services/fileApi';

const urls = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.png'
];
const results = await concurrentDownloadToCloud(urls);
```

### `uploadFileFromInput(file: File, stable: boolean = false)`

Helper function to upload a file from a File input.

**Parameters:**
- `file`: File object from input
- `stable`: If true, uses "stable" folder

**Returns:** Promise<string | null> - CDN URL or null if failed

**Example:**
```typescript
import { uploadFileFromInput } from '../services/fileApi';

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  const url = await uploadFileFromInput(file);
};
```

## File Organization

Files are organized in the cloud storage as follows:

```
new/
├── image/
│   ├── 20241201/
│   │   ├── uuid1.jpg
│   │   └── uuid2.png
│   └── stable/
│       └── logo.png
├── application/
│   └── 20241201/
│       └── document.pdf
└── any/
    └── 20241201/
        └── unknown.file
```

## Features

### Image Validation
- Images are validated for minimum dimensions (500x500 pixels)
- Invalid images are rejected

### Special Host Handling
- Special handling for specific domains (e.g., "batdongsan.com.vn")
- Custom headers and request strategies

### Error Handling
- Retry mechanism (up to 10 attempts for downloads)
- Comprehensive error logging
- Graceful failure handling

### File Type Detection
- Automatic MIME type detection based on file extension
- Proper content-type headers for uploads

## Usage in React Components

### Basic File Upload

```typescript
import React, { useState } from 'react';
import { uploadFileFromInput } from '../services/fileApi';

const FileUploadComponent = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadFileFromInput(file);
      if (url) {
        setUploadedUrl(url);
        console.log('Uploaded:', url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {uploadedUrl && (
        <div>
          <p>Uploaded: {uploadedUrl}</p>
          <img src={uploadedUrl} alt="Uploaded" />
        </div>
      )}
    </div>
  );
};
```

### URL Download

```typescript
import React, { useState } from 'react';
import { downloadToCloud } from '../services/fileApi';

const UrlDownloadComponent = () => {
  const [url, setUrl] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadedUrl, setDownloadedUrl] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!url) return;

    setDownloading(true);
    try {
      const cdnUrl = await downloadToCloud(url);
      if (cdnUrl) {
        setDownloadedUrl(cdnUrl);
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL"
      />
      <button onClick={handleDownload} disabled={downloading}>
        {downloading ? 'Downloading...' : 'Download'}
      </button>
      {downloadedUrl && (
        <div>
          <p>Downloaded: {downloadedUrl}</p>
        </div>
      )}
    </div>
  );
};
```

## Error Handling

The APIs include comprehensive error handling:

1. **Network Errors**: Timeout handling and retry logic
2. **File Validation**: Size and format validation
3. **AWS Errors**: Proper error logging and fallback
4. **Invalid URLs**: Graceful handling of malformed URLs

## Performance Considerations

- **Concurrent Downloads**: Limited to 5 concurrent operations
- **Image Validation**: Asynchronous validation to prevent blocking
- **Retry Logic**: Exponential backoff for failed operations
- **Memory Management**: Proper cleanup of temporary resources

## Security

- **Public Access**: All uploaded files are publicly accessible
- **Content-Type**: Proper MIME type detection and headers
- **Input Validation**: File type and size validation
- **URL Sanitization**: Proper URL parsing and validation

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Ensure all AWS S3 environment variables are set
   - Check the console for warnings about missing variables

2. **Upload Failures**
   - Verify AWS credentials are correct
   - Check bucket permissions
   - Ensure file size is within limits

3. **Download Failures**
   - Verify source URL is accessible
   - Check network connectivity
   - Ensure image meets minimum dimension requirements

4. **CORS Issues**
   - Configure CORS settings in your S3 bucket
   - Ensure proper headers are set

### Debug Mode

Enable debug logging by setting:

```typescript
// In your component or service
console.log('AWS Config:', getAWSS3Config());
```

## Migration from Python

The JavaScript implementation maintains feature parity with the Python version:

| Python Function | JavaScript Equivalent |
|----------------|----------------------|
| `save_to_cloud()` | `saveToCloud()` |
| `download_to_cloud()` | `downloadToCloud()` |
| `concurrent_download_to_cloud()` | `concurrentDownloadToCloud()` |
| `bare_request()` | `bareRequest()` (internal) |
| `special_image_download()` | `specialImageDownload()` (internal) |

All core functionality has been preserved while adapting to JavaScript/TypeScript patterns and browser APIs. 