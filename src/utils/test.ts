import { supabase } from '../lib/supabase';
export const getAllRecords = async () => {
  const records = await supabase.from('test').select('*');
  return records.data;
};

export const adddata = async () => {
  await supabase.from('test').insert({ title: 'かきくけこ' });
};
