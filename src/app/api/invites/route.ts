import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering - required for cookies/auth
export const dynamic = 'force-dynamic';

// POST: Médico convida paciente
export async function POST(request: NextRequest) {
  console.log('=== POST /api/invites START ===');
  console.log('Cookies received:', request.cookies.getAll().map(c => `${c.name}=${c.value.substring(0, 20)}...`));

  try {
    const supabase = await createClient();
    const body = await request.json();
    const { patientEmail, doctorEmail } = body;

    console.log('Request body:', { patientEmail, doctorEmail });

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('Auth result:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authErrorMessage: authError?.message,
      authErrorStatus: authError?.status,
    });

    if (authError || !user) {
      console.error('AUTH FAILED - Error details:', JSON.stringify(authError, null, 2));
      return NextResponse.json(
        {
          error: 'Não autenticado',
          debug: {
            authError: authError?.message,
            cookies: request.cookies.getAll().map(c => c.name)
          }
        },
        { status: 401 }
      );
    }

    // Buscar perfil do usuário atual
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!currentProfile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    let doctorId: string;
    let patientId: string;
    let targetName: string;

    if (currentProfile.role === 'doctor') {
      // Médico convidando paciente
      if (!patientEmail) {
        return NextResponse.json(
          { error: 'Email do paciente é obrigatório' },
          { status: 400 }
        );
      }

      console.log('🔍 Buscando paciente com email:', patientEmail);

      // Buscar paciente usando a view user_profiles (que une auth.users + profiles)
      const { data: patients, error: searchError } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, role')
        .eq('role', 'patient')
        .ilike('email', patientEmail.trim())
        .limit(1);

      console.log('📊 Resultado da busca de paciente:', {
        found: patients?.length || 0,
        patients: patients,
        error: searchError
      });

      if (!patients || patients.length === 0) {
        // Buscar qualquer usuário com esse email para debug
        const { data: anyUser } = await supabase
          .from('user_profiles')
          .select('id, email, full_name, role')
          .ilike('email', patientEmail.trim())
          .limit(1);

        console.log('🔍 Busca sem filtro de role:', anyUser);

        return NextResponse.json(
          {
            error: 'Paciente não encontrado com este email',
            debug: {
              searchedEmail: patientEmail,
              foundAnyUser: !!anyUser,
              userRole: anyUser?.[0]?.role || 'nenhum',
              hint: anyUser?.[0]
                ? `Usuário encontrado mas cadastrado como ${anyUser[0].role === 'doctor' ? 'PROFISSIONAL DE SAÚDE' : anyUser[0].role}`
                : 'Nenhum usuário encontrado com este email. Verifique se já fez o cadastro.'
            }
          },
          { status: 404 }
        );
      }

      doctorId = user.id;
      patientId = patients[0].id;
      targetName = patients[0].full_name;
    } else if (currentProfile.role === 'patient') {
      // Paciente compartilhando com médico
      if (!doctorEmail) {
        return NextResponse.json(
          { error: 'Email do médico é obrigatório' },
          { status: 400 }
        );
      }

      console.log('🔍 Buscando profissional de saúde com email:', doctorEmail);

      // Buscar profissional usando a view user_profiles (que une auth.users + profiles)
      const { data: doctors, error: searchError } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, role')
        .eq('role', 'doctor')
        .ilike('email', doctorEmail.trim())
        .limit(1);

      console.log('📊 Resultado da busca de profissional:', {
        found: doctors?.length || 0,
        doctors: doctors,
        error: searchError
      });

      if (!doctors || doctors.length === 0) {
        // Buscar qualquer usuário com esse email para debug
        const { data: anyUser } = await supabase
          .from('user_profiles')
          .select('id, email, full_name, role')
          .ilike('email', doctorEmail.trim())
          .limit(1);

        console.log('🔍 Busca sem filtro de role:', anyUser);

        return NextResponse.json(
          {
            error: 'Profissional de saúde não encontrado com este email',
            debug: {
              searchedEmail: doctorEmail,
              foundAnyUser: !!anyUser,
              userRole: anyUser?.[0]?.role || 'nenhum',
              hint: anyUser?.[0]
                ? `Usuário encontrado mas cadastrado como ${anyUser[0].role === 'patient' ? 'PACIENTE' : anyUser[0].role}`
                : 'Nenhum usuário encontrado com este email. Verifique se já fez o cadastro.'
            }
          },
          { status: 404 }
        );
      }

      doctorId = doctors[0].id;
      patientId = user.id;
      targetName = doctors[0].full_name;
    } else {
      return NextResponse.json(
        { error: 'Tipo de usuário inválido' },
        { status: 403 }
      );
    }

    // Verificar se já existe relação
    const { data: existing } = await supabase
      .from('doctor_patient')
      .select('id, accepted_at')
      .eq('doctor_id', doctorId)
      .eq('patient_id', patientId)
      .single();

    if (existing) {
      if (existing.accepted_at) {
        return NextResponse.json(
          { error: 'Já existe uma conexão ativa' },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: 'Já existe um convite pendente' },
          { status: 400 }
        );
      }
    }

    // Criar convite/compartilhamento
    // Se é paciente compartilhando, já aceita automaticamente
    const { data: invite, error: inviteError } = await supabase
      .from('doctor_patient')
      .insert({
        doctor_id: doctorId,
        patient_id: patientId,
        invited_at: new Date().toISOString(),
        accepted_at: currentProfile.role === 'patient' ? new Date().toISOString() : null,
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
      message: currentProfile.role === 'doctor'
        ? `Convite enviado para ${targetName}`
        : `Compartilhamento com ${targetName} realizado com sucesso`,
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
    const supabase = await createClient();

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
