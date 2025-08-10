import React, { useState } from 'react';
import { Button } from './ui/button';
import { getAWSS3Config } from '../services/fileConfig';
import { uploadFileFromInput } from '../services/fileApi';
import toast from 'react-hot-toast';

const AWSConfigTest: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [testResult, setTestResult] = useState<string>('');
  const [detailedError, setDetailedError] = useState<string>('');

  const testConfig = () => {
    try {
      const awsConfig = getAWSS3Config();
      setConfig(awsConfig);
      
      // Check if all required values are present
      const missingVars = Object.entries(awsConfig)
        .filter(([key, value]) => !value && key !== 'ENDPOINT')
        .map(([key]) => key);

      if (missingVars.length > 0) {
        setTestResult(`❌ Missing environment variables: ${missingVars.join(', ')}`);
        setDetailedError(`Missing: ${missingVars.join(', ')}`);
        toast.error('AWS configuration incomplete');
      } else {
        setTestResult('✅ AWS configuration looks good!');
        setDetailedError('');
        toast.success('AWS configuration verified');
      }
    } catch (error) {
      setTestResult(`❌ Configuration error: ${error}`);
      setDetailedError(String(error));
      toast.error('Configuration error');
    }
  };

  const testUpload = async () => {
    // Create a simple test file
    const testContent = 'This is a test file for AWS S3 upload';
    const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
    
    try {
      setTestResult('🔄 Testing upload...');
      setDetailedError('');
      
      const url = await uploadFileFromInput(testFile, false);
      
      if (url) {
        setTestResult(`✅ Upload successful! URL: ${url}`);
        setDetailedError('');
        toast.success('Upload test successful');
      } else {
        setTestResult('❌ Upload failed - no URL returned');
        setDetailedError('The upload function returned null or undefined');
        toast.error('Upload test failed');
      }
    } catch (error) {
      setTestResult(`❌ Upload error: ${error}`);
      setDetailedError(String(error));
      toast.error('Upload test failed');
    }
  };

  const checkEnvVars = () => {
    const envVars = {
      'VITE_AWS_S3_KEY_ID': import.meta.env.VITE_AWS_S3_KEY_ID,
      'VITE_AWS_S3_KEY_SECRET': import.meta.env.VITE_AWS_S3_KEY_SECRET,
      'VITE_AWS_S3_REGION': import.meta.env.VITE_AWS_S3_REGION,
      'VITE_AWS_S3_BUCKET': import.meta.env.VITE_AWS_S3_BUCKET,
    };

    const missing = Object.entries(envVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      setTestResult(`❌ Missing environment variables: ${missing.join(', ')}`);
      setDetailedError(`Environment variables not found: ${missing.join(', ')}\n\nMake sure to add these to your .env file and restart the dev server.`);
    } else {
      setTestResult('✅ All environment variables are present');
      setDetailedError('Environment variables found. Check the configuration test above for more details.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-6">AWS S3 Configuration Test</h2>
      
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={checkEnvVars} variant="outline" className="cursor-pointer">
            Check Env Vars
          </Button>
          <Button onClick={testConfig} variant="outline" className="cursor-pointer">
            Test Configuration
          </Button>
          <Button onClick={testUpload} variant="outline" className="cursor-pointer">
            Test Upload
          </Button>
        </div>

        {config && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Current Configuration:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>
        )}

        {testResult && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Test Result:</h3>
            <p className="text-sm">{testResult}</p>
          </div>
        )}

        {detailedError && (
          <div className="p-4 bg-red-50 rounded-lg">
            <h3 className="font-semibold mb-2 text-red-700">Detailed Error:</h3>
            <pre className="text-xs text-red-600 whitespace-pre-wrap">{detailedError}</pre>
          </div>
        )}

        <div className="p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold mb-2">Setup Instructions:</h3>
          <ol className="text-sm space-y-1">
            <li>1. Add AWS S3 environment variables to your <code>.env</code> file:</li>
            <li className="ml-4">
              <code>VITE_AWS_S3_KEY_ID=your_access_key_id</code>
            </li>
            <li className="ml-4">
              <code>VITE_AWS_S3_KEY_SECRET=your_secret_access_key</code>
            </li>
            <li className="ml-4">
              <code>VITE_AWS_S3_REGION=your_region</code>
            </li>
            <li className="ml-4">
              <code>VITE_AWS_S3_BUCKET=your_bucket_name</code>
            </li>
            <li>2. Restart your development server</li>
            <li>3. Click "Check Env Vars" to verify environment variables</li>
            <li>4. Click "Test Configuration" to verify AWS setup</li>
            <li>5. Click "Test Upload" to test file upload functionality</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AWSConfigTest; 