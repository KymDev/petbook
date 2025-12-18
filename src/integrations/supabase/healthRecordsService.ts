import { supabase } from './client';
import { Database } from './types';

// Tipos auxiliares para facilitar o uso
type HealthRecord = Database['public']['Tables']['health_records']['Row'];
type HealthRecordInsert = Database['public']['Tables']['health_records']['Insert'];
type HealthRecordUpdate = Database['public']['Tables']['health_records']['Update'];

/**
 * Obtém todos os registros de saúde de um pet específico.
 * @param petId O ID do pet.
 * @returns Uma lista de registros de saúde ou um erro.
 */
export async function getHealthRecords(petId: string): Promise<{ data: HealthRecord[] | null; error: any }> {
  const { data, error } = await supabase
    .from('health_records')
    .select('*')
    .eq('pet_id', petId)
    .order('record_date', { ascending: false });

  return { data, error };
}

/**
 * Cria um novo registro de saúde.
 * @param recordData Os dados do novo registro.
 * @returns O registro criado ou um erro.
 */
export async function createHealthRecord(recordData: HealthRecordInsert): Promise<{ data: HealthRecord | null; error: any }> {
  const { data, error } = await supabase
    .from('health_records')
    .insert(recordData)
    .select()
    .single();

  return { data, error };
}

/**
 * Atualiza um registro de saúde existente.
 * @param recordId O ID do registro a ser atualizado.
 * @param recordData Os dados a serem atualizados.
 * @returns O registro atualizado ou um erro.
 */
export async function updateHealthRecord(recordId: string, recordData: HealthRecordUpdate): Promise<{ data: HealthRecord | null; error: any }> {
  const { data, error } = await supabase
    .from('health_records')
    .update(recordData)
    .eq('id', recordId)
    .select()
    .single();

  return { data, error };
}

/**
 * Deleta um registro de saúde.
 * @param recordId O ID do registro a ser deletado.
 * @returns Um erro, se houver.
 */
export async function deleteHealthRecord(recordId: string): Promise<{ error: any }> {
  const { error } = await supabase
    .from('health_records')
    .delete()
    .eq('id', recordId);

  return { error };
}
