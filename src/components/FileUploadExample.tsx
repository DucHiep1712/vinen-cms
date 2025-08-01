import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { uploadFileFromInput, downloadToCloud, concurrentDownloadToCloud } from '../services/fileApi';
import toast from 'react-hot-toast';

const FileUploadExample: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [downloadedUrl, setDownloadedUrl] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadFileFromInput(file, false);
      if (url) {
        setUploadedUrl(url);
        toast.success('File uploaded successfully!');
      } else {
        toast.error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDownloadFromUrl = async () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setDownloading(true);
    try {
      const url = await downloadToCloud(urlInput.trim(), false);
      if (url) {
        setDownloadedUrl(url);
        toast.success('File downloaded and uploaded to cloud!');
      } else {
        toast.error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleBatchDownload = async () => {
    const urls = [
      'https://example.com/image1.jpg',
      'https://example.com/image2.png',
      'https://example.com/image3.gif'
    ];

    setDownloading(true);
    try {
      const results = await concurrentDownloadToCloud(urls);
      const successCount = results.filter(url => url !== null).length;
      toast.success(`Batch download completed: ${successCount}/${urls.length} successful`);
    } catch (error) {
      console.error('Batch download error:', error);
      toast.error('Batch download failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-6">File Upload & Download Example</h2>
      
      {/* File Upload Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Upload File to Cloud</h3>
        <div className="space-y-2">
          <Label htmlFor="file-upload">Select a file to upload:</Label>
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            accept="image/*,application/pdf,text/*"
          />
          {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
          {uploadedUrl && (
            <div className="mt-2">
              <p className="text-sm font-medium">Uploaded URL:</p>
              <a 
                href={uploadedUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm break-all"
              >
                {uploadedUrl}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* URL Download Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Download from URL to Cloud</h3>
        <div className="space-y-2">
          <Label htmlFor="url-input">Enter URL to download:</Label>
          <div className="flex gap-2">
            <Input
              id="url-input"
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              disabled={downloading}
            />
            <Button 
              onClick={handleDownloadFromUrl}
              disabled={downloading || !urlInput.trim()}
            >
              {downloading ? 'Downloading...' : 'Download'}
            </Button>
          </div>
          {downloadedUrl && (
            <div className="mt-2">
              <p className="text-sm font-medium">Downloaded URL:</p>
              <a 
                href={downloadedUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm break-all"
              >
                {downloadedUrl}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Batch Download Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Batch Download</h3>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Download multiple files concurrently (example URLs)
          </p>
          <Button 
            onClick={handleBatchDownload}
            disabled={downloading}
            variant="outline"
          >
            {downloading ? 'Processing...' : 'Batch Download'}
          </Button>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">Usage Instructions:</h4>
        <ul className="text-sm space-y-1 text-gray-600">
          <li>• <strong>File Upload:</strong> Select a file to upload directly to AWS S3</li>
          <li>• <strong>URL Download:</strong> Enter a URL to download and upload to cloud storage</li>
          <li>• <strong>Batch Download:</strong> Download multiple files concurrently</li>
          <li>• Files are organized by date and file type in the cloud storage</li>
          <li>• Images are validated for minimum dimensions (500x500)</li>
          <li>• All uploaded files are publicly accessible via CDN URLs</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUploadExample; 