import { supabase } from './supabaseClient';

const TABLE = 'news';

export async function getNews() {
  const { data, error } = await supabase.from(TABLE).select('*').order('posted_timestamp', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getNewsById(id: number) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createNews(news: any) {
  const { data, error } = await supabase.from(TABLE).insert([news]).select().single();
  if (error) throw error;
  return data;
}

export async function updateNews(id: number, news: any) {
  const { data, error } = await supabase.from(TABLE).update(news).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteNews(id: number) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function getTagsForNews(newsId: number) {
  const { data, error } = await supabase
    .from('news_tags')
    .select('tag_id, tag:tag_id(label)')
    .eq('news_id', newsId);
  if (error) throw error;
  // Return array of { tag_id, tag: { label } }
  return data?.map((row: any) => ({ id: row.tag_id, label: row.tag.label }));
}

export async function updateNewsTags(newsId: number, newTagIds: number[]) {
  // 1. Fetch current tag_ids
  const { data: currentTags, error: fetchError } = await supabase
    .from('news_tags')
    .select('tag_id')
    .eq('news_id', newsId);
  if (fetchError) throw fetchError;
  const currentTagIds = (currentTags || []).map((row: any) => row.tag_id);

  // 2. Find tags to add and remove
  const toAdd = newTagIds.filter(id => !currentTagIds.includes(id));
  const toRemove = currentTagIds.filter(id => !newTagIds.includes(id));

  // 3. Insert new tags
  if (toAdd.length > 0) {
    const { error: insertError } = await supabase
      .from('news_tags')
      .insert(toAdd.map(tag_id => ({ news_id: newsId, tag_id })));
    if (insertError) throw insertError;
  }

  // 4. Delete unchecked tags
  if (toRemove.length > 0) {
    const { error: deleteError } = await supabase
      .from('news_tags')
      .delete()
      .eq('news_id', newsId)
      .in('tag_id', toRemove);
    if (deleteError) throw deleteError;
  }

  return true;
} 