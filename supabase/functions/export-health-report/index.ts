import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const { petId, format = 'json' } = await req.json()

    // Inicializar cliente Supabase com Service Role para bypass RLS na geração do relatório
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Buscar dados do Pet
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('*, health_records(*, health_standards_vaccines(name), health_standards_exams(name))')
      .eq('id', petId)
      .single()

    if (petError || !pet) throw new Error('Pet não encontrado')

    // 2. Lógica de Exportação
    if (format === 'pdf') {
      // Aqui integraria com uma lib de PDF como 'jspdf' ou retornaria um HTML para conversão
      return new Response(
        JSON.stringify({ message: "Geração de PDF será processada via template HTML" }),
        { headers: { "Content-Type": "application/json" } }
      )
    }

    // Retorno padrão JSON (Estruturado para interoperabilidade)
    const report = {
      metadata: {
        generated_at: new Date().toISOString(),
        source: "PetBook Health System",
        version: "1.0"
      },
      pet_info: {
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age
      },
      medical_history: pet.health_records.map((r: any) => ({
        date: r.record_date,
        type: r.record_type,
        title: r.title,
        standardized_name: r.health_standards_vaccines?.name || r.health_standards_exams?.name || null,
        notes: r.notes,
        version: r.version
      }))
    }

    return new Response(
      JSON.stringify(report),
      { headers: { "Content-Type": "application/json" } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }
})
