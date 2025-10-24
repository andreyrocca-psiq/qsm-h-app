import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH: Aceitar ou recusar convite
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const supabase = await createClient();
    const { inviteId } = await params;
    const { action } = await request.json(); // 'accept' ou 'reject'

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar o convite
    const { data: invite } = await supabase
      .from('doctor_patient')
      .select('*')
      .eq('id', inviteId)
      .single();

    if (!invite) {
      return NextResponse.json(
        { error: 'Convite não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o usuário é o paciente do convite
    if (invite.patient_id !== user.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para responder este convite' },
        { status: 403 }
      );
    }

    // Verificar se já foi aceito
    if (invite.accepted_at) {
      return NextResponse.json(
        { error: 'Este convite já foi respondido' },
        { status: 400 }
      );
    }

    if (action === 'accept') {
      // Aceitar convite
      const { error: updateError } = await supabase
        .from('doctor_patient')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', inviteId);

      if (updateError) {
        console.error('Error accepting invite:', updateError);
        return NextResponse.json(
          { error: 'Erro ao aceitar convite' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Convite aceito com sucesso!',
      });
    } else if (action === 'reject') {
      // Recusar convite (deletar)
      const { error: deleteError } = await supabase
        .from('doctor_patient')
        .delete()
        .eq('id', inviteId);

      if (deleteError) {
        console.error('Error rejecting invite:', deleteError);
        return NextResponse.json(
          { error: 'Erro ao recusar convite' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Convite recusado',
      });
    } else {
      return NextResponse.json(
        { error: 'Ação inválida' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in invite action:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Cancelar convite (médico)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const supabase = await createClient();
    const { inviteId } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar o convite
    const { data: invite } = await supabase
      .from('doctor_patient')
      .select('*')
      .eq('id', inviteId)
      .single();

    if (!invite) {
      return NextResponse.json(
        { error: 'Convite não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o usuário é o médico do convite
    if (invite.doctor_id !== user.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para cancelar este convite' },
        { status: 403 }
      );
    }

    // Deletar convite
    const { error: deleteError } = await supabase
      .from('doctor_patient')
      .delete()
      .eq('id', inviteId);

    if (deleteError) {
      console.error('Error canceling invite:', deleteError);
      return NextResponse.json(
        { error: 'Erro ao cancelar convite' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Convite cancelado',
    });
  } catch (error) {
    console.error('Error canceling invite:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
