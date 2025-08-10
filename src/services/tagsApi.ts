import { supabase } from './supabaseClient';

// News Tags API
export async function getNewsTags() {
  const { data, error } = await supabase
    .from('news_tags')
    .select('tags')
    .single();
  
  if (error) throw error;
  
  // Parse the JSON string to get the array of tags
  try {
    return JSON.parse(data.tags || '[]');
  } catch (error) {
    console.error('Error parsing news tags:', error);
    return [];
  }
}

export async function updateNewsTags(tags: string[]) {
  const updatedTags = [...new Set(tags.map(tag => tag.trim()))];
  const { error } = await supabase
    .from('news_tags')
    .upsert({ tags: JSON.stringify(updatedTags) });
  
  if (error) throw error;
  return true;
}

// Product Tags API
export async function getProductTags() {
  const { data, error } = await supabase
    .from('product_tags')
    .select('tags')
    .single();
  
  if (error) throw error;
  
  // Parse the JSON string to get the array of tags
  try {
    return JSON.parse(data.tags || '[]');
  } catch (error) {
    console.error('Error parsing product tags:', error);
    return [];
  }
}

export async function updateProductTags(tags: string[]) {
  const updatedTags = [...new Set(tags.map(tag => tag.trim()))];
  const { error } = await supabase
    .from('product_tags')
    .upsert({ tags: JSON.stringify(updatedTags) });
  
  if (error) throw error;
  return true;
} 