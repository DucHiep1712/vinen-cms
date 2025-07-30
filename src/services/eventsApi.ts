import { supabase } from './supabaseClient';

const TABLE = 'events';

export async function getEvents() {
  const { data, error } = await supabase.from(TABLE).select('*').order('occurence_timestamp', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getEventById(id: number) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
  if (error) throw error;
  console.log(data);
  return data;
}

export async function createEvent(event: any) {
  const { data, error } = await supabase.from(TABLE).insert([event]).select().single();
  if (error) throw error;
  return data;
}

export async function updateEvent(id: number, event: any) {
  const { data, error } = await supabase.from(TABLE).update(event).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteEvent(id: number) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
  return true;
} 