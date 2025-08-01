// AWS S3 Configuration
export interface AWSS3Config {
  ACCESS_KEY_ID: string;
  ACCESS_KEY_SECRET: string;
  REGION: string;
  BUCKET: string;
  ENDPOINT: string;
}

// Get configuration from environment variables
export const getAWSS3Config = (): AWSS3Config => {
  const config = {
    ACCESS_KEY_ID: import.meta.env.VITE_AWS_S3_KEY_ID,
    ACCESS_KEY_SECRET: import.meta.env.VITE_AWS_S3_KEY_SECRET,
    REGION: import.meta.env.VITE_AWS_S3_REGION,
    BUCKET: import.meta.env.VITE_AWS_S3_BUCKET,
  };

  // Validate required environment variables
  const missingVars = Object.entries(config)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.warn(`Missing AWS S3 environment variables: ${missingVars.join(', ')}`);
  }

  return {
    ...config,
    ENDPOINT: `https://${config.REGION}.digitaloceanspaces.com`,
  } as AWSS3Config;
};

// Helper function to generate file URL
export const generateFileURL = (filepath: string): string => {
  const config = getAWSS3Config();
  return encodeURI(
    `https://${config.BUCKET}.${config.REGION}.digitaloceanspaces.com/${filepath}`
  );
}; 