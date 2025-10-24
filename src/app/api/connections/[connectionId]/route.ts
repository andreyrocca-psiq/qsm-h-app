import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// DELETE: Remover conexão (paciente se desvincula de médico ou médico remove paciente)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  try {
    const supabase = await createClient();
    const { connectionId } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar a conexão
    const { data: connection } = await supabase
      .from('doctor_patient')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (!connection) {
      return NextResponse.json(
        { error: 'Conexão não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se o usuário é o médico ou o paciente da conexão
    if (connection.doctor_id !== user.id && connection.patient_id !== user.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para remover esta conexão' },
        { status: 403 }
      );
    }

    // Deletar conexão
    const { error: deleteError } = await supabase
      .from('doctor_patient')
      .delete()
      .eq('id', connectionId);

    if (deleteError) {
      console.error('Error removing connection:', deleteError);
      return NextResponse.json(
        { error: 'Erro ao remover conexão' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Conexão removida com sucesso',
    });
  } catch (error) {
    console.error('Error removing connection:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
