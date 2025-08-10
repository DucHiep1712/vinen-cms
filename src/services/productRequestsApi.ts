import { supabase } from './supabaseClient';

export interface ProductRequest {
  id: number;
  name: string;
  username: string | null;
  phone_number: string | null;
  city: string | null;
  district: string | null;
  specific_address: string | null;
  org_type: string | null;
}

export const getProductRequests = async (): Promise<ProductRequest[]> => {
  const { data, error } = await supabase
    .from('product_requests')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    throw new Error(`Error fetching product requests: ${error.message}`);
  }

  return data || [];
};

export const deleteProductRequest = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('product_requests')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error deleting product request: ${error.message}`);
  }
}; 