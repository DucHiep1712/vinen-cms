import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { S3Client, PutObjectCommand } from "https://esm.sh/@aws-sdk/client-s3@3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const stable = formData.get('stable') === 'true'
    
    if (!file) {
      throw new Error('No file provided')
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 10MB.')
    }

    // Get environment variables
    const accessKeyId = Deno.env.get('DO_SPACES_KEY')
    const secretAccessKey = Deno.env.get('DO_SPACES_SECRET')
    const region = Deno.env.get('DO_SPACES_REGION')
    const bucket = Deno.env.get('DO_SPACES_BUCKET')

    if (!accessKeyId || !secretAccessKey || !region || !bucket) {
      throw new Error('DigitalOcean Spaces configuration is incomplete')
    }

    // Initialize S3 client for DigitalOcean Spaces
    const s3Client = new S3Client({
      endpoint: `https://${region}.digitaloceanspaces.com`,
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    })

    // Generate filename with timestamp and UUID
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const uuid = crypto.randomUUID()
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const filename = `${timestamp}-${uuid}.${fileExtension}`

    // Determine folder structure
    const rootFolder = "new"
    const subFolder = stable ? "stable" : timestamp
    const mimeType = file.type || 'application/octet-stream'
    const folder = mimeType.split('/')[0] // 'image', 'video', etc.
    const objectKey = `${rootFolder}/${folder}/${subFolder}/${filename}`

    // Upload to DigitalOcean Spaces
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: await file.arrayBuffer(),
      ACL: 'public-read',
      ContentType: mimeType,
    })

    const response = await s3Client.send(command)
    
    if (response.$metadata.httpStatusCode !== 200) {
      throw new Error('Upload failed')
    }

    // Generate the public URL
    const url = `https://${bucket}.${region}.digitaloceanspaces.com/${objectKey}`
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        url: url,
        filename: filename,
        size: file.size,
        type: mimeType
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Upload error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Upload failed' 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
}) 