import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * API Route to export user data (Right to Data Portability - LGPD Art. 18, V)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Call the export function from the database
    const { data, error } = await supabase.rpc('export_user_data', {
      p_user_id: user.id,
    })

    if (error) {
      console.error('Error exporting user data:', error)
      return NextResponse.json(
        { error: 'Erro ao exportar dados' },
        { status: 500 }
      )
    }

    // Return data as JSON for download
    const fileName = `qsmh-dados-${user.id}-${new Date().toISOString().split('T')[0]}.json`

    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('Error in export-data route:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
