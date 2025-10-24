import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'


// Force dynamic rendering - required for cookies/auth
export const dynamic = 'force-dynamic';
/**
 * Get user consents
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('consent_records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching consents:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar consentimentos' },
        { status: 500 }
      )
    }

    return NextResponse.json({ consents: data })
  } catch (error) {
    console.error('Error in consents GET route:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * Update a consent (revoke or grant)
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { consentType, granted, version } = body

    if (!consentType || typeof granted !== 'boolean' || !version) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos' },
        { status: 400 }
      )
    }

    const { error } = await supabase.from('consent_records').insert({
      user_id: user.id,
      consent_type: consentType,
      granted,
      version,
      granted_at: granted ? new Date().toISOString() : null,
      revoked_at: !granted ? new Date().toISOString() : null,
    })

    if (error) {
      console.error('Error updating consent:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar consentimento' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Consentimento atualizado com sucesso',
    })
  } catch (error) {
    console.error('Error in consents PUT route:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
