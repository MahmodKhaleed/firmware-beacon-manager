
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.3";

const supabaseUrl = "https://tsdbnoghfmqbhihkpuum.supabase.co";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Extract firmware ID from request
    const url = new URL(req.url);
    const firmwareId = url.searchParams.get('id');
    
    if (!firmwareId) {
      return new Response(
        JSON.stringify({ error: 'Firmware ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing download for firmware ID: ${firmwareId}`);
    
    // First, get the firmware details to verify it exists and get the file URL
    const { data: firmware, error: fetchError } = await supabase
      .from('firmware')
      .select('file_url, name, version')
      .eq('id', firmwareId)
      .single();
    
    if (fetchError || !firmware) {
      console.error('Error fetching firmware:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Firmware not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!firmware.file_url) {
      return new Response(
        JSON.stringify({ error: 'Firmware file not available' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Call the RPC function to increment the burn count
    console.log('Incrementing burn count for firmware ID:', firmwareId);
    const { data: incrementResult, error: incrementError } = await supabase.rpc(
      'increment_firmware_burn_count', 
      { fw_id: firmwareId }
    );
    
    if (incrementError) {
      console.error('Error incrementing burn count:', incrementError);
      // We'll continue with the download even if the increment fails
    } else {
      console.log('Successfully incremented burn count');
    }

    // Get the firmware file from storage
    // The file URL is typically in the format 'bucket/path/to/file'
    // Extract the storage path from the complete URL
    const urlParts = firmware.file_url.split('/');
    // Assuming format like "https://xyz.supabase.co/storage/v1/object/public/bucket/filename"
    // We need to extract the bucket and object path
    const storagePath = urlParts.slice(urlParts.indexOf('public') + 1).join('/');
    const bucket = storagePath.split('/')[0];
    const objectPath = storagePath.split('/').slice(1).join('/');
    
    console.log(`Fetching file from bucket: ${bucket}, path: ${objectPath}`);
    
    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from(bucket)
      .download(objectPath);
      
    if (downloadError || !fileData) {
      console.error('Error downloading firmware file:', downloadError);
      return new Response(
        JSON.stringify({ error: 'Failed to download firmware file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the filename from the URL or use a default
    const fileName = objectPath.split('/').pop() || `${firmware.name}-${firmware.version}.bin`;
    
    // Return the file with appropriate headers
    return new Response(fileData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
    
  } catch (error) {
    console.error('Unexpected error in download-firmware function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
