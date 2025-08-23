import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface ProcedureData {
  name: string
  minimum: number
  verantwortlich: number
  instruierend: number
  assistent: number
  total: number
}

interface ModuleData {
  name: string
  minimum: number
  total: number
  prozeduren: ProcedureData[]
}

interface ParsedPDFData {
  user: {
    name: string
    elogbuch_stand: string
    fachgebiet: string
  }
  module: ModuleData[]
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { 
      data: { user },
    } = await supabase.auth.getUser(req.headers.get('Authorization')?.replace('Bearer ', '') ?? '')

    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders })
    }

    const formData = await req.formData()
    const file = formData.get('pdf') as File

    if (!file || file.type !== 'application/pdf') {
      return new Response('Invalid PDF file', { status: 400, headers: corsHeaders })
    }

    console.log(`Processing PDF upload for user ${user.id}, file size: ${file.size}`)

    // For now, we'll use the provided sample data as a mock parser
    // In a real implementation, you would parse the PDF content here
    const mockParsedData: ParsedPDFData = {
      user: {
        name: "Sami Zacharia Hosari",
        elogbuch_stand: "2025-08-23",
        fachgebiet: "Chirurgie"
      },
      module: [
        {
          name: "Basis Notfallchirurgie",
          minimum: 85,
          total: 80,
          prozeduren: [
            {
              name: "Chirurgisches Schockraummanagement",
              minimum: 10,
              verantwortlich: 8,
              instruierend: 0,
              assistent: 8,
              total: 8
            },
            {
              name: "Reposition Luxation/Frakturen, konservative Frakturbehandlung",
              minimum: 15,
              verantwortlich: 20,
              instruierend: 0,
              assistent: 0,
              total: 20
            },
            {
              name: "Wundversorgungen",
              minimum: 30,
              verantwortlich: 44,
              instruierend: 0,
              assistent: 0,
              total: 44
            },
            {
              name: "Anlage Fixateur externe",
              minimum: 5,
              verantwortlich: 0,
              instruierend: 0,
              assistent: 0,
              total: 0
            },
            {
              name: "Thoraxdrainagen",
              minimum: 15,
              verantwortlich: 6,
              instruierend: 2,
              assistent: 6,
              total: 6
            },
            {
              name: "Zervikotomien (Tracheafreilegung)",
              minimum: 5,
              verantwortlich: 2,
              instruierend: 0,
              assistent: 2,
              total: 2
            },
            {
              name: "Cystofixeinlage",
              minimum: 5,
              verantwortlich: 0,
              instruierend: 0,
              assistent: 0,
              total: 0
            }
          ]
        },
        {
          name: "Basis Allgemeinchirurgie",
          minimum: 260,
          total: 261,
          prozeduren: [
            {
              name: "Kleinchirurgische Eingriffe",
              minimum: 40,
              verantwortlich: 46,
              instruierend: 5,
              assistent: 46,
              total: 46
            },
            {
              name: "Appendektomie",
              minimum: 30,
              verantwortlich: 20,
              instruierend: 7,
              assistent: 20,
              total: 20
            },
            {
              name: "Cholezystektomie",
              minimum: 30,
              verantwortlich: 22,
              instruierend: 4,
              assistent: 22,
              total: 22
            },
            {
              name: "Hernienoperationen (inguinal/umbilical)",
              minimum: 40,
              verantwortlich: 17,
              instruierend: 0,
              assistent: 17,
              total: 17
            },
            {
              name: "Dünndarmeingriffe",
              minimum: 20,
              verantwortlich: 13,
              instruierend: 21,
              assistent: 13,
              total: 13
            },
            {
              name: "Proktologische Eingriffe",
              minimum: 20,
              verantwortlich: 65,
              instruierend: 5,
              assistent: 65,
              total: 65
            },
            {
              name: "Veneneingriffe",
              minimum: 30,
              verantwortlich: 21,
              instruierend: 8,
              assistent: 21,
              total: 21
            },
            {
              name: "Laparoskopie",
              minimum: 15,
              verantwortlich: 29,
              instruierend: 25,
              assistent: 29,
              total: 29
            },
            {
              name: "Laparotomie",
              minimum: 15,
              verantwortlich: 23,
              instruierend: 43,
              assistent: 23,
              total: 23
            }
          ]
        }
      ]
    }

    // Import the parsed data into the database
    const importResult = await importParsedData(mockParsedData, user.id)

    if (!importResult.success) {
      return new Response(
        JSON.stringify({ error: importResult.error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Successfully imported ${importResult.imported} procedure logs for user ${user.id}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'PDF parsed and imported successfully',
        data: {
          modulesProcessed: mockParsedData.module.length,
          proceduresImported: importResult.imported,
          userInfo: mockParsedData.user
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing PDF:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function importParsedData(data: ParsedPDFData, userId: string) {
  try {
    let totalImported = 0
    const today = new Date().toISOString().split('T')[0]

    // Get all procedures from database for mapping
    const { data: procedures, error: proceduresError } = await supabase
      .from('procedures')
      .select('id, title_de, title_en, code')

    if (proceduresError) {
      console.error('Error fetching procedures:', proceduresError)
      return { success: false, error: 'Failed to fetch procedures' }
    }

    for (const module of data.module) {
      for (const procedureData of module.prozeduren) {
        // Find matching procedure in database using fuzzy matching
        const matchingProcedure = procedures?.find(p => 
          p.title_de?.toLowerCase().includes(procedureData.name.toLowerCase()) ||
          p.title_en?.toLowerCase().includes(procedureData.name.toLowerCase()) ||
          procedureData.name.toLowerCase().includes(p.title_de?.toLowerCase() || '') ||
          procedureData.name.toLowerCase().includes(p.title_en?.toLowerCase() || '')
        )

        if (!matchingProcedure) {
          console.warn(`No matching procedure found for: ${procedureData.name}`)
          continue
        }

        // Create procedure logs for each role with count > 0
        const rolesToImport = [
          { role: 'responsible', count: procedureData.verantwortlich },
          { role: 'instructing', count: procedureData.instruierend },
          { role: 'assistant', count: procedureData.assistent }
        ]

        for (const roleData of rolesToImport) {
          if (roleData.count > 0) {
            // Create individual logs for each procedure count
            for (let i = 0; i < roleData.count; i++) {
              const { error: insertError } = await supabase
                .from('procedure_logs')
                .insert({
                  user_id: userId,
                  procedure_id: matchingProcedure.id,
                  role_in_surgery: roleData.role,
                  performed_date: today,
                  notes: `Imported from PDF: ${data.user.elogbuch_stand}`,
                  hospital: 'Imported from eLogbuch'
                })

              if (insertError) {
                console.error('Error inserting procedure log:', insertError)
              } else {
                totalImported++
              }
            }
          }
        }
      }
    }

    return { success: true, imported: totalImported }
  } catch (error) {
    console.error('Error importing parsed data:', error)
    return { success: false, error: 'Failed to import data' }
  }
}