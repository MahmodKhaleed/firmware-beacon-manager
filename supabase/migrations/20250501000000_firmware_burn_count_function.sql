
-- Create a database function to increment the burn count
CREATE OR REPLACE FUNCTION public.increment_firmware_burn_count(firmware_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.firmware
  SET burn_count = COALESCE(burn_count, 0) + 1
  WHERE id = firmware_id;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.increment_firmware_burn_count TO anon;
GRANT EXECUTE ON FUNCTION public.increment_firmware_burn_count TO authenticated;

-- Add comment to explain the function's purpose
COMMENT ON FUNCTION public.increment_firmware_burn_count IS 
'Increments the burn_count field for the specified firmware by 1. This function is used to track downloads.';
