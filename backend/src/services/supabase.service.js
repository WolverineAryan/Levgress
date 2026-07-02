const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env');

let supabase = null;
if (config.supabaseUrl && config.supabaseKey) {
  try {
    supabase = createClient(config.supabaseUrl, config.supabaseKey);
    console.log('Supabase storage client initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
} else {
  console.log('Supabase credentials not configured. Base64 storage fallback will be active.');
}

const getFileExtension = (contentType) => {
  if (contentType.includes('pdf')) return 'pdf';
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'jpg';
  if (contentType.includes('gif')) return 'gif';
  if (contentType.includes('svg')) return 'svg';
  return 'bin';
};

const uploadBase64File = async (base64Data, bucketName, folderPath, defaultFileName) => {
  if (!supabase) {
    return base64Data;
  }

  try {
    // 1. Validate data URL format
    const matches = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // It is not a base64 Data URL, so it might already be an external URL or static string. Just return it!
      return base64Data;
    }

    const contentType = matches[1];
    const base64String = matches[2];
    const buffer = Buffer.from(base64String, 'base64');
    
    // Create unique filename
    const ext = getFileExtension(contentType);
    const fileName = `${defaultFileName}_${Date.now()}.${ext}`;
    const fullPath = `${folderPath}/${fileName}`;

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fullPath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fullPath);

    return urlData.publicUrl;
  } catch (err) {
    console.error('Error uploading to Supabase Storage:', err.message || err);
    // Safe fallback to original base64 data so the user request doesn't fail
    return base64Data;
  }
};

module.exports = {
  uploadBase64File,
  supabase,
};
