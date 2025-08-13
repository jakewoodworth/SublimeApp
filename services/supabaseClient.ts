import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { KnowledgeItem } from '../types';

let supabase: SupabaseClient | null = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
} else {
  console.warn('Supabase environment variables not set. Supabase features will be disabled.');
}

export { supabase };

export async function fetchKnowledgeItems(): Promise<KnowledgeItem[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('knowledge_items')
    .select('id, content');
  if (error) {
    console.error('Error fetching knowledge items:', error);
    return [];
  }
  return data as KnowledgeItem[];
}

export async function insertKnowledgeItem(content: string): Promise<KnowledgeItem | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('knowledge_items')
    .insert({ content })
    .select()
    .single();
  if (error) {
    console.error('Error inserting knowledge item:', error);
    return null;
  }
  return data as KnowledgeItem;
}

export async function updateKnowledgeItem(item: KnowledgeItem): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('knowledge_items')
    .update({ content: item.content })
    .eq('id', item.id);
  if (error) {
    console.error('Error updating knowledge item:', error);
    return false;
  }
  return true;
}

export async function deleteKnowledgeItem(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('knowledge_items')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting knowledge item:', error);
    return false;
  }
  return true;
}
