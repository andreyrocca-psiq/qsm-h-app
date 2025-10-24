import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST: Médico convida paciente
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { patientEmail } = await request.json();

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se é médico
    const { data: doctorProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (doctorProfile?.role !== 'doctor') {
      return NextResponse.json(
        { error: 'Apenas médicos podem convidar pacientes' },
        { status: 403 }
      );
    }

    // Buscar paciente pelo email
    const { data: patients } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('role', 'patient')
      .ilike('email', patientEmail)
      .limit(1);

    if (!patients || patients.length === 0) {
      return NextResponse.json(
        { error: 'Paciente não encontrado ou email inválido' },
        { status: 404 }
      );
    }

    const patient = patients[0];

    // Verificar se já existe relação
    const { data: existing } = await supabase
      .from('doctor_patient')
      .select('id, accepted_at')
      .eq('doctor_id', user.id)
      .eq('patient_id', patient.id)
      .single();

    if (existing) {
      if (existing.accepted_at) {
        return NextResponse.json(
          { error: 'Este paciente já está vinculado a você' },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: 'Já existe um convite pendente para este paciente' },
          { status: 400 }
        );
      }
    }

    // Criar convite
    const { data: invite, error: inviteError } = await supabase
      .from('doctor_patient')
      .insert({
        doctor_id: user.id,
        patient_id: patient.id,
        invited_at: new Date().toISOString(),
        accepted_at: null,
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating invite:', inviteError);
      return NextResponse.json(
        { error: 'Erro ao criar convite' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Convite enviado para ${patient.full_name}`,
      patient: {
        id: patient.id,
        name: patient.full_name,
        email: patient.email,
      },
    });
  } catch (error) {
    console.error('Error in invite route:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET: Listar convites (médico vê enviados, paciente vê recebidos)
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    if (profile.role === 'doctor') {
      // Médico: ver convites enviados pendentes
      const { data: invites } = await supabase
        .from('doctor_patient')
        .select(`
          id,
          invited_at,
          accepted_at,
          patient_id,
          profiles!doctor_patient_patient_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .eq('doctor_id', user.id)
        .is('accepted_at', null)
        .order('invited_at', { ascending: false });

      return NextResponse.json({
        invites: invites?.map(inv => ({
          id: inv.id,
          invitedAt: inv.invited_at,
          patient: inv.profiles,
        })) || [],
      });
    } else {
      // Paciente: ver convites recebidos pendentes
      const { data: invites } = await supabase
        .from('doctor_patient')
        .select(`
          id,
          invited_at,
          accepted_at,
          doctor_id,
          profiles!doctor_patient_doctor_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .eq('patient_id', user.id)
        .is('accepted_at', null)
        .order('invited_at', { ascending: false });

      return NextResponse.json({
        invites: invites?.map(inv => ({
          id: inv.id,
          invitedAt: inv.invited_at,
          doctor: inv.profiles,
        })) || [],
      });
    }
  } catch (error) {
    console.error('Error fetching invites:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar convites' },
      { status: 500 }
    );
  }
}
