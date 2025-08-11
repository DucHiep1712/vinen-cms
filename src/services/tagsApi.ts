import { supabase } from './supabaseClient';

export type Tags = {
  id: number;
  tags: string[];
}

// News Tags API
export async function getNewsTags() {
  const { data, error } = await supabase
    .from('news_tags')
    .select('*')
    .eq('id', 1) // Always look for ID 1
    .single();
  
  if (error) throw error;
  
  // Parse the JSON string to get the array of tags
  try {
    return { id: 1, tags: JSON.parse(data.tags || '[]') }; // Always return ID 1
  } catch (error) {
    console.error('Error parsing news tags:', error);
    return { id: 1, tags: [] }; // Always return ID 1
  }
}

export async function updateNewsTags(tags: Tags) {
  const updatedTags = [...new Set(tags.tags.map(tag => tag.trim()))];
  const { error } = await supabase
    .from('news_tags')
    .upsert({ 
      id: 1, // Always use ID 1 for the single row
      tags: JSON.stringify(updatedTags) 
    });
  
  if (error) throw error;
  return true;
}

// Product Tags API - Updated for single row table
export async function getProductTags() {
  // Try to get the single row from product_tags table
  let { data, error } = await supabase
    .from('product_tags')
    .select('*')
    .eq('id', 1) // Always look for ID 1
    .single();
  
  if (error) {
    // If no row exists, create the initial row with ID 1 and empty tags
    if (error.code === 'PGRST116') {
      const { data: newData, error: insertError } = await supabase
        .from('product_tags')
        .insert({ id: 1, tags: JSON.stringify([]) })
        .select()
        .single();
      
      if (insertError) throw insertError;
      return { id: 1, tags: [] };
    }
    throw error;
  }
  
  // Parse the JSON string to get the array of tags
  try {
    return { id: 1, tags: JSON.parse(data.tags || '[]') }; // Always return ID 1
  } catch (error) {
    console.error('Error parsing product tags:', error);
    return { id: 1, tags: [] }; // Always return ID 1
  }
}

export async function updateProductTags(tags: Tags) {
  const updatedTags = [...new Set(tags.tags.map(tag => tag.trim()))];
  
  // Always update the existing row or create if it doesn't exist
  const { error } = await supabase
    .from('product_tags')
    .upsert({ 
      id: 1, // Always use ID 1 for the single row
      tags: JSON.stringify(updatedTags) 
    });
  
  if (error) throw error;
  return true;
} 