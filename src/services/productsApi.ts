import { supabase } from './supabaseClient';

const TABLE = 'products';

export async function getProducts() {
  const { data, error } = await supabase.from(TABLE).select('*').order('id', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getProductById(id: number) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createProduct(product: any) {
  const { data, error } = await supabase.from(TABLE).insert([product]).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: number, product: any) {
  const { data, error } = await supabase.from(TABLE).update(product).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: number) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
  return true;
}

