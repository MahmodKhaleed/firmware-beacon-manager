
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Migrates firmware content from database to Supabase Storage
 * @param firmwareId The ID of the firmware to migrate
 * @returns Promise with the migration result
 */
export async function migrateFirmwareContent(firmwareId: string): Promise<boolean> {
  try {
    // Fetch the firmware record with content
    const { data: firmware, error: fetchError } = await supabase
      .from('firmware')
      .select('id, name, version, content')
      .eq('id', firmwareId)
      .single();

    if (fetchError || !firmware) {
      console.error('Error fetching firmware for migration:', fetchError);
      return false;
    }

    // If no content to migrate or already has file_url
    if (!firmware.content) {
      console.log('No content to migrate for firmware:', firmwareId);
      return false;
    }

    // Determine file extension based on content
    const fileExt = 'bin'; // Default to .bin format
    const fileName = `${firmware.name.replace(/\s+/g, '-')}-${firmware.version.replace(/\./g, '-')}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Convert content string to Uint8Array/Blob
    // This assumes content is base64 encoded or needs other conversion
    let fileData: Blob;
    try {
      // Try to convert base64 content to binary
      const binaryString = atob(firmware.content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      fileData = new Blob([bytes]);
    } catch (e) {
      // Fallback if content is not valid base64
      console.error('Error converting content:', e);
      fileData = new Blob([firmware.content], { type: 'application/octet-stream' });
    }

    // Upload to storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('firmwares')
      .upload(filePath, fileData, {
        cacheControl: '3600',
        upsert: false
      });

    if (storageError) {
      console.error('Error uploading firmware to storage:', storageError);
      return false;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('firmwares')
      .getPublicUrl(filePath);

    // Update firmware record with file_url
    const { error: updateError } = await supabase
      .from('firmware')
      .update({ 
        file_url: publicUrl,
        content: null // Clear content after successful migration
      })
      .eq('id', firmwareId);

    if (updateError) {
      console.error('Error updating firmware record after migration:', updateError);
      return false;
    }

    console.log('Successfully migrated firmware:', firmwareId);
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
}

/**
 * Batch migrate all firmware that has content but no file_url
 */
export async function migrateAllFirmware(): Promise<{success: number, failed: number}> {
  const results = {
    success: 0,
    failed: 0
  };
  
  try {
    // Get all firmware with content but no file_url
    const { data: firmwaresToMigrate, error } = await supabase
      .from('firmware')
      .select('id')
      .is('file_url', null)
      .not('content', 'is', null);
      
    if (error || !firmwaresToMigrate) {
      console.error('Error fetching firmware for batch migration:', error);
      toast({
        title: "Migration Failed",
        description: "Could not fetch firmware records for migration",
        variant: "destructive",
      });
      return results;
    }
    
    console.log(`Found ${firmwaresToMigrate.length} firmware records to migrate`);
    
    // Process each firmware
    for (const fw of firmwaresToMigrate) {
      const success = await migrateFirmwareContent(fw.id);
      if (success) {
        results.success++;
      } else {
        results.failed++;
      }
    }
    
    toast({
      title: "Migration Complete",
      description: `Successfully migrated ${results.success} firmware files. ${results.failed} migrations failed.`,
      variant: results.failed > 0 ? "default" : "default",
    });
    
    return results;
  } catch (error) {
    console.error('Batch migration error:', error);
    toast({
      title: "Migration Error",
      description: "An unexpected error occurred during migration",
      variant: "destructive",
    });
    return results;
  }
}
