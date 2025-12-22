import { supabase } from "./client";
import { Database } from "./types";

type BadgeType = Database["public"]["Enums"]["badge_type"];
type PetBadge = Database["public"]["Tables"]["pet_badges"]["Row"];

/**
 * Concede um selo a um pet.
 * A unicidade é garantida pela restrição UNIQUE (pet_id, badge_type) no banco.
 * @param petId O ID do pet.
 * @param badgeType O tipo de selo a ser concedido.
 * @returns O selo concedido ou um erro.
 */
export async function awardBadge(petId: string, badgeType: BadgeType): Promise<{ data: PetBadge | null; error: any }> {
  const { data, error } = await supabase
    .from("pet_badges")
    .insert({ pet_id: petId, badge_type: badgeType })
    .select()
    .single();

  // O erro de conflito (duplicate key value) é esperado se o selo já existir.
  // Neste caso, retornamos sucesso sem o dado, pois o objetivo foi alcançado.
  if (error && error.code === "23505") { // 23505 é o código para unique_violation
    return { data: null, error: null };
  }

  return { data, error };
}

/**
 * Obtém todos os selos de um pet.
 * @param petId O ID do pet.
 * @returns Uma lista de selos ou um erro.
 */
export async function getPetBadges(petId: string): Promise<{ data: PetBadge[] | null; error: any }> {
  const { data, error } = await supabase
    .from("pet_badges")
    .select("*")
    .eq("pet_id", petId);

  return { data, error };
}

/**
 * Verifica se um pet possui um selo específico.
 * @param petId O ID do pet.
 * @param badgeType O tipo de selo a ser verificado.
 * @returns True se o pet possui o selo, false caso contrário.
 */
export async function hasBadge(petId: string, badgeType: BadgeType): Promise<boolean> {
  const { data, error } = await supabase
    .from("pet_badges")
    .select("id")
    .eq("pet_id", petId)
    .eq("badge_type", badgeType)
    .limit(1);

  if (error) {
    console.error("Erro ao verificar selo:", error);
    return false;
  }

  return data !== null && data.length > 0;
}
