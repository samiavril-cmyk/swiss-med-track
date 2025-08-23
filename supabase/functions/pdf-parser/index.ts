// Vereinfachte PDF-Parser für Debugging und schrittweise Verbesserung

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Vereinfachte Datenstrukturen
interface ProcedureData {
  name: string
  verantwortlich: number
  instruierend: number
  assistent: number
}

interface ParsedPDFData {
  user: {
    name: string
    elogbuch_stand: string
    fachgebiet: string
  }
  procedures: ProcedureData[]
}

Deno.serve(async (req) => {
  console.log('🚀 PDF Parser started - Method:', req.method)
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Authentifizierung
    const authHeader = req.headers.get('Authorization')
    console.log('🔐 Auth header present:', !!authHeader)
    
    if (!authHeader) {
      console.log('❌ No authorization header')
      return new Response(
        JSON.stringify({ error: 'Authorization header missing' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('🔑 Token length:', token.length)

    // User verification
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: { user }, error: authError } = await anonClient.auth.getUser(token)
    
    if (authError || !user) {
      console.log('❌ Auth failed:', authError?.message)
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ User authenticated:', user.id)

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders })
    }

    // File handling
    console.log('📄 Processing file upload...')
    const formData = await req.formData()
    const file = formData.get('pdf') as File

    if (!file) {
      console.log('❌ No file provided')
      return new Response(
        JSON.stringify({ error: 'No PDF file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('📁 File received:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Für jetzt verwenden wir IMMER die Test-Daten, um den Import zu testen
    console.log('🧪 Using test data for reliable import testing')
    const testData: ParsedPDFData = {
      user: {
        name: "Test Import User",
        elogbuch_stand: new Date().toLocaleDateString('de-DE'),
        fachgebiet: "Chirurgie"
      },
      procedures: [
        {
          name: "Appendektomie",
          verantwortlich: 5,
          instruierend: 2,
          assistent: 3
        },
        {
          name: "Cholezystektomie",
          verantwortlich: 4,
          instruierend: 1,
          assistent: 2
        },
        {
          name: "Hernienreparatur",
          verantwortlich: 3,
          instruierend: 0,
          assistent: 1
        }
      ]
    }

    console.log('🗃️ Test data prepared:', JSON.stringify(testData, null, 2))

    // Import in die Datenbank
    console.log('💾 Starting database import...')
    const importResult = await importProcedureData(testData, user.id)

    if (!importResult.success) {
      console.error('❌ Import failed:', importResult.error)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: importResult.error 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Import successful! Imported:', importResult.imported)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Erfolgreich ${importResult.imported} Prozeduren importiert`,
        data: {
          proceduresImported: importResult.imported,
          modulesProcessed: 1,
          userInfo: testData.user,
          testMode: true
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Server error: ' + error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function importProcedureData(data: ParsedPDFData, userId: string) {
  console.log('📋 Starting procedure import for user:', userId)
  
  try {
    // Hole alle Prozeduren aus der Datenbank
    console.log('🔍 Fetching procedures from database...')
    const { data: dbProcedures, error: fetchError } = await supabase
      .from('procedures')
      .select('id, title_de, code')
      .eq('active', true)

    if (fetchError) {
      console.error('❌ Error fetching procedures:', fetchError)
      return { success: false, imported: 0, error: 'Database fetch failed: ' + fetchError.message }
    }

    console.log(`📚 Found ${dbProcedures?.length || 0} procedures in database`)
    
    if (!dbProcedures || dbProcedures.length === 0) {
      return { success: false, imported: 0, error: 'No procedures found in database' }
    }

    // Zeige einige Beispiel-Prozeduren
    console.log('📝 Sample procedures from DB:', 
      dbProcedures.slice(0, 5).map(p => ({ id: p.id, title: p.title_de }))
    )

    let totalImported = 0

    // Verarbeite jede Prozedur aus dem PDF
    for (const procedure of data.procedures) {
      console.log(`\n🔧 Processing: "${procedure.name}"`)
      
      // Finde die passende Prozedur in der Datenbank
      const dbProcedure = findMatchingProcedure(procedure.name, dbProcedures)
      
      if (!dbProcedure) {
        console.log(`⚠️ No match found for: "${procedure.name}"`)
        continue
      }

      console.log(`✅ Matched: "${procedure.name}" -> "${dbProcedure.title_de}" (${dbProcedure.id})`)

      // Erstelle Logs für jede Rolle
      const roles = [
        { role: 'responsible', count: procedure.verantwortlich },
        { role: 'instructing', count: procedure.instruierend },
        { role: 'assistant', count: procedure.assistent }
      ]

      for (const roleData of roles) {
        if (roleData.count > 0) {
          console.log(`📝 Creating ${roleData.count} logs for role: ${roleData.role}`)
          
          for (let i = 0; i < roleData.count; i++) {
            const logEntry = {
              user_id: userId,
              procedure_id: dbProcedure.id,
              role_in_surgery: roleData.role,
              performed_date: new Date().toISOString().split('T')[0],
              hospital: 'Importiert aus eLogbuch',
              notes: `PDF Import ${data.user.elogbuch_stand} - ${i + 1}/${roleData.count}`
            }

            console.log(`  📤 Inserting log ${i + 1}/${roleData.count}:`, {
              procedure: dbProcedure.title_de,
              role: roleData.role,
              user_id: userId.substring(0, 8) + '...'
            })

            const { data: insertResult, error: insertError } = await supabase
              .from('procedure_logs')
              .insert(logEntry)
              .select('id')

            if (insertError) {
              console.error(`  ❌ Insert failed:`, insertError.message)
              console.error(`  📋 Failed data:`, logEntry)
            } else {
              totalImported++
              console.log(`  ✅ Successfully inserted log ${i + 1}/${roleData.count}`)
            }
          }
        }
      }
    }

    console.log(`🎉 Import complete! Total imported: ${totalImported}`)
    return { success: true, imported: totalImported }

  } catch (error) {
    console.error('❌ Import error:', error)
    return { success: false, imported: 0, error: 'Import failed: ' + error.message }
  }
}

function findMatchingProcedure(procedureName: string, dbProcedures: any[]) {
  const name = procedureName.toLowerCase().trim()
  
  // Direkte Übereinstimmung
  let match = dbProcedures.find(p => 
    p.title_de?.toLowerCase() === name
  )
  if (match) return match

  // Teil-Übereinstimmung
  match = dbProcedures.find(p => 
    p.title_de?.toLowerCase().includes(name) || 
    name.includes(p.title_de?.toLowerCase() || '')
  )
  if (match) return match

  // Spezielle Mapping für häufige Begriffe
  const mappings: Record<string, string> = {
    'appendektomie': 'appendektomie',
    'cholezystektomie': 'cholezystektomie',
    'hernienreparatur': 'hernienreparatur',
    'hernie': 'hernienreparatur'
  }

  const mappedName = mappings[name]
  if (mappedName) {
    match = dbProcedures.find(p => 
      p.title_de?.toLowerCase().includes(mappedName)
    )
    if (match) return match
  }

  return null
}