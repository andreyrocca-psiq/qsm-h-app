import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * API Route to request account deletion (Right to Deletion - LGPD Art. 18, VI)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { reason, deleteType } = body

    if (deleteType === 'immediate') {
      // Hard delete - completely remove all data
      const { error: deleteError } = await supabase.rpc('delete_user_data', {
        p_user_id: user.id,
      })

      if (deleteError) {
        console.error('Error deleting user data:', deleteError)
        return NextResponse.json(
          { error: 'Erro ao excluir dados' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Conta excluída com sucesso',
      })
    } else {
      // Create deletion request (for review/delayed deletion)
      const { error: requestError } = await supabase
        .from('data_deletion_requests')
        .insert({
          user_id: user.id,
          reason: reason || null,
          status: 'pending',
        })

      if (requestError) {
        console.error('Error creating deletion request:', requestError)
        return NextResponse.json(
          { error: 'Erro ao criar solicitação de exclusão' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message:
          'Solicitação de exclusão criada. Você receberá um e-mail quando for processada.',
      })
    }
  } catch (error) {
    console.error('Error in delete-account route:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * Get deletion requests for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('data_deletion_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching deletion requests:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar solicitações' },
        { status: 500 }
      )
    }

    return NextResponse.json({ requests: data })
  } catch (error) {
    console.error('Error in delete-account GET route:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
